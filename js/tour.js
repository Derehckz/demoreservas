/**
 * Sistema de tour guiado expandido — Mis Cabañas
 * Incluye: tour base, tours por sección, pasos opcionales, progreso y re-apertura
 */
(function () {
    'use strict';

    const STORAGE = {
        BASE_VISTO: 'mis_reservas_tour_visto',
        PROGRESO: 'mis_reservas_tour_progreso',
        SECCIONES: 'mis_reservas_tour_secciones',
        RESERVA_VISTO: 'mis_reservas_tour_reserva_visto'
    };

    function getProgreso() {
        try {
            const s = localStorage.getItem(STORAGE.PROGRESO);
            return s ? JSON.parse(s) : { lastStep: 0, completed: false };
        } catch (_) { return { lastStep: 0, completed: false }; }
    }

    function setProgreso(obj) {
        try {
            localStorage.setItem(STORAGE.PROGRESO, JSON.stringify(obj));
        } catch (_) {}
    }

    function getSeccionesVistas() {
        try {
            const s = localStorage.getItem(STORAGE.SECCIONES);
            return s ? JSON.parse(s) : {};
        } catch (_) { return {}; }
    }

    function marcarSeccionVista(id) {
        const o = getSeccionesVistas();
        o[id] = true;
        try { localStorage.setItem(STORAGE.SECCIONES, JSON.stringify(o)); } catch (_) {}
    }

    function getDriver() {
        try {
            if (window.driver && typeof window.driver.js === 'function' && !window.driver.js.driver) {
                window.driver.js(window.driver.js);
            }
            return window.driver && window.driver.js && window.driver.js.driver;
        } catch (_) { return null; }
    }

    const CONFIG = {
        allowClose: true,
        showButtons: ['next', 'previous', 'close'],
        showProgress: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: '¡Entendido!',
        progressText: '{{current}} de {{total}}'
    };

    // ── Pasos base (tour rápido) ─────────────────────────
    function getTituloPanel() { return (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.tituloPanel) || 'Mis Cabañas'; }
    const STEPS_BASE = [
        { popover: { title: '¡Bienvenido a ' + getTituloPanel() + '!', description: 'Te guiaremos brevemente por el panel. Puedes omitir en cualquier momento con la X.' } },
        { element: '[data-tour="header"]', popover: { title: 'Panel principal', description: 'Aquí ves el título y cantidad de reservas. El menú ☰ permite cambiar contraseña, ver este tour o cerrar sesión. Tip: haz respaldos periódicos.' } },
        { element: '[data-tour="content"]', popover: { title: 'Contenido', description: 'Cada pestaña muestra información distinta. Inicio, Calendario, Alertas, Lista, y en «Más»: Mensajes, Resumen, Reportes, Gastos, Pagos y Config.' } },
        { element: '[data-tour="nav"]', popover: { title: 'Navegación', description: 'Inicio, Calendario, Alertas y Lista. Toca «Más» para el resto. El badge rojo indica alertas pendientes.' } },
        { element: '[data-tour="btn-nueva-reserva"]', popover: { title: 'Crear reserva', description: 'Pulsa este botón verde para crear una reserva en 3 pasos: cliente, fechas y pago. También puedes usar el atajo desde el panel.' } },
        { popover: { title: '¡Listo!', description: 'Ya puedes usar el sistema. Recuerda hacer respaldos desde Lista → Respaldar.' } }
    ];

    // ── Pasos opcionales (¿Sabías que...?) ────────────────
    const STEPS_OPTIONAL = [
        { popover: { title: '¿Sabías que…? Respaldos', description: 'Puedes descargar todas tus reservas en JSON desde Lista → Respaldar. Útil ante problemas o cambios de sistema.' } },
        { popover: { title: '¿Sabías que…? Cerrar sesión', description: 'Desde el menú ☰ puedes «Cerrar en todos» para invalidar sesiones en otros dispositivos (por seguridad).' } },
        { popover: { title: '¿Sabías que…? WhatsApp', description: 'En el detalle de cada reserva hay botones para enviar mensajes WhatsApp (confirmación, saldo, recordatorio).' } }
    ];

    // ── Tours por sección (requiere setVista para cambiar vista antes) ──
    const STEPS_BY_SECTION = {
        dashboard: [
            { element: '[data-tour="vista-dashboard"]', popover: { title: 'Inicio', description: 'Resumen del día: llegadas, salidas, ocupación. Bloque mensual con ingresos y ocupación por cabaña. Próximos 7 días y llegadas.' } }
        ],
        calendario: [
            { element: '[data-tour="vista-calendario"]', popover: { title: 'Calendario', description: 'Ve la ocupación por mes. Los colores indican cabaña. Toca un día para ver reservas. Usa flechas para cambiar mes.' } },
            { element: '[data-tour="vista-calendario"]', popover: { title: 'Crear desde calendario', description: 'En días disponibles, puedes iniciar una reserva tocando el día. También desde el botón verde + del panel.' } }
        ],
        alertas: [
            { element: '[data-tour="vista-alertas"]', popover: { title: 'Alertas', description: 'Llegadas hoy, salidas hoy, mañana, saldos pendientes (7 días) y sin confirmar. Toca una tarjeta para ver el detalle.' } }
        ],
        lista: [
            { element: '[data-tour="vista-lista"]', popover: { title: 'Lista de reservas', description: 'Busca por nombre o teléfono. Filtra por cabaña, estado o rango de fechas. Ordena por fecha, cliente o saldo.' } },
            { element: '[data-tour="vista-lista"]', popover: { title: 'Respaldar e importar', description: 'Respaldar descarga un JSON. Importar carga reservas desde un archivo (útil para migrar o restaurar).' } }
        ],
        mensajes: [
            { element: '[data-tour="vista-mensajes"]', popover: { title: 'Mensajes', description: 'Genera mensajes WhatsApp para tus reservas. Puedes personalizar plantillas y enviar recordatorios o confirmaciones.' } }
        ],
        resumen: [
            { element: '[data-tour="vista-resumen"]', popover: { title: 'Resumen', description: 'Este mes por cabaña: ingresos, ocupación, tinaja. Útil para métricas rápidas.' } }
        ],
        pagos: [
            { element: '[data-tour="vista-pagos"]', popover: { title: 'Pagos pendientes', description: 'Reservas con saldo por cobrar. Filtra por cabaña o mes. Desde aquí puedes abrir el detalle y registrar abonos.' } }
        ],
        gastos: [
            { element: '[data-tour="vista-gastos"]', popover: { title: 'Gastos', description: 'Luz, internet, gas, aseo, etc. por periodo (YYYY-MM) y cabaña. Puedes exportar a CSV.' } }
        ],
        config: [
            { element: '[data-tour="vista-config"]', popover: { title: 'Configuración', description: 'Nombres de cabañas, precios por noche, tinaja. Los cambios se guardan en la base de datos.' } }
        ],
        reportes: [
            { element: '[data-tour="vista-reportes"]', popover: { title: 'Reportes', description: 'Vista anual de ingresos, cobrado, reservas y ocupación. Puedes exportar a Excel.' } }
        ]
    };

    function runDriver(steps, opts) {
        const driverFn = getDriver();
        if (typeof driverFn !== 'function') return null;
        const onDestroy = opts && opts.onDestroy;
        const driverObj = driverFn({
            ...CONFIG,
            steps,
            onDestroyed: () => {
                if (opts && opts.saveProgress !== false) {
                    try { localStorage.setItem(STORAGE.BASE_VISTO, '1'); localStorage.setItem('mis_reservas_tour_visto', '1'); } catch (_) {}
                }
                if (onDestroy) onDestroy();
            }
        });
        driverObj.drive(opts && opts.startIndex);
        return driverObj;
    }

    /** Tour rápido (base) — primer ingreso o desde menú */
    function runQuickTour() {
        return runDriver(STEPS_BASE, { saveProgress: true });
    }

    /** Tour completo: base + todas las secciones (cambia vista con setVista) */
    function runFullTour(setVista) {
        const allSteps = [...STEPS_BASE];
        const sections = ['dashboard', 'calendario', 'alertas', 'lista', 'mensajes', 'resumen', 'reportes', 'pagos', 'gastos', 'config'];
        sections.forEach(s => {
            const steps = STEPS_BY_SECTION[s];
            if (steps) allSteps.push(...steps);
        });
        allSteps.push(...STEPS_OPTIONAL);
        allSteps.push({ popover: { title: '¡Fin del tour completo!', description: 'Ya conoces todas las secciones. Puedes repetir el tour desde el menú cuando quieras.' } });

        // Para tour completo con cambio de vista haría falta integrar con driver.js
        // de forma asíncrona (onNextClick que cambie vista y avance). Por simplicidad
        // mostramos todos los pasos; los que dependen de data-tour en otras vistas
        // pueden no existir aún. driver.js los omite o usa elemento centrado.
        return runDriver(allSteps, { saveProgress: true });
    }

    /** Tour de una sección concreta (contextual) */
    function runSectionTour(sectionId, setVista) {
        const steps = STEPS_BY_SECTION[sectionId];
        if (!steps || steps.length === 0) return null;
        if (setVista) setVista(sectionId);
        const t = setTimeout(() => {
            runDriver(steps, { saveProgress: false, onDestroy: () => marcarSeccionVista(sectionId) });
        }, 400);
        return () => clearTimeout(t);
    }

    /** Pasos opcionales (¿Sabías que...?) */
    function runOptionalTour() {
        return runDriver(STEPS_OPTIONAL, { saveProgress: false });
    }

    /** Comprueba si debe mostrarse tour contextual al cambiar a una sección */
    function checkContextualTour(sectionId, setVista) {
        const vistos = getSeccionesVistas();
        if (vistos[sectionId]) return;
        if (!getDriver()) return;
        runSectionTour(sectionId, null); // ya está en esa vista; marcarSeccionVista se hace en onDestroy
    }

    /** Reiniciar progreso (para volver a ver tour de primer ingreso) */
    function resetProgress() {
        try {
            localStorage.removeItem(STORAGE.BASE_VISTO);
            localStorage.removeItem(STORAGE.PROGRESO);
            localStorage.removeItem(STORAGE.SECCIONES);
        } catch (_) {}
    }

    window.MisReservasTour = {
        runQuickTour,
        runFullTour,
        runSectionTour,
        runOptionalTour,
        checkContextualTour,
        resetProgress,
        getProgreso,
        getSeccionesVistas
    };
})();
