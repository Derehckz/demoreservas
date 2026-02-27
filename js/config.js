// =============================================================
// config.js — Configuración y utilidades compartidas
// Cargado como script normal (antes de los scripts Babel/React)
// =============================================================

// @@CABANAS_START@@ (sincronizar con: npm run sync-config)
const CABANAS = {
  principal: {
    nombre: "Cabaña Principal",
    maxPersonas: 6,
    precioExtraPorPersona: 10000,
    precioUnaNoche: 80000,
    precioVariasNoches: 70000,
    precioTinaja: 25000
  },
  grande: {
    nombre: "Cabaña Grande",
    maxPersonas: 10,
    precioExtraPorPersona: 10000,
    precioUnaNoche: 120000,
    precioVariasNoches: 100000,
    precioTinaja: 30000
  }
};
const APP_CONFIG = {
  nombreNegocio: "Cabañas Eli",
  tituloPanel: "Mis Cabañas",
  urlResena: "https://www.google.com/travel/hotels/s/tdNERUvQ6SgdXaZW8"
};


/** Normaliza teléfono a solo dígitos (para búsqueda flexible: +56, espacios, guiones). */
function normalizarTelefono(t) {
  return (typeof t === 'string' ? t : String(t || '')).replace(/\D/g, '');
}

/** Formatea teléfono para wa.me: dígitos con prefijo 56 (Chile) si no tiene. Evita duplicar 56. */
function formatearTelefonoWA(tel) {
  const n = normalizarTelefono(tel);
  if (!n) return '';
  return n.startsWith('56') ? n : '56' + n;
}

// ── Constantes de tiempo ─────────────────────────────────────
const MS_PER_DAY = 86400000;
const DIAS_AVISO_RESPALDO = 7;
const DIAS_BORRADOR_EXPIRA = 2;
// Alertas: días de horizonte para saldo pendiente y sin confirmar
const DIAS_SALDO_ALERTA = 7;
const DIAS_SALDO_ALERTA_EXTENDIDO = 14;
// Sin teléfono: alertar reservas próximas en N días
const DIAS_SIN_TELEFONO_ALERTA = 7;

// ── Horarios de check-in / check-out ─────────────────────────
const HORA_CHECKIN = 16;   // 16:00
const HORA_CHECKOUT = 14;  // 14:00

/** true si la hora actual ya pasó la hora de check-out (14:00) */
function yaPasoHoraCheckout() {
  const now = new Date();
  return now.getHours() > HORA_CHECKOUT || (now.getHours() === HORA_CHECKOUT && now.getMinutes() >= 0);
}

/** true si la hora actual ya pasó la hora de check-in (16:00) */
function yaPasoHoraCheckin() {
  const now = new Date();
  return now.getHours() > HORA_CHECKIN || (now.getHours() === HORA_CHECKIN && now.getMinutes() >= 0);
}

/** true si la reserva está ocupada AHORA (considerando horas check-in/check-out) */
function reservaOcupadaAhora(r, hoyStr) {
  if (!r.fechaInicio || !r.fechaFin || r.estado === 'cancelada') return false;
  if (hoyStr < r.fechaInicio) return false;
  if (hoyStr > r.fechaFin) return false;
  if (hoyStr === r.fechaFin) return !yaPasoHoraCheckout(); // ocupada solo si aún no pasó checkout
  if (hoyStr === r.fechaInicio) return yaPasoHoraCheckin();  // ocupada solo si ya pasó check-in
  return true; // día intermedio
}

/** true si es "sale hoy" (check-out hoy y aún no pasó la hora) */
function esSalidaHoy(r, hoyStr) {
  return r.fechaFin === hoyStr && r.estado !== 'cancelada' && !yaPasoHoraCheckout();
}

// ── Utilidades de fecha ───────────────────────────────────────

/**
 * Normaliza cualquier valor de fecha a formato 'YYYY-MM-DD'.
 * Maneja: Date objects, strings YYYY-MM-DD, strings DD-MM-YYYY, strings ISO con hora.
 */
function normalizaFecha(fecha) {
  if (!fecha) return '';
  if (fecha instanceof Date && !isNaN(fecha)) {
    return fecha.toISOString().slice(0, 10);
  }
  if (typeof fecha === 'string') {
    // Ya es YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
    // ISO con hora: '2026-02-18T00:00:00.000Z'
    const iso = fecha.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (iso) return iso[1];
    // Formato DD-MM-YYYY
    const dmy = fecha.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    // Intentar parseo genérico
    const d = new Date(fecha);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }
  return '';
}

/**
 * Formatea una fecha para mostrar al usuario (locale es-CL).
 * Devuelve 'Sin fecha' si la fecha no es válida.
 */
function safeDateStr(fecha, opts) {
  if (!fecha) return 'Sin fecha';
  const fNorm = normalizaFecha(fecha);
  if (!fNorm) return 'Sin fecha';
  const d = new Date(fNorm + 'T12:00:00');
  if (isNaN(d)) return 'Sin fecha';
  return d.toLocaleDateString('es-CL', opts);
}

// ── Cálculos de reserva ───────────────────────────────────────

/** Calcula el número de noches entre dos fechas YYYY-MM-DD */
const calcularNoches = (fi, ff) =>
  (!fi || !ff) ? 0 : Math.max(0, Math.ceil((new Date(ff) - new Date(fi)) / MS_PER_DAY));

/** Suma todos los abonos de una reserva */
const calcularTotalPagado = r =>
  (r.abonos || []).reduce((s, a) => s + (parseFloat(a.monto) || 0), 0);

/** Obtiene cabañas (API si está cargada, sino config por defecto) */
const getCabanas = () => (typeof window !== 'undefined' && window.CABANAS) || CABANAS;

/** IDs de cabañas (excluye claves internas) */
const getCabanaIds = () => Object.keys(getCabanas()).filter(k => !String(k).startsWith('_'));

/** Calcula el precio total de una reserva */
const calcularPrecio = (cab, fi, ff, pers, diasTinaja) => {
  if (!cab || !fi || !ff || !pers) return 0;
  const c = getCabanas()[cab];
  if (!c) return 0;
  const n = calcularNoches(fi, ff);
  if (n <= 0) return 0;
  let t = (n === 1 ? c.precioUnaNoche : c.precioVariasNoches) * n;
  t += Math.max(0, parseInt(pers) - c.maxPersonas) * c.precioExtraPorPersona * n;
  if (diasTinaja && diasTinaja.length > 0) t += diasTinaja.length * c.precioTinaja;
  return t;
};

// calcularEstadoReserva → definido en js/lib/estadoReserva.js (cargado antes de config en index/reserva)

// ── Auth (peticiones con token) ───────────────────────────────
/** fetch con header Authorization Bearer; en 401 limpia sesión, muestra toast y redirige a login. */
const authFetch = (url, options = {}) => {
  const token = sessionStorage.getItem('mis_reservas_token') || '';
  return fetch(url, { ...options, headers: { ...options.headers, 'Authorization': `Bearer ${token}` } })
    .then(function (res) {
      if (res.status === 401) {
        sessionStorage.removeItem('mis_reservas_auth');
        sessionStorage.removeItem('mis_reservas_token');
        if (typeof showToast === 'function') showToast('Sesión expirada. Vuelve a iniciar sesión.');
        window.location.replace('login.html');
        return Promise.reject(new Error('Sesión expirada'));
      }
      return res;
    });
};

// ── Navegación ────────────────────────────────────────────────

const irReserva = (id, opts) => {
  const params = new URLSearchParams();
  if (id) params.set('id', id);
  if (opts?.fechaInicio) params.set('desde', opts.fechaInicio);
  if (opts?.duplicar) params.set('duplicar', opts.duplicar);
  const qs = params.toString();
  window.location.href = 'reserva.html' + (qs ? '?' + qs : '');
};

const cerrarSesion = () => {
  sessionStorage.removeItem('mis_reservas_auth');
  sessionStorage.removeItem('mis_reservas_token');
  window.location.replace('login.html');
};

// ── Generación de mensajes WhatsApp ──────────────────────────

function generarMsg(r, tipo) {
  const n = calcularNoches(r.fechaInicio, r.fechaFin);
  const tp = calcularTotalPagado(r);
  const saldo = (parseFloat(r.precioTotal) || 0) - tp;
  const fe  = new Date(r.fechaInicio + 'T12:00:00').toLocaleDateString('es-CL', {weekday:'long',day:'numeric',month:'long'});
  const fs2 = new Date(r.fechaFin     + 'T12:00:00').toLocaleDateString('es-CL', {weekday:'long',day:'numeric',month:'long'});
  const diasTin = [...(r.diasTinaja||[]), ...(r.tinajaAdicional||[]).map(t=>t.fecha)];
  const tinTxt  = diasTin.length > 0
    ? '\n🛁 Tinaja: ' + diasTin.map(f => new Date(f+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric'})).join(', ')
    : '';

  const cabs = getCabanas();
  const cabanaInfo = cabs[r.cabana] || Object.values(cabs)[0];
  const negocio = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.nombreNegocio) || 'Cabañas Eli';
  const urlResena = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.urlResena) || 'https://www.google.com/travel/hotels/s/tdNERUvQ6SgdXaZW8';
  if (tipo === 'confirmacion') return `Hola ${r.cliente}! 👋 Somos ${negocio}.\n\nTe confirmamos tu reserva:\n🏡 ${cabanaInfo.nombre}\n📅 Entrada: ${fe} desde las 16:00 hrs\n📅 Salida: ${fs2} hasta las 14:00 hrs\n🌙 ${n} noche${n>1?'s':''}\n👥 ${r.personas} persona${r.personas>1?'s':''}${tinTxt}\n\n💰 Total: $${(parseFloat(r.precioTotal)||0).toLocaleString('es-CL')}\n${saldo>0?`💵 Pagado: $${tp.toLocaleString('es-CL')}\n⚠️ Saldo pendiente: $${saldo.toLocaleString('es-CL')}`:'✅ Pagado completo'}\n\n¡Te esperamos! 😊`;
  if (tipo === 'recordatorio') return `Hola ${r.cliente}! Somos ${negocio} 🏡\n\nMañana es tu llegada a ${cabanaInfo.nombre}.\nCheck-in desde las 16:00 hrs · Check-out hasta las 14:00 hrs${saldo>0?`\n\n💰 Recuerda el saldo de $${saldo.toLocaleString('es-CL')}.`:''}\n\n¡Nos vemos mañana! 😊`;
  if (tipo === 'saldo') return `Hola ${r.cliente}! Somos ${negocio} 😊\n\nTe recordamos el saldo de $${saldo.toLocaleString('es-CL')} por tu reserva del ${fe}.\n¡Gracias! 🙏`;
  return `Hola ${r.cliente}! Somos ${negocio} 🏡\n\nGracias por hospedarte con nosotros, fue un placer recibirte.\n¡Esperamos verte pronto! 😊\n\n⭐ Si disfrutaste tu estadía, nos ayudaría mucho que nos dejaras una reseña:\n${urlResena}`;
}

// ── Toast (mensajes breves en pantalla) ────────────────────────

function showToast(message, type) {
  if (typeof message !== 'string') return;
  type = type === 'success' ? 'success' : 'error';
  const existing = document.getElementById('mis-reservas-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'mis-reservas-toast';
  el.setAttribute('role', 'alert');
  // En móvil: toast arriba del nav inferior para no tapar contenido; en desktop: arriba
  el.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold max-w-[90vw] min-w-0 ' +
    (type === 'success' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-red-600 shadow-red-500/30');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(function () { if (el.parentNode) el.remove(); }, 3500);
}
