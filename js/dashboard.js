// dashboard.js — Panel principal (dashboard, calendario, alertas, mensajes, resumen, pagos, lista)
// Depende de: React, ReactDOM (global), js/config.js (CABANAS, calcularNoches, calcularTotalPagado, irReserva, cerrarSesion, generarMsg, formatearTelefonoWA)

const { useState, useEffect } = React;

// ── Error Boundary ────────────────────────────────────
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Algo salió mal</h2>
                    <p className="text-gray-500 text-sm mb-6">Ocurrió un error inesperado. Intenta recargar la página.</p>
                    <button onClick={()=>window.location.reload()} className="w-full bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700">Recargar</button>
                </div>
            </div>
        );
        return this.props.children;
    }
}

// CABANAS, calcularNoches, calcularTotalPagado, irReserva, cerrarSesion, generarMsg
// → definidos en js/config.js (cargado antes de este script)

// ── Iconos ──────────────────────────────────────────
const CalIcon  = ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const HomeIcon = ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const BellIcon = ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const MsgIcon  = ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ChartIcon= ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
const DollarIcon=()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const UsersIcon= ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const PlusIcon = ()=>(<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const XIcon    = ()=>(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const EyeIcon  = ()=>(<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const EditIcon = ()=>(<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const TrashIcon= ()=>(<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>);
const DlIcon   = ()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const UpIcon   = ()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const SearchIcon=()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const CheckIcon= ()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>);
const WaIcon =()=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
const SettingsIcon= ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const ReceiptIcon= ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>);
const BarChartIcon= ()=>(<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);

// authFetch, calcularTotalPagado → definidos en js/config.js
// calcularEstadoReserva → js/lib/estadoReserva.js (considera hora check-out 14:00)

/** Tour guiado — usa MisReservasTour (js/tour.js). modo: ''|'completo'|'opcional', setVista opcional */
const iniciarTourGuia = (modo, setVista) => {
    const T = window.MisReservasTour;
    if (!T) { if (typeof showToast === 'function') showToast('Tour no disponible. Recarga la página.'); return; }
    if (modo === 'completo') T.runFullTour(setVista || (() => {}));
    else if (modo === 'opcional') T.runOptionalTour();
    else T.runQuickTour();
};

/** Estado efectivo para mostrar: calculado por fechas/pago, no solo el guardado en BD. */
const estadoReserva = r => calcularEstadoReserva(r, calcularTotalPagado(r));

const diasSaldo = typeof DIAS_SALDO_ALERTA !== 'undefined' ? DIAS_SALDO_ALERTA : 7;
const diasSaldoExt = typeof DIAS_SALDO_ALERTA_EXTENDIDO !== 'undefined' ? DIAS_SALDO_ALERTA_EXTENDIDO : 14;
const diasSinTel = typeof DIAS_SIN_TELEFONO_ALERTA !== 'undefined' ? DIAS_SIN_TELEFONO_ALERTA : 7;

/** Devuelve fechas de tinaja (diasTinaja + tinajaAdicional) */
const fechasTinaja = (r) => [...(r.diasTinaja || []), ...(r.tinajaAdicional || []).map(t => t.fecha).filter(Boolean)];

/** Calcula todas las alertas (badge, strip, vista). Incluye alertas extendidas. */
const calcularAlertas = (reservas) => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const hS = hoy.toISOString().split('T')[0];
    const msDay = (typeof MS_PER_DAY !== 'undefined' ? MS_PER_DAY : 86400000);
    const mS = new Date(hoy.getTime() + msDay).toISOString().split('T')[0];
    const t7S = new Date(hoy.getTime() + diasSaldo * msDay).toISOString().split('T')[0];
    const t14S = new Date(hoy.getTime() + diasSaldoExt * msDay).toISOString().split('T')[0];
    const tSinTel = new Date(hoy.getTime() + diasSinTel * msDay).toISOString().split('T')[0];

    const llH = reservas.filter(r => r.fechaInicio === hS && estadoReserva(r) !== 'cancelada');
    const llHPend = llH.filter(r => estadoReserva(r) === 'pendiente');
    const saH = reservas.filter(r => esSalidaHoy(r, hS));
    const llM = reservas.filter(r => r.fechaInicio === mS && estadoReserva(r) !== 'cancelada');
    const llMSaldo = llM.filter(r => (parseFloat(r.precioTotal) || 0) - calcularTotalPagado(r) > 0);
    const llIds = new Set([...llH, ...llM].map(r => r.id));

    const cS = reservas.filter(r => {
        const s = (parseFloat(r.precioTotal) || 0) - calcularTotalPagado(r);
        return s > 0 && r.fechaInicio >= hS && r.fechaInicio <= t7S && estadoReserva(r) !== 'cancelada' && !llIds.has(r.id);
    });
    const cS14 = reservas.filter(r => {
        const s = (parseFloat(r.precioTotal) || 0) - calcularTotalPagado(r);
        return s > 0 && r.fechaInicio > t7S && r.fechaInicio <= t14S && estadoReserva(r) !== 'cancelada';
    });
    const sC = reservas.filter(r => estadoReserva(r) === 'pendiente' && r.fechaInicio >= hS && r.fechaInicio <= t7S && !llIds.has(r.id));

    const sinTelefono = reservas.filter(r =>
        estadoReserva(r) !== 'cancelada' && r.fechaInicio >= hS && r.fechaInicio <= tSinTel &&
        !(r.telefono && String(r.telefono).replace(/\D/g, '').length >= 8)
    );

    const tinajaHoy = reservas.filter(r => {
        const fechas = fechasTinaja(r);
        return fechas.some(f => f === hS) && estadoReserva(r) !== 'cancelada' && (r.fechaInicio <= hS && r.fechaFin >= hS);
    });
    const tinajaMana = reservas.filter(r => {
        const fechas = fechasTinaja(r);
        return fechas.some(f => f === mS) && estadoReserva(r) !== 'cancelada' && r.fechaInicio <= mS && r.fechaFin >= mS;
    });

    const allAlertIds = new Set();
    [...llH, ...saH, ...llM, ...cS, ...sC, ...cS14, ...sinTelefono, ...tinajaHoy, ...tinajaMana].forEach(r => allAlertIds.add(r.id));
    const total = allAlertIds.size;
    return { llH, saH, llM, cS, sC, llHPend, llMSaldo, cS14, sinTelefono, tinajaHoy, tinajaMana, total };
};

const getGastosCabanasOpts = () => {
    const c = typeof getCabanas === 'function' ? getCabanas() : (window.CABANAS || CABANAS || {});
    const ids = Object.keys(c).filter(k => !k.startsWith('_'));
    return [...ids.map(id => ({ value: id, label: c[id]?.nombre || id })), { value: 'compartido', label: 'Compartido' }];
};
const GASTOS_TIPOS = [{ value: 'luz', label: 'Luz' }, { value: 'internet', label: 'Internet' }, { value: 'gas', label: 'Gas' }, { value: 'aseo', label: 'Aseo' }, { value: 'mantenimiento', label: 'Mantenimiento' }, { value: 'otro', label: 'Otro' }];

// ── App ──────────────────────────────────────────────
const THEME_KEY = 'mis_reservas_theme';
const getStoredTheme = () => {
    try { return localStorage.getItem(THEME_KEY) || ''; } catch { return ''; }
};
const prefersDark = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = (theme) => theme === 'dark' || (theme === '' && prefersDark());

const App = () => {
    const [theme, setThemeState] = useState(() => getStoredTheme());
    const dark = isDark(theme);
    useEffect(() => {
        const root = document.documentElement;
        if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    }, [dark]);
    const setTheme = (v) => { try { localStorage.setItem(THEME_KEY, v); } catch {}; setThemeState(v); };
    const toggleTheme = () => setTheme(dark ? 'light' : 'dark');

    const [reservas,    setReservas]    = useState([]);
    const [gastos,      setGastos]      = useState([]);
    const [vista,       setVista]       = useState('dashboard');
    const [mesActual,   setMesActual]   = useState(new Date());
    const [verDetalle,  setVerDetalle]  = useState(null);
    const [busqueda,    setBusqueda]    = useState('');
    const [avisoResp,   setAvisoResp]   = useState(false);
    const [loadError,   setLoadError]   = useState(false);
    const [confirmarEliminarReserva, setConfirmarEliminarReserva] = useState(null);
    const [showPassModal, setShowPassModal] = useState(false);
    const cerrarEnTodos = () => {
        if (!confirm('¿Cerrar sesión en todos los dispositivos? Tendrás que volver a iniciar sesión aquí también.')) return;
        authFetch('/.netlify/functions/logoutall', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.ok) { sessionStorage.removeItem('mis_reservas_auth'); sessionStorage.removeItem('mis_reservas_token'); showToast('Sesiones cerradas.'); window.location.replace('login.html'); }
                else showToast(data.error || 'Error');
            })
            .catch(err => showToast('Error: ' + err.message));
    };

    /** Carga la lista de reservas desde la API y actualiza estado; en error pone loadError y muestra toast.
     * Si alguna reserva está en check-in pero ya pasó la fecha/hora de check-out, se actualiza automáticamente a completada en BD. */
    const cargarReservas = ()=>{
        setLoadError(false);
        authFetch('/.netlify/functions/listarreservas')
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) { showToast('Error al cargar reservas: ' + (data?.error || 'respuesta inesperada')); setLoadError(true); return; }
                // Auto-actualizar a completada: r.estado en BD es checkin pero según fechas/hora ya debería ser completada
                const aActualizar = data.filter(r => r.estado === 'checkin' && estadoReserva(r) === 'completada');
                let resultado = data;
                if (aActualizar.length > 0) {
                    resultado = data.map(r => (aActualizar.some(u => u.id === r.id) ? { ...r, estado: 'completada' } : r));
                    setReservas(resultado);
                    // Guardar en BD en segundo plano
                    Promise.all(aActualizar.map(r => authFetch('/.netlify/functions/guardarreserva', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...r, estado: 'completada' })
                    }))).then(() => {}).catch(() => {});
                } else {
                    setReservas(resultado);
                }
                setLoadError(false);
            })
            .catch(err => { showToast('Error al cargar reservas: ' + err.message); setLoadError(true); });
    };

    const cargarGastos = ()=>{
        authFetch('/.netlify/functions/listargastos')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setGastos(data);
                else showToast('Error al cargar gastos: ' + (data?.error || ''));
            })
            .catch(err => showToast('Error al cargar gastos: ' + err.message));
    };

    useEffect(()=>{
        cargarReservas();
        cargarGastos();
        const ur=localStorage.getItem('ultimoRespaldo');
        if(!ur) localStorage.setItem('ultimoRespaldo',new Date().toISOString());
        else if(Math.floor((new Date()-new Date(ur))/(typeof MS_PER_DAY !== 'undefined' ? MS_PER_DAY : 86400000)) >= (typeof DIAS_AVISO_RESPALDO !== 'undefined' ? DIAS_AVISO_RESPALDO : 7)) setAvisoResp(true);
    },[]);

    // Tour guiado en primer ingreso
    useEffect(()=>{
        if (localStorage.getItem('mis_reservas_tour_visto') === '1') return;
        const t = setTimeout(() => iniciarTourGuia(''), 800);
        return ()=> clearTimeout(t);
    }, []);

    // Tour contextual al cambiar de sección (primeras veces)
    useEffect(()=>{
        const T = window.MisReservasTour;
        if (T && vista && vista !== 'dashboard') T.checkContextualTour(vista, null);
    }, [vista]);

    // Ya no sincronizamos reservas con localStorage, solo respaldo manual

    const exportar=()=>{
        const blob=new Blob([JSON.stringify(reservas,null,2)],{type:'application/json'});
        const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
        a.download=`reservas-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        localStorage.setItem('ultimoRespaldo',new Date().toISOString()); setAvisoResp(false);
        showToast('Respaldo descargado', 'success');
    };

    const importar=e=>{
        const f=e.target.files[0]; if(!f) return;
        e.target.value='';
        const reader=new FileReader();
        reader.onload=async ev=>{
            try{
                const d=JSON.parse(ev.target.result);
                if(!Array.isArray(d)||d.length===0){showToast('Archivo inválido o vacío');return;}
                if(!confirm(`¿Importar ${d.length} reservas a la base de datos?\n(Las existentes con el mismo ID se actualizarán)`)) return;
                let ok=0,err=0;
                for(const reserva of d){
                    try{
                        const res=await authFetch('/.netlify/functions/guardarreserva',{
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            body:JSON.stringify(reserva)
                        });
                        if(res.ok) ok++; else err++;
                    }catch{err++;}
                }
                showToast(err>0 ? `Importación: ${ok} guardadas, ${err} con error` : `Importación completa: ${ok} guardadas`, err>0 ? 'error' : 'success');
                authFetch('/.netlify/functions/listarreservas').then(r=>r.json()).then(data=>{if(Array.isArray(data))setReservas(data);});
            }catch{showToast('Archivo inválido: no es un JSON válido');}
        };
        reader.readAsText(f);
    };

    const marcarCheckIn = (r) => {
        authFetch('/.netlify/functions/guardarreserva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r, estado: 'checkin' }) })
            .then(res => res.json())
            .then(resp => {
                if (resp.error) { showToast('Error: ' + resp.error); return; }
                cargarReservas();
                showToast('Check-in realizado', 'success');
            })
            .catch(err => showToast('Error: ' + err.message));
    };
    const marcarCheckOut = (r) => {
        authFetch('/.netlify/functions/guardarreserva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r, estado: 'completada' }) })
            .then(res => res.json())
            .then(resp => {
                if (resp.error) { showToast('Error: ' + resp.error); return; }
                cargarReservas();
                showToast('Check-out realizado', 'success');
            })
            .catch(err => showToast('Error: ' + err.message));
    };

    const eliminarReserva = (r) => {
        authFetch('/.netlify/functions/eliminarreserva?id=' + encodeURIComponent(r.id), { method: 'DELETE' })
            .then(res => res.json())
            .then(resp => {
                if (resp.ok) { cargarReservas(); setVerDetalle(null); showToast('Reserva eliminada', 'success'); }
                else showToast('Error al eliminar: ' + (resp.error || 'Desconocido'));
            })
            .catch(err => showToast('Error al eliminar: ' + err.message));
    };
    const solicitarEliminarReserva = (r) => {
        setVerDetalle(null);
        setConfirmarEliminarReserva(r);
    };

    // Todos los componentes de vista → definidos al final del archivo (top-level, prop-based)

    // ─────────────────────────────────────────────────
    // RENDER PRINCIPAL
    // ─────────────────────────────────────────────────
    const { total: alertasTotal } = calcularAlertas(reservas);
    const badge = alertasTotal + (avisoResp ? 1 : 0);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors">
            <Header reservas={reservas} avisoResp={avisoResp} exportar={exportar} onVerTour={iniciarTourGuia} setVista={setVista} showPassModal={showPassModal} setShowPassModal={setShowPassModal} cerrarEnTodos={cerrarEnTodos} dark={dark} toggleTheme={toggleTheme} />
            {loadError&&(
                <div className="bg-red-50 border-b-2 border-red-200 p-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-red-800">No se pudieron cargar las reservas.</p>
                    <button onClick={cargarReservas} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 shrink-0">Reintentar</button>
                </div>
            )}
            {avisoResp&&(
                <div className="sticky top-14 z-20 bg-amber-400 border-b-2 border-amber-600 p-3 flex items-center justify-between gap-2 shadow">
                    <p className="text-sm font-bold text-amber-900">⚠️ Han pasado 7 días sin respaldo. Descarga una copia de seguridad.</p>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={exportar} className="bg-amber-800 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-amber-900">💾 Respaldar ahora</button>
                        <button onClick={()=>setAvisoResp(false)} className="text-amber-900 px-2 text-sm font-bold hover:bg-amber-300 rounded">✕</button>
                    </div>
                </div>
            )}
            <div data-tour="content" className="pb-24">
                {vista==='dashboard'  && <VistaDashboard reservas={reservas} setVista={setVista} setVerDetalle={setVerDetalle} marcarCheckIn={marcarCheckIn} marcarCheckOut={marcarCheckOut} avisoResp={avisoResp}/>}
                {vista==='calendario' && <VistaCalendario reservas={reservas} mesActual={mesActual} setMesActual={setMesActual} setVerDetalle={setVerDetalle} marcarCheckIn={marcarCheckIn} marcarCheckOut={marcarCheckOut}/>}
                {vista==='alertas'    && <VistaAlertas reservas={reservas} setVerDetalle={setVerDetalle} marcarCheckIn={marcarCheckIn} marcarCheckOut={marcarCheckOut} avisoResp={avisoResp} exportar={exportar} setAvisoResp={setAvisoResp}/>}
                {vista==='mensajes'   && <VistaMensajes reservas={reservas} setVerDetalle={setVerDetalle}/>}
                {vista==='resumen'    && <VistaResumen reservas={reservas} gastos={gastos} setVerDetalle={setVerDetalle}/>}
                {vista==='reportes'   && <VistaReportes reservas={reservas} gastos={gastos} setVerDetalle={setVerDetalle}/>}
                {vista==='gastos'     && <VistaGastos gastos={gastos} cargarGastos={cargarGastos}/>}
                {vista==='pagos'      && <VistaPagos reservas={reservas} setVerDetalle={setVerDetalle}/>}
                {vista==='lista'      && <VistaLista reservas={reservas} setVerDetalle={setVerDetalle} solicitarEliminarReserva={solicitarEliminarReserva} marcarCheckIn={marcarCheckIn} marcarCheckOut={marcarCheckOut} exportar={exportar} importar={importar} busqueda={busqueda} setBusqueda={setBusqueda}/>}
                {vista==='config'     && <VistaConfig exportar={exportar} onAbrirCambiarPass={()=>setShowPassModal(true)} onCerrarEnTodos={cerrarEnTodos} />}
            </div>
            <BottomNav vista={vista} setVista={setVista} badge={badge} />
            {/* Botón nueva reserva */}
            {/* Ocultar FAB en Config para no tapar el botón Guardar */}
            {vista !== 'config' && <button data-tour="btn-nueva-reserva" onClick={()=>irReserva(null)} className="fixed bottom-24 right-5 bg-emerald-500 text-white p-5 rounded-full shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-emerald-500/40 hover:scale-105 transition-all z-40"><PlusIcon/></button>}
            {/* Modal detalle */}
            {verDetalle&&<ModalDetalle reserva={verDetalle} onCerrar={()=>setVerDetalle(null)} setVerDetalle={setVerDetalle} setReservas={setReservas} solicitarEliminarReserva={solicitarEliminarReserva}/>}
            {confirmarEliminarReserva&&(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar reserva?</h3>
                        <p className="text-gray-600 mb-4">Se eliminará la reserva de <strong>{confirmarEliminarReserva.cliente}</strong>. Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={()=>setConfirmarEliminarReserva(null)} className="flex-1 p-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                            <button onClick={()=>{ eliminarReserva(confirmarEliminarReserva); setConfirmarEliminarReserva(null); }} className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Header y navegación (incl. cerrar en todos y cambiar contraseña) ──
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const Header = ({ reservas, avisoResp, exportar, onVerTour, setVista, showPassModal, setShowPassModal, cerrarEnTodos, dark, toggleTheme }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [sending, setSending] = useState(false);
    const showPass = showPassModal ?? false;
    const setShowPass = setShowPassModal ?? (() => {});
    const enviarCambiarPass = () => {
        if (!currentPass.trim() || !newPass.trim()) { showToast('Completa ambos campos'); return; }
        if (newPass.length < 6) { showToast('La nueva contraseña debe tener al menos 6 caracteres'); return; }
        setSending(true);
        authFetch('/.netlify/functions/cambiarpassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
        })
            .then(res => res.json())
            .then(data => {
                setSending(false);
                setShowPass(false);
                setCurrentPass('');
                setNewPass('');
                if (data.ok) showToast(data.message || 'Revisa las instrucciones.', 'success');
                else showToast(data.error || 'Error');
            })
            .catch(err => { setSending(false); showToast('Error: ' + err.message); });
    };
    return (
        <header data-tour="header" className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-700/80 shadow-sm">
            <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0" aria-hidden>🏡</span>
                    <div className="min-w-0">
                        <h1 className="font-heading font-bold text-gray-800 dark:text-stone-100 text-lg truncate">{(typeof APP_CONFIG !== 'undefined' && APP_CONFIG.tituloPanel) || 'Mis Cabañas'}</h1>
                        <p className="text-xs text-gray-500 dark:text-stone-400 truncate">{reservas.length} reservas{avisoResp&&<span className="ml-1 text-yellow-600 dark:text-yellow-500 font-bold"> · ⚠️ Respaldo pendiente</span>}</p>
                    </div>
                </div>
                <div className="relative flex items-center gap-1">
                    {toggleTheme && (
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl text-gray-600 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-700 hover:text-gray-900 dark:hover:text-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" title={dark ? 'Modo claro' : 'Modo oscuro'} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
                            {dark ? '☀️' : '🌙'}
                        </button>
                    )}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2.5 rounded-xl text-gray-600 dark:text-stone-400 hover:bg-gray-100 dark:hover:bg-stone-700 hover:text-gray-900 dark:hover:text-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Menú"
                        aria-expanded={showMenu}
                    >
                        <MenuIcon />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} aria-hidden />
                            <nav className="absolute right-0 top-full mt-1 z-50 w-56 py-2 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-gray-100 dark:border-stone-700 overflow-hidden">
                                {onVerTour && (
                                    <>
                                        <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tour guiado</p>
                                        <button onClick={() => { setShowMenu(false); onVerTour(''); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700 text-sm font-medium">
                                            <span className="text-lg">👁️</span> Tour rápido
                                        </button>
                                        <button onClick={() => { setShowMenu(false); onVerTour('completo', setVista); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700 text-sm font-medium">
                                            <span className="text-lg">📋</span> Tour completo
                                        </button>
                                        <button onClick={() => { setShowMenu(false); onVerTour('opcional'); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700 text-sm font-medium">
                                            <span className="text-lg">💡</span> ¿Sabías que…?
                                        </button>
                                    </>
                                )}
                                <button onClick={() => { setShowMenu(false); setShowPass(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700 text-sm font-medium">
                                    <span className="text-lg">🔑</span> Cambiar contraseña
                                </button>
                                <button onClick={() => { setShowMenu(false); cerrarEnTodos && cerrarEnTodos(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700 text-sm font-medium">
                                    <span className="text-lg">🔓</span> Cerrar en todos
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button onClick={() => { setShowMenu(false); cerrarSesion(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 text-sm font-medium">
                                    Salir
                                </button>
                            </nav>
                        </>
                    )}
                </div>
            </div>
            {showPass && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-gray-800 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Cambiar contraseña</h3>
                        <input type="password" value={currentPass} onChange={e=>setCurrentPass(e.target.value)} placeholder="Contraseña actual" className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition" autoComplete="current-password" />
                        <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Nueva contraseña (mín. 6)" className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition" autoComplete="new-password" />
                        <p className="text-xs text-gray-500 mb-4">Tras confirmar, actualiza LOGIN_PASSWORD en Netlify para activar la nueva contraseña.</p>
                        <div className="flex gap-2">
                            <button onClick={()=>{ setShowPass(false); setCurrentPass(''); setNewPass(''); }} className="flex-1 p-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition">Cancelar</button>
                            <button onClick={enviarCambiarPass} disabled={sending} className="flex-1 p-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-60 transition">{sending?'…':'Cambiar'}</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

const MoreIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>);
const NAV_MAIN = [
    { id: 'dashboard', Icon: HomeIcon, label: 'Inicio' },
    { id: 'calendario', Icon: CalIcon, label: 'Calendario' },
    { id: 'alertas', Icon: BellIcon, label: 'Alertas' },
    { id: 'lista', Icon: UsersIcon, label: 'Lista' },
    { id: 'more', Icon: MoreIcon, label: 'Más' }
];
const NAV_MORE = [
    { id: 'mensajes', Icon: MsgIcon, label: 'Mensajes' },
    { id: 'resumen', Icon: ChartIcon, label: 'Resumen' },
    { id: 'reportes', Icon: BarChartIcon, label: 'Reportes' },
    { id: 'gastos', Icon: ReceiptIcon, label: 'Gastos' },
    { id: 'pagos', Icon: DollarIcon, label: 'Pagos' },
    { id: 'config', Icon: SettingsIcon, label: 'Configuración' }
];
const isMoreView = (v) => ['mensajes','resumen','reportes','gastos','pagos','config'].includes(v);

const BottomNav = ({ vista, setVista, badge }) => {
    const [showMore, setShowMore] = useState(false);
    const select = (id) => {
        if (id === 'more') { setShowMore(true); return; }
        setVista(id);
        setShowMore(false);
    };
    const activeMore = isMoreView(vista);
    return (
        <>
            <nav data-tour="nav" className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-700/80 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)] safe-area-pb">
                <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
                    {NAV_MAIN.map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => select(id)}
                            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 relative touch-manipulation transition-colors rounded-xl mx-0.5 my-1.5 ${(id === 'more' ? activeMore : vista === id) ? 'text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            {id === 'alertas' && badge > 0 && (
                                <span className="absolute top-1 right-1/4 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1">
                                    {badge > 99 ? '99+' : badge}
                                </span>
                            )}
                            <Icon />
                            <span className="text-[11px] font-semibold truncate max-w-full">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>
            {showMore && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowMore(false)} aria-hidden />
                    <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-50 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-gray-100 dark:border-stone-700 py-2 overflow-hidden">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Más opciones</p>
                        {NAV_MORE.map(({ id, Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => { setVista(id); setShowMore(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${vista === id ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Icon />
                                <span className="font-medium text-sm">{label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES TOP-LEVEL (prop-based, sin dependencia de closure)
// Usan: props explícitas + globals de config.js + iconos arriba
// ═══════════════════════════════════════════════════════════════

const ModalDetalle=({reserva,onCerrar,setVerDetalle,setReservas,solicitarEliminarReserva})=>{
    const reservaSafe={id:'',cliente:'',telefono:'',cabana:reserva?.cabana==='grande'?'grande':'principal',fechaInicio:reserva?.fechaInicio&&!isNaN(new Date(reserva.fechaInicio))?reserva.fechaInicio:'',fechaFin:reserva?.fechaFin&&!isNaN(new Date(reserva.fechaFin))?reserva.fechaFin:'',personas:Number.isFinite(Number(reserva?.personas))?Number(reserva.personas):1,diasTinaja:Array.isArray(reserva?.diasTinaja)?reserva.diasTinaja:[],abonos:Array.isArray(reserva?.abonos)?reserva.abonos:[],tinajaAdicional:Array.isArray(reserva?.tinajaAdicional)?reserva.tinajaAdicional:[],precioTotal:Number.isFinite(Number(reserva?.precioTotal))?Number(reserva.precioTotal):0,notas:typeof reserva?.notas==='string'?reserva.notas:'',origen:typeof reserva?.origen==='string'?reserva.origen:'',estado:typeof reserva?.estado==='string'?reserva.estado:'pendiente',pagado:Number.isFinite(Number(reserva?.pagado))?Number(reserva.pagado):0,...reserva};
    const [r,setR]=useState(reservaSafe);
    const tp=calcularTotalPagado(r), saldo=(parseFloat(r.precioTotal)||0)-tp;
    const noches=calcularNoches(r.fechaInicio,r.fechaFin);
    const [showAbono,setShowAbono]=useState(false);
    const [showTinaja,setShowTinaja]=useState(false);
    const [nAbono,setNAbono]=useState({monto:'',metodo:'transferencia',fecha:new Date().toISOString().split('T')[0],nota:''});
    const [tinajasSel,setTinajasSel]=useState([]);
    const [saving,setSaving]=useState(false);
    const [editAbono,setEditAbono]=useState(null);
    const save=updated=>{
        setSaving(true);
        authFetch('/.netlify/functions/guardarreserva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(updated)})
        .then(res=>res.json())
        .then(resp=>{
            if(resp.error){showToast('Error al guardar: ' + resp.error);setSaving(false);return;}
            setR(updated);
            setVerDetalle(updated);
            authFetch('/.netlify/functions/listarreservas').then(r=>r.json()).then(data=>{if(Array.isArray(data)){setReservas(data);const fresh=data.find(r=>r.id===updated.id);if(fresh){setR(fresh);setVerDetalle(fresh);}}setSaving(false);});
        })
        .catch(err=>{showToast('Error al guardar: ' + err.message);setSaving(false);});
    };
    const addAbono=()=>{
        if(!nAbono.monto||parseFloat(nAbono.monto)<=0){showToast('Monto inválido');return;}
        const abonos=[...(r.abonos||[]),{id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),monto:parseFloat(nAbono.monto),metodo:nAbono.metodo,fecha:nAbono.fecha,nota:nAbono.nota}];
        const total=abonos.reduce((s,a)=>s+a.monto,0);
        const estado=calcularEstadoReserva(r,total);
        save({...r,abonos,pagado:total,estado});setNAbono({monto:'',metodo:'transferencia',fecha:new Date().toISOString().split('T')[0],nota:''});setShowAbono(false);
    };
    const delAbono=id=>{if(!confirm('¿Eliminar este abono?'))return;const abonos=(r.abonos||[]).filter(a=>a.id!==id);save({...r,abonos,pagado:abonos.reduce((s,a)=>s+(parseFloat(a.monto)||0),0)});};
    const updateAbono=(id,changes)=>{
        if(!changes.monto||parseFloat(changes.monto)<=0){showToast('Monto inválido');return;}
        const abonos=(r.abonos||[]).map(a=>a.id===id?{...a,...changes,monto:parseFloat(changes.monto)}:a);
        const total=abonos.reduce((s,a)=>s+(parseFloat(a.monto)||0),0);
        const estado=calcularEstadoReserva(r,total);
        save({...r,abonos,pagado:total,estado});setEditAbono(null);
    };
    const addTinaja=()=>{if(tinajasSel.length===0){showToast('Selecciona al menos un día');return;}const cabs=typeof getCabanas==='function'?getCabanas():CABANAS;const precio=(cabs[r.cabana]||Object.values(cabs)[0]).precioTinaja;const nuevas=tinajasSel.map(f=>({id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),fecha:f,precio}));save({...r,tinajaAdicional:[...(r.tinajaAdicional||[]),...nuevas],precioTotal:(parseFloat(r.precioTotal)||0)+tinajasSel.length*precio});setTinajasSel([]);setShowTinaja(false);};
    const delTinaja=id=>{if(!confirm('¿Quitar esta tinaja?'))return;const t=(r.tinajaAdicional||[]).find(x=>x.id===id);save({...r,tinajaAdicional:(r.tinajaAdicional||[]).filter(x=>x.id!==id),precioTotal:(parseFloat(r.precioTotal)||0)-(t?.precio||0)});};
    let diasEstadia=[];
    if(noches>0&&r.fechaInicio){const fiBase=(r.fechaInicio||'').substring(0,10);const d0=new Date(fiBase+'T12:00:00');if(!isNaN(d0)){diasEstadia=Array.from({length:noches},(_,i)=>{const f=new Date(fiBase+'T12:00:00');f.setDate(f.getDate()+i);return!isNaN(f)?f.toISOString().split('T')[0]:null;}).filter(Boolean);}}
    const estStyle={pendiente:'bg-yellow-100 text-yellow-800',confirmada:'bg-teal-100 text-teal-800',checkin:'bg-green-100 text-green-800',completada:'bg-gray-100 text-gray-700',cancelada:'bg-red-100 text-red-800'};
    const estLabel={pendiente:'⏳ Pendiente',confirmada:'✅ Confirmada',checkin:'🏠 Check-in',completada:'✔️ Completada',cancelada:'❌ Cancelada'};
    const cabs = typeof getCabanas === 'function' ? getCabanas() : CABANAS;
    const cab = cabs[r.cabana] || Object.values(cabs)[0];
    const precioNoche=noches===1?cab.precioUnaNoche:cab.precioVariasNoches;
    const baseAlojamiento=noches*precioNoche;
    const costoTinajaReserva=(r.diasTinaja||[]).length*cab.precioTinaja;
    const costoTinajaAdicional=(r.tinajaAdicional||[]).reduce((s,t)=>s+(parseFloat(t.precio)||0),0);
    const extraOtro=Math.max(0,(parseFloat(r.precioTotal)||0)-baseAlojamiento-costoTinajaReserva-costoTinajaAdicional);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-detalle-titulo">
            <div className="bg-white rounded-2xl w-full max-w-lg modal-scroll my-2">
                <div className={`p-4 rounded-t-2xl flex justify-between items-start sticky top-0 z-10 ${(function(){const ids=getCabanaIds();const i=ids.indexOf(r.cabana);const cols=['bg-green-600','bg-purple-700','bg-amber-600','bg-blue-700','bg-rose-600'];return cols[Math.max(0,i)%cols.length];})()} text-white`}>
                    <div><h2 id="modal-detalle-titulo" className="text-xl font-bold">{r.cliente}</h2><p className="text-sm opacity-80">{(typeof getCabanas==='function'?getCabanas():CABANAS)[r.cabana]?.nombre}</p></div>
                    <div className="flex items-center gap-2"><span className={`text-xs px-2 py-1 rounded-full font-bold bg-white ${estStyle[estadoReserva(r)]}`}>{estLabel[estadoReserva(r)]}</span><button onClick={onCerrar} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20" aria-label="Cerrar"><XIcon/></button></div>
                </div>
                {saving&&<div className="sticky top-[4.5rem] z-10 bg-teal-100 text-teal-800 text-center py-2 text-sm font-medium rounded-none">Guardando…</div>}
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-teal-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">📅 Entrada (16:00)</p><p className="font-bold text-sm">{safeDateStr(r.fechaInicio,{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</p></div>
                        <div className="bg-orange-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">📅 Salida (14:00)</p><p className="font-bold text-sm">{safeDateStr(r.fechaFin,{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-xl font-bold">{noches}</p><p className="text-xs text-gray-500">Noches</p></div>
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-xl font-bold">{r.personas}</p><p className="text-xs text-gray-500">Personas</p></div>
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-xl font-bold">{(r.diasTinaja?.length||0)+(r.tinajaAdicional?.length||0)}</p><p className="text-xs text-gray-500">🛁 Días</p></div>
                    </div>
                    {noches>0&&parseFloat(r.precioTotal)>0&&(<div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 space-y-1"><p className="font-bold text-gray-700 text-sm mb-1">💵 Desglose del precio</p><div className="flex justify-between"><span>{noches} noche{noches!==1?'s':''} × ${precioNoche.toLocaleString('es-CL')}</span><span className="font-medium">${baseAlojamiento.toLocaleString('es-CL')}</span></div>{costoTinajaReserva>0&&<div className="flex justify-between"><span>🛁 Tinaja reserva ({(r.diasTinaja||[]).length}d)</span><span className="font-medium">${costoTinajaReserva.toLocaleString('es-CL')}</span></div>}{costoTinajaAdicional>0&&<div className="flex justify-between"><span>🛁 Tinaja adicional ({(r.tinajaAdicional||[]).length}d)</span><span className="font-medium">${costoTinajaAdicional.toLocaleString('es-CL')}</span></div>}{(parseFloat(r.descuento)||0)>0&&<div className="flex justify-between"><span>🎁 Descuento</span><span className="font-medium text-amber-600">−${(parseFloat(r.descuento)||0).toLocaleString('es-CL')}</span></div>}{extraOtro>0&&<div className="flex justify-between"><span>👥 Extra personas / otro</span><span className="font-medium">${extraOtro.toLocaleString('es-CL')}</span></div>}<div className="flex justify-between border-t border-gray-300 pt-1 font-bold text-gray-800"><span>Total</span><span>${(parseFloat(r.precioTotal)||0).toLocaleString('es-CL')}</span></div></div>)}
                    {r.telefono&&<p className="text-gray-600">📱 {r.telefono} · <a href={`https://wa.me/${formatearTelefonoWA(r.telefono)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">Abrir WhatsApp</a></p>}
                    {r.notas&&<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-sm italic text-gray-700">📝 {r.notas}</p></div>}
                    {(r.createdAt||r.updatedAt)&&<div className="text-xs text-gray-400 space-y-0.5">{r.createdAt&&<p>📌 Creada: {new Date(r.createdAt).toLocaleString('es-CL',{dateStyle:'short',timeStyle:'short'})}</p>}{r.updatedAt&&<p>✏️ Última edición: {new Date(r.updatedAt).toLocaleString('es-CL',{dateStyle:'short',timeStyle:'short'})}</p>}</div>}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-lg">💰 Pagos</h3><button onClick={()=>setShowAbono(!showAbono)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-600">+ Abono</button></div>
                        {showAbono&&(<div className="bg-white border-2 border-green-300 rounded-xl p-3 mb-3 space-y-2"><p className="font-bold text-green-700 text-sm">Nuevo abono</p><div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">Monto</label><input type="number" value={nAbono.monto} onChange={e=>setNAbono({...nAbono,monto:e.target.value})} className="w-full p-2 text-lg font-bold border-2 border-gray-300 rounded-lg" placeholder="0"/></div><div><label className="text-xs text-gray-500">Método</label><select value={nAbono.metodo} onChange={e=>setNAbono({...nAbono,metodo:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg"><option value="transferencia">🏦 Transferencia</option><option value="efectivo">💵 Efectivo</option></select></div></div><input type="date" value={nAbono.fecha} onChange={e=>setNAbono({...nAbono,fecha:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg"/><input type="text" value={nAbono.nota} onChange={e=>setNAbono({...nAbono,nota:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg" placeholder="Nota: ej. anticipo 50%"/><div className="flex gap-2"><button onClick={()=>setShowAbono(false)} disabled={saving} className="flex-1 p-2 bg-gray-200 rounded-lg text-sm font-bold disabled:opacity-50">Cancelar</button><button onClick={addAbono} disabled={saving} className="flex-1 p-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed">{saving?'Guardando…':'Guardar'}</button></div></div>)}
                        {(r.abonos||[]).length===0?<p className="text-sm text-gray-400 text-center py-2">Sin pagos registrados</p>:<div className="space-y-2 mb-3">{(r.abonos||[]).map(a=>(<div key={a.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">{editAbono?.id===a.id?(<div className="p-2 space-y-2 border-l-4 border-teal-400"><p className="text-xs font-bold text-teal-700">✏️ Editando abono</p><div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">Monto</label><input type="number" value={editAbono.monto} onChange={e=>setEditAbono({...editAbono,monto:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm font-bold"/></div><div><label className="text-xs text-gray-500">Método</label><select value={editAbono.metodo} onChange={e=>setEditAbono({...editAbono,metodo:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"><option value="transferencia">🏦 Transferencia</option><option value="efectivo">💵 Efectivo</option></select></div></div><input type="date" value={editAbono.fecha} onChange={e=>setEditAbono({...editAbono,fecha:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"/><input type="text" value={editAbono.nota||''} onChange={e=>setEditAbono({...editAbono,nota:e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm" placeholder="Nota"/><div className="flex gap-2"><button onClick={()=>setEditAbono(null)} disabled={saving} className="flex-1 p-1.5 bg-gray-200 rounded-lg text-xs font-bold disabled:opacity-50">Cancelar</button><button onClick={()=>updateAbono(a.id,editAbono)} disabled={saving} className="flex-1 p-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold disabled:opacity-60">{saving?'Guardando…':'Guardar cambio'}</button></div></div>):(<div className="flex justify-between items-center p-2"><div><span className="font-bold text-green-700">${(parseFloat(a.monto)||0).toLocaleString('es-CL')}</span><span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{a.metodo==='transferencia'?'🏦 Transfer':'💵 Efectivo'}</span>{a.nota&&<span className="ml-1 text-xs text-gray-400 italic"> {a.nota}</span>}<p className="text-xs text-gray-400">{a.fecha}</p></div><div className="flex items-center gap-1"><button onClick={()=>setEditAbono({...a})} title="Editar" className="text-teal-400 hover:text-teal-600 p-1 text-sm">✏️</button><button onClick={()=>delAbono(a.id)} title="Eliminar" className="text-red-400 hover:text-red-600 p-1 font-bold">✕</button></div></div>)}</div>))}</div>}
                        <div className="border-t pt-3 space-y-1"><div className="flex justify-between text-sm"><span className="text-gray-500">Total:</span><span className="font-bold">${(parseFloat(r.precioTotal)||0).toLocaleString('es-CL')}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Pagado:</span><span className="font-bold text-green-600">${tp.toLocaleString('es-CL')}</span></div>{saldo>0?<div className="flex justify-between bg-red-50 border border-red-200 p-2 rounded-lg"><span className="font-bold text-red-700">Saldo:</span><span className="font-bold text-red-700">${saldo.toLocaleString('es-CL')}</span></div>:parseFloat(r.precioTotal)>0&&<div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg"><CheckIcon/><span className="font-bold text-green-700">¡Pagado completo!</span></div>}{parseFloat(r.precioTotal)>0&&<div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width:`${Math.min(100,(tp/(parseFloat(r.precioTotal)||1))*100)}%`}}/></div>}</div>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-bold">🛁 Tinaja durante estadía</h3><button onClick={()=>setShowTinaja(!showTinaja)} className="bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-teal-600">+ Agregar</button></div>
                        {(r.diasTinaja||[]).length>0&&(<div className="mb-3"><p className="text-xs text-teal-800 font-bold mb-1">Incluida en la reserva:</p><div className="space-y-1">{(r.diasTinaja||[]).map((f,i)=>(<div key={i} className="flex items-center bg-white rounded-lg p-2 border border-teal-200"><span className="text-sm">🛁 {new Date((f||'').substring(0,10)+'T12:00:00').toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'})}</span></div>))}</div></div>)}
                        <p className="text-xs text-teal-600 mb-2">Tinaja pedida después de reservar — suma al total</p>
                        {showTinaja&&(<div className="bg-white border-2 border-teal-300 rounded-xl p-3 mb-3 space-y-2"><p className="text-sm font-bold text-teal-700">Selecciona días:</p><div className="space-y-1 max-h-40 overflow-y-auto">{diasEstadia.map(f=>{const yaOrg=(r.diasTinaja||[]).includes(f);const yaAdd=(r.tinajaAdicional||[]).some(t=>t.fecha===f);if(yaOrg||yaAdd) return <div key={f} className="text-xs py-1 px-2 bg-gray-100 rounded opacity-50">✓ {new Date(f+'T12:00:00').toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'})} (incluida)</div>;return(<label key={f} className="flex items-center gap-2 py-1.5 px-2 hover:bg-teal-50 rounded cursor-pointer"><input type="checkbox" checked={tinajasSel.includes(f)} onChange={e=>setTinajasSel(e.target.checked?[...tinajasSel,f]:tinajasSel.filter(d=>d!==f))} className="w-4 h-4 accent-teal-500"/><span className="text-sm">{new Date(f+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'short'})}</span></label>);})}</div>{tinajasSel.length>0&&<p className="text-sm font-bold text-teal-700">{tinajasSel.length}d × ${(cab?.precioTinaja??0).toLocaleString('es-CL')} = <span className="text-green-700">+${(tinajasSel.length*(cab?.precioTinaja??0)).toLocaleString('es-CL')}</span></p>}<div className="flex gap-2"><button onClick={()=>{setShowTinaja(false);setTinajasSel([]);}} className="flex-1 p-2 bg-gray-200 rounded-lg text-sm font-bold">Cancelar</button><button onClick={addTinaja} className="flex-1 p-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600">Agregar</button></div></div>)}
                        {(r.tinajaAdicional||[]).length===0?<p className="text-sm text-teal-400 text-center">Sin tinaja adicional</p>:<div className="space-y-1">{(r.tinajaAdicional||[]).map(t=>(<div key={t.id} className="flex justify-between items-center bg-white rounded-lg p-2 border border-teal-200"><span className="text-sm">🛁 {new Date(t.fecha+'T12:00:00').toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'})}</span><div className="flex items-center gap-2"><span className="text-sm font-bold text-teal-700">+${t.precio.toLocaleString('es-CL')}</span><button onClick={()=>delTinaja(t.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button></div></div>))}</div>}
                    </div>
                    {(()=>{const cfg={pendiente:{t:'confirmacion',l:'📱 Enviar Confirmación'},confirmada:{t:'confirmacion',l:'📱 Reenviar Confirmación'},checkin:{t:saldo>0?'saldo':'recordatorio',l:saldo>0?'📱 Cobrar Saldo':'📱 Recordatorio Check-in'},completada:{t:'agradecimiento',l:'📱 Enviar Agradecimiento'}}[estadoReserva(r)];if(!cfg) return null;const ir=()=>{const n=formatearTelefonoWA(r.telefono);if(!n){showToast('Esta reserva no tiene teléfono registrado.');return;}window.open(`https://wa.me/${n}?text=${encodeURIComponent(generarMsg(r,cfg.t))}`,'_blank');};return <button onClick={ir} className="w-full mb-2 p-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2 text-sm">{cfg.l}</button>;})()}
                    {(()=>{
                        const hoyS=new Date().toISOString().split('T')[0];
                        const puedeCheckIn=estadoReserva(r)==='confirmada'&&r.fechaInicio===hoyS;
                        const puedeCheckOut=estadoReserva(r)==='checkin'&&r.fechaFin===hoyS;
                        return (puedeCheckIn||puedeCheckOut)&&(
                            <div className="flex gap-2 mb-2">
                                {puedeCheckIn&&<button onClick={()=>save({...r,estado:'checkin'})} disabled={saving} className="flex-1 p-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-60">🏠 Marcar check-in realizado</button>}
                                {puedeCheckOut&&<button onClick={()=>save({...r,estado:'completada'})} disabled={saving} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-60">✔️ Marcar check-out realizado</button>}
                            </div>
                        );
                    })()}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={onCerrar} className="p-3 min-h-[44px] bg-gray-100 rounded-xl font-bold hover:bg-gray-200 text-sm">Cerrar</button>
                        <button onClick={()=>irReserva(r.id)} className="p-3 min-h-[44px] bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center justify-center gap-1 text-sm"><EditIcon/>Editar</button>
                        <button onClick={()=>{onCerrar(); irReserva(null, {duplicar: r.id});}} className="p-3 min-h-[44px] col-span-2 bg-teal-100 text-teal-800 rounded-xl font-bold hover:bg-teal-200 flex items-center justify-center gap-1 text-sm">📋 Duplicar reserva</button>
                        {estadoReserva(r)==='cancelada'
                            ? <button onClick={()=>solicitarEliminarReserva(r)} disabled={saving} className="p-3 min-h-[44px] bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 flex items-center justify-center gap-1 text-sm disabled:opacity-50 col-span-2"><TrashIcon/>Eliminar</button>
                            : <button onClick={()=>{if(confirm(`¿Cancelar la reserva de ${r.cliente}?`)){save({...r,estado:'cancelada'});}}} disabled={saving} className="p-3 min-h-[44px] bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 flex items-center justify-center gap-1 text-sm disabled:opacity-50 col-span-2">❌ Cancelar</button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const VistaDashboard=({reservas,setVista,setVerDetalle,marcarCheckIn,marcarCheckOut,avisoResp})=>{
    const { llH, saH, llM, cS, sC, llHPend } = calcularAlertas(reservas);
    const hoy=new Date();hoy.setHours(0,0,0,0);
    const hS=hoy.toISOString().split('T')[0];
    const msDay = typeof MS_PER_DAY !== 'undefined' ? MS_PER_DAY : 86400000;
    const mS=new Date(hoy.getTime()+msDay).toISOString().split('T')[0];
    const t7S=new Date(hoy.getTime()+(typeof diasSaldo !== 'undefined' ? diasSaldo : 7)*msDay).toISOString().split('T')[0];
    const mIni=new Date(hoy.getFullYear(),hoy.getMonth(),1);
    const llHoy=llH;
    const saHoy=saH;
    const llMana=llM;
    const ocHoy=reservas.filter(r=>reservaOcupadaAhora(r,hS));
    const resMes=reservas.filter(r=>{ const i=new Date(r.fechaInicio); return i>=mIni&&i<=new Date(hoy.getFullYear(),hoy.getMonth()+1,0); });
    const ingMes=resMes.reduce((s,r)=>s+(parseFloat(r.precioTotal)||0),0);
    const penMes=resMes.filter(r=>estadoReserva(r)!=='cancelada').reduce((s,r)=>s+Math.max(0,(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r)),0);
    const urgentes=cS;
    const sinConf=sC;
    const cabIds=getCabanaIds();
    const prox7=Array.from({length:7},(_,i)=>{ const f=new Date(hoy); f.setDate(f.getDate()+i); const fs=f.toISOString().split('T')[0]; const oc=i===0?reservas.filter(r=>reservaOcupadaAhora(r,fs)):reservas.filter(r=>fs>=r.fechaInicio&&fs<=r.fechaFin&&estadoReserva(r)!=='cancelada'); const ocByCab={}; cabIds.forEach(id=>{ocByCab[id]=oc.some(r=>r.cabana===id);}); return {dia:f.getDate(),ds:f.toLocaleDateString('es-CL',{weekday:'short'}),ocByCab}; });
    const prox=reservas.filter(r=>r.fechaInicio>=hS&&r.fechaInicio<=t7S&&estadoReserva(r)!=='cancelada').sort((a,b)=>a.fechaInicio.localeCompare(b.fechaInicio));
    const tinajaDiasD=r=>(r.diasTinaja?.length||0)+(r.tinajaAdicional?.length||0);
    const tinajaIngD=r=>{const cabs=typeof getCabanas==='function'?getCabanas():CABANAS;const p=cabs[r.cabana]?.precioTinaja||Object.values(cabs)[0]?.precioTinaja||0;return (r.diasTinaja?.length||0)*p+(r.tinajaAdicional||[]).reduce((a,t)=>a+(parseFloat(t.precio)||0),0);};
    const tinMes=resMes.filter(r=>estadoReserva(r)!=='cancelada');
    const tinDiasM=tinMes.reduce((s,r)=>s+tinajaDiasD(r),0);
    const tinIngM=tinMes.reduce((s,r)=>s+tinajaIngD(r),0);
    const diasMes=new Date(hoy.getFullYear(),hoy.getMonth()+1,0).getDate();
    const diasOcu=cab=>Array.from({length:diasMes},(_,i)=>{const fs=new Date(hoy.getFullYear(),hoy.getMonth(),i+1).toISOString().split('T')[0];return reservas.some(r=>r.cabana===cab&&estadoReserva(r)!=='cancelada'&&fs>=r.fechaInicio&&fs<=r.fechaFin);}).filter(Boolean).length;
    const ocuByCab=Object.fromEntries(cabIds.map(id=>[id,diasOcu(id)]));
    const totalAlertas=urgentes.length+sinConf.length+llHPend.length+(avisoResp?1:0);
    return (
        <div data-tour="vista-dashboard" className="p-3 space-y-3">
            <div className="text-center py-1">
                <h1 className="text-xl font-bold text-gray-800">
                    {hoy.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}
                </h1>
            </div>
            {totalAlertas>0&&<DashboardAlertsStrip urgentes={urgentes} sinConf={sinConf} llHPend={llHPend} avisoResp={avisoResp} setVista={setVista} />}
            <DashboardHoyBlock llHoy={llHoy} saHoy={saHoy} ocHoy={ocHoy} setVerDetalle={setVerDetalle} marcarCheckIn={marcarCheckIn} marcarCheckOut={marcarCheckOut} onGoAlertas={()=>setVista('alertas')} totalAlertas={totalAlertas} llMana={llMana.length} />
            <DashboardMonthBlock
                hoy={hoy}
                resMes={resMes}
                ingMes={ingMes}
                penMes={penMes}
                tinDiasM={tinDiasM}
                tinIngM={tinIngM}
                diasMes={diasMes}
                ocuByCab={ocuByCab}
            />
            <DashboardProximosDias prox7={prox7} prox={prox} setVerDetalle={setVerDetalle} />
        </div>
    );
};

// Subcomponente: bloque "Hoy" unificado (tarjetas simplificadas + detalle)
const DashboardHoyBlock = ({ llHoy, saHoy, ocHoy, setVerDetalle, marcarCheckIn, marcarCheckOut, onGoAlertas, totalAlertas, llMana }) => {
    const tieneDetalle = llHoy.length > 0 || saHoy.length > 0 || ocHoy.length > 0;
    const cards = [
        {c:'from-teal-500 to-teal-600',e:'📥',n:llHoy.length,l:'Llegan hoy',onClick:tieneDetalle?null:onGoAlertas},
        {c:'from-orange-500 to-orange-600',e:'📤',n:saHoy.length,l:'Salen hoy',onClick:tieneDetalle?null:onGoAlertas},
        {c:'from-green-500 to-green-600',e:'🏡',n:`${ocHoy.length}/${Math.max(1,(typeof getCabanaIds==='function'?getCabanaIds():['principal','grande']).length)}`,l:'Ocupadas',onClick:null},
        {c:'from-purple-500 to-purple-600',e:'📅',n:llMana,l:'Mañana',onClick:onGoAlertas},
    ];
    if (totalAlertas>0) cards.push({c:'from-red-500 to-red-600',e:'⚠️',n:totalAlertas,l:'Atención',onClick:onGoAlertas});
    const hoyS = new Date().toISOString().split('T')[0];
    const Fila = ({ titulo, items, color, tipo }) => (
        <div className="mb-2 last:mb-0">
            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${color}`}>{titulo}</p>
            <div className="space-y-0.5">
                {items.map(r => {
                    const puedeCI = tipo === 'llegan' && estadoReserva(r) === 'confirmada' && r.fechaInicio === hoyS;
                    const puedeCO = tipo === 'salen' && estadoReserva(r) === 'checkin' && r.fechaFin === hoyS;
                    return (
                        <div key={r.id} className="flex items-center gap-1">
                            <button onClick={() => setVerDetalle(r)} className="flex-1 text-left flex justify-between items-center px-2 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm min-w-0">
                                <span className="font-medium truncate">{r.cliente}</span>
                                <span className="text-xs text-gray-500 shrink-0">{(typeof getCabanas==='function'?getCabanas():CABANAS)[r.cabana]?.nombre}</span>
                            </button>
                            {(puedeCI || puedeCO) && marcarCheckIn && marcarCheckOut && (
                                <button onClick={() => puedeCI ? marcarCheckIn(r) : marcarCheckOut(r)} className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 shrink-0" title={puedeCI ? 'Check-in realizado' : 'Check-out realizado'}>
                                    {puedeCI ? '🏠' : '✔️'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
    return (
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <h3 className="font-bold mb-3 text-gray-800">📅 Hoy</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
                {cards.map((card,i)=>(
                    <div
                        key={i}
                        onClick={()=>card.onClick && card.onClick()}
                        className={`bg-gradient-to-br ${card.c} rounded-xl p-3 text-white shadow ${card.onClick?'cursor-pointer hover:opacity-90':''}`}
                    >
                        <div className="text-2xl font-bold">{card.n}</div>
                        <div className="text-xs opacity-90">{card.l}</div>
                    </div>
                ))}
            </div>
            {tieneDetalle && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                    {llHoy.length > 0 && <Fila titulo="📥 Llegan hoy" items={llHoy} color="text-teal-700" tipo="llegan" />}
                    {saHoy.length > 0 && <Fila titulo="📤 Salen hoy" items={saHoy} color="text-orange-700" tipo="salen" />}
                    {ocHoy.length > 0 && <Fila titulo="🏡 Ocupadas ahora" items={ocHoy} color="text-green-700" />}
                </div>
            )}
        </div>
    );
};

// Subcomponente: bloque de alertas del dashboard
const DashboardAlertsStrip = ({ urgentes, sinConf, llHPend, avisoResp, setVista }) => {
    const nombrar = (arr, max = 3) => arr.slice(0, max).map(r => r.cliente?.split(' ')[0] || '?').join(', ') + (arr.length > max ? '…' : '');
    const tieneAlerta = urgentes.length > 0 || sinConf.length > 0 || llHPend.length > 0 || avisoResp;
    if (!tieneAlerta) return null;
    return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 space-y-2" role="region" aria-label="Alertas que requieren atención">
            <h3 className="font-bold text-red-800">⚠️ Requieren atención</h3>
            {llHPend.length > 0 && (
                <div onClick={() => setVista('alertas')} className="bg-white rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 border-l-4 border-red-600">
                    <p className="font-bold text-red-800">🚨 {llHPend.length} llegan hoy sin confirmar</p>
                    <p className="text-xs text-gray-600 mt-0.5">{nombrar(llHPend)}</p>
                </div>
            )}
            {urgentes.length > 0 && (
                <div onClick={() => setVista('pagos')} className="bg-white rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 border-l-4 border-red-500">
                    <p className="font-bold text-red-700">💰 {urgentes.length} con saldo pendiente (7 días)</p>
                    <p className="text-xs text-gray-600 mt-0.5">{nombrar(urgentes)}</p>
                </div>
            )}
            {sinConf.length > 0 && (
                <div onClick={() => setVista('alertas')} className="bg-white rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 border-l-4 border-amber-500">
                    <p className="font-bold text-yellow-700">⏳ {sinConf.length} sin confirmar esta semana</p>
                    <p className="text-xs text-gray-600 mt-0.5">{nombrar(sinConf)}</p>
                </div>
            )}
            {avisoResp && (
                <div onClick={() => setVista('config')} className="bg-white rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 border-l-4 border-amber-600">
                    <p className="font-bold text-amber-800">💾 Respaldo pendiente</p>
                    <p className="text-xs text-gray-600 mt-0.5">Hace más de 7 días sin respaldo</p>
                </div>
            )}
        </div>
    );
};

// Subcomponente: bloque mensual colapsable del dashboard
const DashboardMonthBlock = ({ hoy, resMes, ingMes, penMes, tinDiasM, tinIngM, diasMes, ocuByCab }) => {
    const [expandido, setExpandido] = useState(false);
    const resumen = `${resMes.length} reservas · $${(ingMes/1000).toFixed(0)}k ingresos · $${(Math.max(0,penMes)/1000).toFixed(0)}k pendiente`;
    return (
        <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
            <button onClick={()=>setExpandido(!expandido)} className="w-full text-left flex justify-between items-center">
                <h3 className="font-bold text-gray-800">
                    📊 {hoy.toLocaleDateString('es-CL',{month:'long',year:'numeric'})}
                </h3>
                <span className="text-sm text-teal-600 font-medium">{expandido ? 'Ver menos ▲' : 'Ver más ▼'}</span>
            </button>
            {!expandido ? (
                <p className="text-sm text-gray-600 mt-2">{resumen}</p>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-2 text-center mt-3">
                        <div>
                            <div className="text-2xl font-bold text-teal-600">{resMes.length}</div>
                            <div className="text-xs text-gray-500">Reservas</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-green-600">${(ingMes/1000).toFixed(0)}k</div>
                            <div className="text-xs text-gray-500">Ingresos</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-orange-600">${(Math.max(0,penMes)/1000).toFixed(0)}k</div>
                            <div className="text-xs text-gray-500">Pendiente</div>
                        </div>
                    </div>
                    {tinDiasM>0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                            <span className="text-cyan-600 font-medium">🛁 {tinDiasM} día{tinDiasM!==1?'s':''} tinaja</span>
                            <span className="font-bold text-cyan-700">+${tinIngM.toLocaleString('es-CL')}</span>
                        </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                        {(function(){const ids=getCabanaIds();const cols=['bg-green-500','bg-purple-500','bg-amber-500','bg-blue-500','bg-rose-500'];const cabs=getCabanas();return ids.map((id,i)=>({d:ocuByCab?.[id]??0,color:cols[i%cols.length],label:cabs[id]?.nombre||id}));})().map(({d,color,label})=>(
                            <div key={label} className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500 w-16 shrink-0">{label}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                    <div className={`${color} h-1.5 rounded-full`} style={{width:`${Math.round((d/diasMes)*100)}%`}} />
                                </div>
                                <span className="text-gray-600 font-medium shrink-0 w-20 text-right">{d}/{diasMes}d · {Math.round((d/diasMes)*100)}%</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Subcomponente unificado: próximos 7 días + próximas llegadas
const DashboardProximosDias = ({ prox7, prox, setVerDetalle }) => (
    <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
        <h3 className="font-bold mb-2 text-gray-800">📅 Próximos 7 días</h3>
        <div className="grid grid-cols-7 gap-1 mb-3">
            {prox7.map((d,i)=>(
                <div
                    key={i}
                    className={`text-center p-1 rounded-lg ${i===0?'bg-teal-100 border-2 border-teal-500':'bg-gray-50'}`}
                >
                    <div className="text-xs text-gray-500">{d.ds}</div>
                    <div className="font-bold text-sm">{d.dia}</div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                        {(d.ocByCab?Object.entries(d.ocByCab):[]).map(([id,oc],j)=>(oc?<div key={id} className="w-full h-1.5 rounded" style={{backgroundColor:['#4ade80','#c084fc','#fbbf24','#60a5fa','#fb7185'][j%5]}} />:null))}
                        {(!d.ocByCab||Object.values(d.ocByCab||{}).every(v=>!v))&&<div className="w-full h-1.5 bg-gray-200 rounded" />}
                    </div>
                </div>
            ))}
        </div>
        {prox.length>0 && (
            <div className="border-t border-gray-100 pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Llegadas esta semana</p>
                {prox.map(r=>(
                    <div
                        key={r.id}
                        onClick={()=>setVerDetalle(r)}
                        className="flex justify-between items-center py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm"
                    >
                        <span className="font-medium">{r.cliente}</span>
                        <span className="text-xs text-teal-600">{new Date(r.fechaInicio+'T12:00:00').toLocaleDateString('es-CL',{day:'numeric',month:'short'})} · {calcularNoches(r.fechaInicio,r.fechaFin)}n</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Helper: fecha en YYYY-MM-DD local (evita problemas de timezone)
const fechaLocal = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
};

const VistaCalendario=({reservas,mesActual,setMesActual,setVerDetalle,marcarCheckIn,marcarCheckOut})=>{
    const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    const [ocultarCanceladas,setOcultarCanceladas]=useState(true);
    const [vistaCabana,setVistaCabana]=useState('');
    const [vistaTipo,setVistaTipo]=useState('mes');
    const maxResPorDia=4;
    const hoy=new Date();hoy.setHours(0,0,0,0);
    const y=mesActual.getFullYear(),m=mesActual.getMonth();
    const nDias=new Date(y,m+1,0).getDate();
    let pd=new Date(y,m,1).getDay()-1; if(pd===-1)pd=6;
    const getResPorFecha=(fs)=>reservas.filter(r=>{
        const fi=(r.fechaInicio||'').substring(0,10),ff=(r.fechaFin||'').substring(0,10);
        if(!fi||!ff)return false;
        if(vistaCabana&&r.cabana!==vistaCabana)return false;
        if(ocultarCanceladas&&estadoReserva(r)==='cancelada')return false;
        return fs>=fi&&fs<=ff;
    });
    const getRes=(dia,mes,anio)=>{const fs=fechaLocal(anio!==undefined?anio:y,mes!==undefined?mes:m,dia);return getResPorFecha(fs);};
    const irHoy=()=>setMesActual(new Date(hoy.getFullYear(),hoy.getMonth(),1));
    const esHoyDia=(dia,mes,anio)=>hoy.getDate()===dia&&hoy.getMonth()===(mes!==undefined?mes:m)&&hoy.getFullYear()===(anio!==undefined?anio:y);
    const esPasado=(dia,mes,anio)=>new Date(anio!==undefined?anio:y,mes!==undefined?mes:m,dia)<hoy;
    const tooltipRes=r=>{
        const noches=calcularNoches(r.fechaInicio,r.fechaFin);
        const fIni=r.fechaInicio?new Date(r.fechaInicio+'T12:00:00').toLocaleDateString('es-CL'):'';
        const fFin=r.fechaFin?new Date(r.fechaFin+'T12:00:00').toLocaleDateString('es-CL'):'';
        return `${r.cliente} · ${fIni} → ${fFin} · ${noches}n · ${r.personas||1}p · ${estadoReserva(r)}`;
    };
    return (
        <div data-tour="vista-calendario" className="p-2 sm:p-4 pb-24">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={()=>setMesActual(new Date(y,m-1,1))} className="p-3 min-h-[44px] min-w-[44px] bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 touch-manipulation">←</button>
                    <h2 className="text-lg sm:text-2xl font-bold min-w-[180px] text-center">{MESES[m]} {y}</h2>
                    <button onClick={()=>setMesActual(new Date(y,m+1,1))} className="p-3 min-h-[44px] min-w-[44px] bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 touch-manipulation">→</button>
                    <button onClick={irHoy} className="p-3 min-h-[44px] px-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 touch-manipulation">Hoy</button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select value={vistaCabana} onChange={e=>setVistaCabana(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px]">
                        <option value="">Todas</option>
                        {getCabanaIds().map(id=>(<option key={id} value={id}>{getCabanas()[id]?.nombre||id}</option>))}
                    </select>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={vistaTipo==='semana'} onChange={e=>setVistaTipo(e.target.checked?'semana':'mes')} className="w-4 h-4"/>
                        Semana
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={ocultarCanceladas} onChange={e=>setOcultarCanceladas(e.target.checked)} className="w-4 h-4"/>
                        Ocultar canceladas
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {DIAS.map(d=><div key={d} className="text-center font-bold p-1 bg-gray-100 rounded text-xs">{d}</div>)}
                {vistaTipo==='mes'&&[...Array(pd)].map((_,i)=><div key={`e${i}`}/>)}
                {(vistaTipo==='semana'?(()=>{
                    const lunOffset=(hoy.getDay()+6)%7;
                    const lunDate=new Date(hoy);lunDate.setDate(hoy.getDate()-lunOffset);
                    return [...Array(7)].map((_,i)=>{const d=new Date(lunDate);d.setDate(lunDate.getDate()+i);return d;});
                })():[...Array(nDias)].map((_,i)=>i+1)).map((diaOrDate,idx)=>{
                    const dia=vistaTipo==='semana'?diaOrDate.getDate():diaOrDate;
                    const diaM=vistaTipo==='semana'?diaOrDate.getMonth():m;
                    const diaY=vistaTipo==='semana'?diaOrDate.getFullYear():y;
                    const rd=getRes(dia,diaM,diaY);
                    const esHoy=esHoyDia(dia,diaM,diaY);
                    const pasado=esPasado(dia,diaM,diaY);
                    const fechaStr=fechaLocal(diaY,diaM,dia);
                    const mostrar=rd.slice(0,maxResPorDia);
                    const extra=rd.length-maxResPorDia;
                    return (
                        <div key={fechaStr} className={`min-h-[55px] sm:min-h-[70px] p-1 border-2 rounded-lg flex flex-col ${esHoy?'border-teal-500 bg-teal-50':pasado?'border-gray-150 bg-gray-50 opacity-75':'border-gray-200'}`}>
                            <div className="font-bold text-xs sm:text-sm mb-0.5 flex-shrink-0">{dia}{vistaTipo==='semana'?` ${MESES[diaM].slice(0,3)}`:''}</div>
                            <div className="flex-1 min-h-0 overflow-hidden space-y-0.5">
                                {mostrar.map(r=>{
                                    const tieneTinaja=((r.diasTinaja||[]).length+(r.tinajaAdicional||[]).length)>0;
                                    const est=estadoReserva(r);
                                    const tieneDeuda=est!=='cancelada'&&((parseFloat(r.precioTotal)||0)-calcularTotalPagado(r))>0;
                                    const estadoIco={pendiente:'⏳',confirmada:'✅',checkin:'🏠',completada:'✔️',cancelada:'❌'}[est]||'';
                                    const hoyS=new Date().toISOString().split('T')[0];
                                    const puedeCI=est=== 'confirmada'&&r.fechaInicio===hoyS;
                                    const puedeCO=est==='checkin'&&r.fechaFin===hoyS;
                                    return (
                                        <div key={r.id} onClick={e=>{e.stopPropagation();setVerDetalle(r);}} title={tooltipRes(r)} className={`text-xs p-1 min-h-[24px] rounded cursor-pointer touch-manipulation truncate flex items-center gap-0.5 ${(function(){const ids=getCabanaIds();const i=ids.indexOf(r.cabana);const bgs=['bg-green-200 hover:bg-green-300','bg-purple-200 hover:bg-purple-300','bg-amber-200 hover:bg-amber-300','bg-blue-200 hover:bg-blue-300','bg-rose-200 hover:bg-rose-300'];return bgs[Math.max(0,i)%bgs.length];})()} ${est==='cancelada'?'opacity-40 line-through':''}`}>
                                            <span className="shrink-0">{estadoIco}</span>
                                            <span className="font-medium truncate flex-1 min-w-0">{r.cliente.split(' ')[0]}</span>
                                            {tieneTinaja&&<span>🛁</span>}{tieneDeuda&&<span>💰</span>}
                                            {(puedeCI||puedeCO)&&marcarCheckIn&&marcarCheckOut&&(
                                                <button onClick={e=>{e.stopPropagation(); puedeCI?marcarCheckIn(r):marcarCheckOut(r);}} className="shrink-0 ml-0.5 w-5 h-5 flex items-center justify-center rounded bg-white/80 hover:bg-white text-green-700 font-bold" title={puedeCI?'Check-in realizado':'Check-out realizado'}>
                                                    {puedeCI?'🏠':'✔️'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {extra>0&&<button onClick={e=>{e.stopPropagation();setVerDetalle(rd[maxResPorDia]);}} className="text-xs p-1 w-full text-left text-teal-600 hover:bg-teal-100 rounded font-medium">+{extra} más</button>}
                            </div>
                            {!rd.length&&<button onClick={()=>irReserva(null,{fechaInicio:fechaStr})} className="mt-auto text-xs p-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded w-full text-left">+ Nueva</button>}
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 justify-center text-xs text-gray-600 border-t pt-3"><div className="flex flex-col gap-1"><span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Cabaña</span>{getCabanaIds().map((id,i)=>(<div key={id} className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{backgroundColor:['#86efac','#e9d5ff','#fde68a','#93c5fd','#fda4af'][i%5]}}/><span>{getCabanas()[id]?.nombre||id}</span></div>))}</div><div className="flex flex-col gap-1"><span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Estado</span><div className="flex items-center gap-1"><span>⏳</span><span>Pendiente</span></div><div className="flex items-center gap-1"><span>✅</span><span>Confirmada</span></div><div className="flex items-center gap-1"><span>🏠</span><span>Check-in</span></div><div className="flex items-center gap-1"><span>✔️</span><span>Completada</span></div><div className="flex items-center gap-1"><span>❌</span><span>Cancelada</span></div></div><div className="flex flex-col gap-1"><span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Extras</span><div className="flex items-center gap-1"><span>🛁</span><span>Tiene tinaja</span></div><div className="flex items-center gap-1"><span>💰</span><span>Saldo pendiente</span></div></div></div>
        </div>
    );
};

const VistaAlertas = ({ reservas, setVerDetalle, marcarCheckIn, marcarCheckOut, avisoResp, exportar, setAvisoResp }) => {
    const { llH, saH, llM, cS, sC, llHPend, llMSaldo, cS14, sinTelefono, tinajaHoy, tinajaMana, total } = calcularAlertas(reservas);
    const [filtro, setFiltro] = useState('');
    const hoyS = new Date().toISOString().split('T')[0];
    const secciones = [
        { id: 'llegan-hoy-pendiente', label: 'Llegan hoy sin confirmar', emoji: '🚨', items: llHPend, tipo: 'llegada', prioridad: 0 },
        { id: 'llegan-hoy', label: 'Llegan hoy', emoji: '🎯', items: llH.filter(r => !llHPend.includes(r)), tipo: 'llegada', prioridad: 1 },
        { id: 'salen-hoy', label: 'Salen hoy', emoji: '👋', items: saH, tipo: 'salida', prioridad: 2 },
        { id: 'llegan-manana', label: 'Mañana', emoji: '📅', items: llM.filter(r => !llMSaldo.includes(r)), tipo: 'llegada', prioridad: 3 },
        { id: 'llegan-manana-saldo', label: 'Mañana con saldo', emoji: '📅💰', items: llMSaldo, tipo: 'llegada', prioridad: 4 },
        { id: 'tinaja-hoy', label: 'Tinaja hoy', emoji: '🛁', items: tinajaHoy, tipo: 'tinaja', prioridad: 5 },
        { id: 'tinaja-manana', label: 'Tinaja mañana', emoji: '🛁', items: tinajaMana, tipo: 'tinaja', prioridad: 6 },
        { id: 'saldo', label: 'Saldo pendiente (7 días)', emoji: '💰', items: cS, tipo: 'saldo', prioridad: 7 },
        { id: 'saldo-extendido', label: 'Saldo pendiente (8–14 días)', emoji: '💰', items: cS14, tipo: 'saldo', prioridad: 8 },
        { id: 'sin-confirmar', label: 'Sin confirmar', emoji: '⏳', items: sC, tipo: 'pendiente', prioridad: 9 },
        { id: 'sin-telefono', label: 'Sin teléfono', emoji: '📱', items: sinTelefono, tipo: 'sinTelefono', prioridad: 10 },
    ].filter(s => s.items.length > 0).sort((a, b) => a.prioridad - b.prioridad);
    const tieneRespaldo = !!avisoResp;
    const totalConRespaldo = total + (tieneRespaldo ? 1 : 0);
    const filtradas = filtro ? secciones.filter(s => s.id === filtro) : secciones;
    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const CardAlerta = ({ r, tipo }) => {
        const saldoR = (parseFloat(r.precioTotal) || 0) - calcularTotalPagado(r);
        const est = estadoReserva(r);
        const badgeClass = { llegada: 'bg-teal-100 text-teal-700', salida: 'bg-orange-100 text-orange-700', pendiente: 'bg-yellow-100 text-yellow-700', saldo: 'bg-red-100 text-red-700', tinaja: 'bg-blue-100 text-blue-700', sinTelefono: 'bg-amber-100 text-amber-700' }[tipo] || 'bg-gray-100 text-gray-700';
        const puedeCheckIn = est === 'confirmada' && r.fechaInicio === hoyS;
        const puedeCheckOut = est === 'checkin' && r.fechaFin === hoyS;
        return (
            <article className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm" aria-label={`Reserva de ${r.cliente}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{r.cliente}</h3>
                        <p className="text-sm text-gray-500">{(typeof getCabanas==='function'?getCabanas():CABANAS)[r.cabana]?.nombre}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                            {tipo === 'llegada' ? '📥 Llegada' : tipo === 'salida' ? '📤 Salida' : tipo === 'pendiente' ? '⏳ Sin confirmar' : tipo === 'saldo' ? '💰 Saldo' : tipo === 'tinaja' ? '🛁 Tinaja' : tipo === 'sinTelefono' ? '📱 Sin teléfono' : '💰 Saldo'}
                        </span>
                        {tipo === 'llegada' && est === 'pendiente' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">⏳ Sin confirmar</span>}
                        {tipo === 'llegada' && saldoR > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">💰 Saldo</span>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    <span>📅 {new Date(r.fechaInicio + 'T12:00:00').toLocaleDateString('es-CL')}</span>
                    <span>→ {new Date(r.fechaFin + 'T12:00:00').toLocaleDateString('es-CL')}</span>
                </div>
                {r.telefono ? <p className="text-sm text-gray-500 mb-2">📱 {r.telefono}</p> : tipo === 'sinTelefono' && <p className="text-sm text-amber-600 mb-2">⚠️ No tiene teléfono registrado</p>}
                {(tipo === 'saldo' || (tipo === 'llegada' && saldoR > 0)) && (
                    <p className="text-sm font-bold text-red-600 mb-3">Debe: ${saldoR.toLocaleString('es-CL')}</p>
                )}
                {(puedeCheckIn || puedeCheckOut) && marcarCheckIn && marcarCheckOut && (
                    <div className="flex gap-2 mb-3">
                        {puedeCheckIn && <button onClick={() => marcarCheckIn(r)} className="flex-1 p-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 min-h-[44px]">🏠 Check-in realizado</button>}
                        {puedeCheckOut && <button onClick={() => marcarCheckOut(r)} className="flex-1 p-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 min-h-[44px]">✔️ Check-out realizado</button>}
                    </div>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => setVerDetalle(r)} className="flex-1 p-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-teal-600 min-h-[44px]">
                        <EyeIcon /> Ver
                    </button>
                    <button onClick={() => irReserva(r.id)} className="flex-1 p-2.5 bg-gray-200 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-gray-300 min-h-[44px]">
                        <EditIcon /> Editar
                    </button>
                </div>
            </article>
        );
    };

    return (
        <div data-tour="vista-alertas" className="p-4 space-y-4">
            <header className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800" id="alertas-titulo">🔔 Alertas</h2>
                {totalConRespaldo > 0 && (
                    <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shrink-0" aria-label={`${totalConRespaldo} alertas`}>
                        {totalConRespaldo}
                    </div>
                )}
            </header>

            {totalConRespaldo === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <div className="flex justify-center mb-4" aria-hidden>
                        <CheckIcon />
                    </div>
                    <p className="text-xl font-medium">¡Todo tranquilo!</p>
                </div>
            ) : (
                <>
                    {/* Índice rápido */}
                    <nav className="flex flex-wrap gap-2" aria-label="Navegación por tipo de alerta">
                        {tieneRespaldo && (
                            <button
                                onClick={() => { setFiltro(''); document.getElementById('respaldo')?.scrollIntoView({ behavior: 'smooth' }); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filtro === 'respaldo' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                            >
                                💾 Respaldo (1)
                            </button>
                        )}
                        {secciones.map(({ id, label, emoji, items }) => (
                            <button
                                key={id}
                                onClick={() => { setFiltro(filtro === id ? '' : id); if (filtro !== id) scrollTo(id); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filtro === id
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {emoji} {label} ({items.length})
                            </button>
                        ))}
                    </nav>

                    {/* Respaldo pendiente */}
                    {tieneRespaldo && exportar && (
                        <section id="respaldo" className="scroll-mt-4">
                            <h3 className="text-lg font-bold mb-3 text-gray-800">💾 Respaldo pendiente</h3>
                            <div
                                onClick={() => { exportar(); setAvisoResp && setAvisoResp(false); }}
                                className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 cursor-pointer hover:bg-amber-100 transition-colors"
                            >
                                <p className="font-bold text-amber-800 mb-1">Hace más de 7 días sin respaldo</p>
                                <p className="text-sm text-amber-700">Toca para descargar una copia de seguridad ahora</p>
                            </div>
                        </section>
                    )}
                    {/* Secciones de alertas */}
                    <div className="space-y-6">
                        {filtradas.map(({ id, label, emoji, items, tipo }) => (
                            <section key={id} id={id} className="scroll-mt-4">
                                <h3 className="text-lg font-bold mb-3 text-gray-800">
                                    {emoji} {label} ({items.length})
                                </h3>
                                <div className="space-y-3">
                                    {items.map(r => <CardAlerta key={r.id} r={r} tipo={tipo} />)}
                                </div>
                            </section>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const VistaPagos=({reservas,setVerDetalle})=>{
    const [filtroCabana,setFiltroCabana]=useState('');
    const [filtroMes,setFiltroMes]=useState('');
    const deudoresBase=reservas.filter(r=>{ const s=(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r); return s>0&&estadoReserva(r)!=='cancelada'; });
    const deudores=deudoresBase.filter(r=>{
        if(filtroCabana&&r.cabana!==filtroCabana) return false;
        if(filtroMes){ const fi=(r.fechaInicio||'').substring(0,7); if(fi!==filtroMes) return false; }
        return true;
    }).sort((a,b)=>new Date(a.fechaInicio)-new Date(b.fechaInicio));
    const mesesUnicos=[...new Set(deudoresBase.map(r=>(r.fechaInicio||'').substring(0,7)))].filter(Boolean).sort().reverse();
    return (<div data-tour="vista-pagos" className="p-4"><h2 className="text-2xl font-bold mb-4">💰 Pagos Pendientes ({deudores.length})</h2><div className="mb-4 flex flex-wrap gap-2 items-center"><select value={filtroCabana} onChange={e=>setFiltroCabana(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px]"><option value="">Todas las cabañas</option>{getCabanaIds().map(id=>(<option key={id} value={id}>{getCabanas()[id]?.nombre||id}</option>))}</select><select value={filtroMes} onChange={e=>setFiltroMes(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px]"><option value="">Todos los meses</option>{mesesUnicos.map(m=>{const [y,mo]=m.split('-');const d=new Date(parseInt(y),parseInt(mo,10)-1,1);return(<option key={m} value={m}>{d.toLocaleDateString('es-CL',{month:'long',year:'numeric'})}</option>);})}</select>{(filtroCabana||filtroMes)&&<button onClick={()=>{setFiltroCabana('');setFiltroMes('');}} className="p-2 bg-gray-200 rounded-xl text-sm min-h-[44px] hover:bg-gray-300">Limpiar</button>}</div>{deudores.length===0?<div className="text-center py-12 text-gray-500"><div className="flex justify-center mb-4"><CheckIcon/></div><p className="text-xl">¡Todo al día!</p></div>:<div className="space-y-3">{deudores.map(r=>{const tp=calcularTotalPagado(r),saldo=(parseFloat(r.precioTotal)||0)-tp;const pct=parseFloat(r.precioTotal)>0?(tp/parseFloat(r.precioTotal))*100:0;return(<div key={r.id} className="bg-white border-2 border-red-200 rounded-xl p-4"><div className="flex justify-between items-start mb-2"><div><h3 className="text-xl font-bold">{r.cliente}</h3><p className="text-gray-500 text-sm">{(typeof getCabanas==='function'?getCabanas():CABANAS)[r.cabana]?.nombre}</p></div><div className="bg-red-100 px-3 py-1 rounded-full text-sm font-bold text-red-700">Debe ${saldo.toLocaleString('es-CL')}</div></div><div className="grid grid-cols-2 gap-2 text-sm mb-2"><span>📅 {new Date(r.fechaInicio+'T12:00:00').toLocaleDateString('es-CL')}</span><span>→ {new Date(r.fechaFin+'T12:00:00').toLocaleDateString('es-CL')}</span></div><div className="bg-gray-50 p-3 rounded-lg mb-3"><div className="grid grid-cols-3 gap-2 text-center text-sm"><div><p className="text-xs text-gray-500">Total</p><p className="font-bold">${(parseFloat(r.precioTotal)||0).toLocaleString('es-CL')}</p></div><div><p className="text-xs text-gray-500">Pagado</p><p className="font-bold text-green-600">${tp.toLocaleString('es-CL')}</p></div><div><p className="text-xs text-gray-500">Saldo</p><p className="font-bold text-red-600">${saldo.toLocaleString('es-CL')}</p></div></div><div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-green-500 h-2 rounded-full" style={{width:`${Math.min(100,pct)}%`}}/></div></div><div className="flex gap-2"><button onClick={()=>setVerDetalle({...r})} className="flex-1 p-2 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm hover:bg-teal-600 min-h-[44px]"><EyeIcon/>Ver</button><button onClick={()=>irReserva(r.id)} className="flex-1 p-2 bg-gray-200 rounded-lg font-bold flex items-center justify-center gap-1 text-sm hover:bg-gray-300 min-h-[44px]"><EditIcon/>Editar</button></div></div>);})}</div>}</div>);
};

const VistaGastos = ({ gastos, cargarGastos }) => {
    const hoy = new Date();
    const periodoActual = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [filtroCabana, setFiltroCabana] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(() => ({ cabana: 'principal', tipo: 'luz', monto: '', periodo: periodoActual, nota: '', fechaPago: '' }));
    const [saving, setSaving] = useState(false);
    const [confirmarEliminarGasto, setConfirmarEliminarGasto] = useState(null);

    const periodosUnicos = [...new Set(gastos.map(g => g.periodo))].filter(Boolean).sort().reverse();
    const filtered = gastos.filter(g => {
        if (filtroPeriodo && g.periodo !== filtroPeriodo) return false;
        if (filtroCabana && g.cabana !== filtroCabana) return false;
        if (filtroTipo && g.tipo !== filtroTipo) return false;
        return true;
    });
    const totalFiltrado = filtered.reduce((s, g) => s + (Number(g.monto) || 0), 0);

    const openNew = () => {
        setEditingId(null);
        setForm({ cabana: 'principal', tipo: 'luz', monto: '', periodo: periodoActual, nota: '', fechaPago: '' });
        setShowForm(true);
    };
    const openEdit = (g) => {
        setEditingId(g.id);
        setForm({ id: g.id, cabana: g.cabana, tipo: g.tipo, monto: String(g.monto || ''), periodo: g.periodo || periodoActual, nota: g.nota || '', fechaPago: g.fechaPago || '' });
        setShowForm(true);
    };
    const saveGasto = () => {
        const id = editingId || ('g-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9));
        const monto = parseFloat(form.monto);
        if (isNaN(monto) || monto < 0) { showToast('Monto inválido'); return; }
        if (!form.periodo || !/^\d{4}-\d{2}$/.test(form.periodo)) { showToast('Periodo debe ser YYYY-MM'); return; }
        setSaving(true);
        authFetch('/.netlify/functions/guardargasto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, cabana: form.cabana, tipo: form.tipo, monto, periodo: form.periodo.trim(), nota: form.nota || '', fechaPago: form.fechaPago || null })
        })
            .then(r => r.json())
            .then(data => {
                setSaving(false);
                if (data.error) { showToast(data.error); return; }
                showToast('Gasto guardado', 'success');
                setShowForm(false);
                cargarGastos();
            })
            .catch(err => { setSaving(false); showToast('Error: ' + err.message); });
    };
    const eliminarGastoConfirmado = (g) => {
        authFetch('/.netlify/functions/eliminargasto?id=' + encodeURIComponent(g.id), { method: 'DELETE' })
            .then(r => r.json())
            .then(data => {
                if (data.ok) { setConfirmarEliminarGasto(null); cargarGastos(); showToast('Gasto eliminado', 'success'); }
                else showToast(data.error || 'Error');
            })
            .catch(err => showToast('Error: ' + err.message));
    };

    const cabanaLabel = (v) => getGastosCabanasOpts().find(c => c.value === v)?.label || v;
    const tipoLabel = (v) => GASTOS_TIPOS.find(t => t.value === v)?.label || v;

    const [showExportCSV, setShowExportCSV] = useState(false);
    const [expDesde, setExpDesde] = useState('');
    const [expHasta, setExpHasta] = useState('');

    const exportarGastosCSV = () => {
        const desde = expDesde || '';
        const hasta = expHasta || '';
        const enRango = (per) => {
            if (!per) return false;
            if (desde && per < desde) return false;
            if (hasta && per > hasta) return false;
            return true;
        };
        const lista = gastos.filter(g => {
            if (!desde && !hasta) return true;
            return enRango(g.periodo || '');
        });
        if (lista.length === 0) {
            showToast('No hay gastos en ese período');
            return;
        }
        const header = ['id', 'cabana', 'tipo', 'monto', 'periodo', 'nota', 'fecha_pago'];
        const rows = lista.map(g => [
            g.id,
            cabanaLabel(g.cabana),
            tipoLabel(g.tipo),
            String(Number(g.monto) || 0),
            g.periodo || '',
            g.nota || '',
            g.fechaPago || ''
        ]);
        const csv = [header, ...rows]
            .map(cols => cols.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const nombre = `gastos-${desde || 'todos'}_a_${hasta || 'todos'}.csv`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('CSV de gastos descargado', 'success');
        setShowExportCSV(false);
    };

    return (
        <div data-tour="vista-gastos" className="p-4 space-y-4 pb-24">
            <h2 className="text-2xl font-bold">Gastos</h2>
            <div className="flex flex-wrap gap-2 items-center">
                <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] min-w-[140px]">
                    <option value="">Todos los periodos</option>
                    {periodosUnicos.map(m => {
                        const [y, mo] = m.split('-');
                        const d = new Date(parseInt(y), parseInt(mo, 10) - 1, 1);
                        return <option key={m} value={m}>{d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</option>;
                    })}
                </select>
                <select value={filtroCabana} onChange={e => setFiltroCabana(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px]">
                    <option value="">Todas las cabañas</option>
                    {getGastosCabanasOpts().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px]">
                    <option value="">Todos los tipos</option>
                    {GASTOS_TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {(filtroPeriodo || filtroCabana || filtroTipo) && (
                    <button onClick={() => { setFiltroPeriodo(''); setFiltroCabana(''); setFiltroTipo(''); }} className="p-2 bg-gray-200 rounded-xl text-sm min-h-[44px] hover:bg-gray-300">Limpiar</button>
                )}
            </div>
            <div className="flex justify-between items-center gap-2 flex-wrap">
                <p className="text-sm text-gray-600">Total filtrado: <strong>${totalFiltrado.toLocaleString('es-CL')}</strong></p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const base = filtroPeriodo || '';
                            setExpDesde(base);
                            setExpHasta(base);
                            setShowExportCSV(true);
                        }}
                        className="p-3 bg-gray-800 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-900 text-sm min-h-[44px]"
                    >
                        <DlIcon/>Exportar CSV
                    </button>
                    <button onClick={openNew} className="p-3 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 text-sm min-h-[44px]"><PlusIcon/>Agregar gasto</button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border-2 border-green-300 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-green-800">{editingId ? 'Editar gasto' : 'Nuevo gasto'}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Cabaña</label>
                            <select value={form.cabana} onChange={e => setForm({ ...form, cabana: e.target.value })} className="w-full p-2 border-2 border-gray-300 rounded-xl">
                                {getGastosCabanasOpts().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full p-2 border-2 border-gray-300 rounded-xl">
                                {GASTOS_TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Monto ($)</label>
                        <input type="number" min="0" step="1" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} className="w-full p-2 border-2 border-gray-300 rounded-xl" placeholder="0" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Período (YYYY-MM)</label>
                            <input type="month" value={form.periodo} onChange={e => setForm({ ...form, periodo: e.target.value })} className="w-full p-2 border-2 border-gray-300 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Fecha de pago (opcional)</label>
                            <input type="date" value={form.fechaPago} onChange={e => setForm({ ...form, fechaPago: e.target.value })} className="w-full p-2 border-2 border-gray-300 rounded-xl" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Nota (opcional)</label>
                        <input type="text" value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} className="w-full p-2 border-2 border-gray-300 rounded-xl" placeholder="Ej. cuenta enero" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} disabled={saving} className="flex-1 p-2 bg-gray-200 rounded-xl font-bold text-sm disabled:opacity-50">Cancelar</button>
                        <button onClick={saveGasto} disabled={saving} className="flex-1 p-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button>
                    </div>
                </div>
            )}

            {showExportCSV && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-3">Exportar gastos a CSV</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Elige período desde–hasta (YYYY-MM). Si lo dejas en blanco, se exportan todos los períodos.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Desde (YYYY-MM)</label>
                                <input type="month" value={expDesde} onChange={e => setExpDesde(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Hasta (YYYY-MM)</label>
                                <input type="month" value={expHasta} onChange={e => setExpHasta(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded-xl" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowExportCSV(false)} className="flex-1 p-2 bg-gray-200 rounded-xl font-bold text-sm">Cancelar</button>
                            <button onClick={exportarGastosCSV} className="flex-1 p-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">Descargar CSV</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-500"><p className="text-lg">Sin gastos</p><p className="text-sm">Usa &quot;Agregar gasto&quot; para registrar uno.</p></div>
                ) : (
                    filtered.map(g => (
                        <div key={g.id} className="bg-white border-2 border-gray-200 rounded-xl p-3 flex justify-between items-center gap-2">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-red-700">${(Number(g.monto) || 0).toLocaleString('es-CL')}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{tipoLabel(g.tipo)}</span>
                                    <span className="text-xs text-gray-500">{cabanaLabel(g.cabana)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{g.periodo}{g.nota ? ' · ' + g.nota : ''}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => openEdit(g)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Editar"><EditIcon /></button>
                                <button onClick={() => setConfirmarEliminarGasto(g)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Eliminar"><TrashIcon /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {confirmarEliminarGasto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar gasto?</h3>
                        <p className="text-gray-600 mb-4">Se eliminará el gasto de <strong>${(Number(confirmarEliminarGasto.monto)||0).toLocaleString('es-CL')}</strong> ({tipoLabel(confirmarEliminarGasto.tipo)}, {confirmarEliminarGasto.periodo}).</p>
                        <div className="flex gap-3">
                            <button onClick={()=>setConfirmarEliminarGasto(null)} className="flex-1 p-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                            <button onClick={()=>eliminarGastoConfirmado(confirmarEliminarGasto)} className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── VistaReportes: reportes y dashboard con gráficos simples ───
const MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function exportarReporteExcel(reservas, gastos, anio) {
    const noCanc = reservas.filter(r => estadoReserva(r) !== 'cancelada');
    const filas = [];
    filas.push(['Reporte', 'Cabañas', anio]);
    filas.push([]);
    filas.push(['MES','Reservas','Noches','Ingresos ($)','Cobrado ($)','Pendiente ($)','Ocupación %']);
    for (let m = 1; m <= 12; m++) {
        const mIni = new Date(anio, m - 1, 1);
        const mFin = new Date(anio, m, 0);
        const diasMes = mFin.getDate();
        const resM = noCanc.filter(r => {
            const i = new Date(r.fechaInicio);
            return i >= mIni && i <= mFin;
        });
        const noches = resM.reduce((s, r) => s + calcularNoches(r.fechaInicio, r.fechaFin), 0);
        const ing = resM.reduce((s, r) => s + (parseFloat(r.precioTotal) || 0), 0);
        const cob = resM.reduce((s, r) => s + calcularTotalPagado(r), 0);
        const pend = resM.reduce((s, r) => s + Math.max(0, (parseFloat(r.precioTotal) || 0) - calcularTotalPagado(r)), 0);
        const nochesDisp = 2 * diasMes;
        const ocup = nochesDisp > 0 ? Math.round((noches / nochesDisp) * 100) : 0;
        filas.push([MESES_ES[m - 1], resM.length, noches, ing, cob, pend, ocup + '%']);
    }
    const periodo = (p) => p && String(p).match(/^\d{4}-\d{2}$/);
    const gastosAnio = (gastos || []).filter(g => periodo(g.periodo) && parseInt(g.periodo, 10) === anio);
    const totGastos = gastosAnio.reduce((s, g) => s + (Number(g.monto) || 0), 0);
    filas.push([]);
    filas.push(['TOTAL GASTOS', '', '', totGastos, '', '', '']);
    const csv = filas.map(f => f.map(c => (typeof c === 'string' && (c.includes(',') || c.includes('"')) ? '"' + c.replace(/"/g, '""') + '"' : c)).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reporte-${anio}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

/** Calcula datos mensuales para un año dado */
function calcularDatosMeses(reservas, gastos, anio, numCabanas) {
    const noCanc = reservas.filter(r => estadoReserva(r) !== 'cancelada');
    const datos = [];
    for (let m = 1; m <= 12; m++) {
        const mIni = new Date(anio, m - 1, 1);
        const mFin = new Date(anio, m, 0);
        const diasMes = mFin.getDate();
        const resM = noCanc.filter(r => {
            const i = new Date(r.fechaInicio);
            return i >= mIni && i <= mFin;
        });
        const noches = resM.reduce((s, r) => s + calcularNoches(r.fechaInicio, r.fechaFin), 0);
        const ing = resM.reduce((s, r) => s + (parseFloat(r.precioTotal) || 0), 0);
        const cob = resM.reduce((s, r) => s + calcularTotalPagado(r), 0);
        const nochesDisp = (numCabanas || 2) * diasMes;
        const ocup = nochesDisp > 0 ? Math.round((noches / nochesDisp) * 100) : 0;
        const periodo = anio + '-' + String(m).padStart(2, '0');
        const gastosM = (gastos || []).filter(g => g.periodo === periodo).reduce((s, g) => s + (Number(g.monto) || 0), 0);
        datos.push({ mes: m, label: MESES_ES[m - 1], reservas: resM.length, noches, ing, cob, ocup, gastos: gastosM, balance: cob - gastosM });
    }
    return datos;
}

/** Genera insights automáticos a partir de los datos */
function generarInsights(datosMeses, datosAnt, anioSel, totalCob, totalGastos, balanceAnio) {
    const insights = [];
    const totalReservas = datosMeses.reduce((s, d) => s + d.reservas, 0);
    const totalNoches = datosMeses.reduce((s, d) => s + d.noches, 0);
    const ocupacionMedia = totalNoches > 0 ? Math.round((totalNoches / (12 * (typeof getCabanaIds === 'function' ? getCabanaIds().length : 2) * 30)) * 100) : 0;

    // Mejor mes por ingresos
    const mejorMes = datosMeses.reduce((best, d) => (d.ing > (best?.ing || 0) ? d : best), null);
    if (mejorMes && mejorMes.ing > 0) insights.push({ icon: '📅', text: `Tu mejor mes fue ${mejorMes.label} ($${mejorMes.ing.toLocaleString('es-CL')})` });

    // Comparación año anterior
    if (datosAnt) {
        const cobAnt = datosAnt.reduce((s, d) => s + d.cob, 0);
        const ingAnt = datosAnt.reduce((s, d) => s + d.ing, 0);
        const balanceAnt = cobAnt - datosAnt.reduce((s, d) => s + d.gastos, 0);
        if (cobAnt > 0) {
            const deltaCob = Math.round(((totalCob - cobAnt) / cobAnt) * 100);
            insights.push({ icon: '📊', text: `vs ${anioSel - 1}: cobrado ${deltaCob >= 0 ? '+' : ''}${deltaCob}%` });
        }
        if (balanceAnt !== 0 && balanceAnio !== balanceAnt) {
            const deltaBal = Math.round(((balanceAnio - balanceAnt) / Math.abs(balanceAnt)) * 100);
            insights.push({ icon: '💰', text: `Balance ${deltaBal >= 0 ? '+' : ''}${deltaBal}% respecto al año pasado` });
        }
    }

    // Concentración en un trimestre
    const q1 = datosMeses.slice(0, 3).reduce((s, d) => s + d.ing, 0);
    const q2 = datosMeses.slice(3, 6).reduce((s, d) => s + d.ing, 0);
    const q3 = datosMeses.slice(6, 9).reduce((s, d) => s + d.ing, 0);
    const q4 = datosMeses.slice(9, 12).reduce((s, d) => s + d.ing, 0);
    const totalIng = q1 + q2 + q3 + q4;
    if (totalIng > 0) {
        const qMax = Math.max(q1, q2, q3, q4);
        const qLabel = [q1, q2, q3, q4].indexOf(qMax) + 1;
        const pct = Math.round((qMax / totalIng) * 100);
        if (pct >= 40) insights.push({ icon: '🎯', text: `El Q${qLabel} concentró el ${pct}% de los ingresos` });
    }

    // Ocupación
    if (ocupacionMedia >= 70) insights.push({ icon: '🏠', text: `Ocupación alta (${ocupacionMedia}%) — podrías revisar precios` });
    else if (ocupacionMedia < 40 && totalReservas > 0) insights.push({ icon: '🏠', text: `Ocupación media ${ocupacionMedia}% — considera promociones` });

    return insights;
}

const VistaReportes = ({ reservas, gastos, setVerDetalle }) => {
    const hoy = new Date();
    const [anioSel, setAnioSel] = useState(hoy.getFullYear());
    const [pestañaReporte, setPestañaReporte] = useState('resumen'); // 'resumen' | 'detalle'
    const [vistaGrafico, setVistaGrafico] = useState('mensual'); // 'mensual' | 'trimestral'
    const anios = [...new Set(reservas.map(r => new Date(r.fechaInicio).getFullYear()))].filter(y => !isNaN(y)).sort((a, b) => a - b);
    const anioMin = anios.length > 0 ? Math.min(...anios) : hoy.getFullYear();
    const numCabanas = typeof getCabanaIds === 'function' ? getCabanaIds().length : 2;
    const datosMeses = calcularDatosMeses(reservas, gastos, anioSel, numCabanas);
    const datosAnt = anioSel > anioMin ? calcularDatosMeses(reservas, gastos, anioSel - 1, numCabanas) : null;

    const totalIng = datosMeses.reduce((s, d) => s + d.ing, 0);
    const totalCob = datosMeses.reduce((s, d) => s + d.cob, 0);
    const totalReservas = datosMeses.reduce((s, d) => s + d.reservas, 0);
    const totalNoches = datosMeses.reduce((s, d) => s + d.noches, 0);
    const totalGastos = datosMeses.reduce((s, d) => s + d.gastos, 0);
    const balanceAnio = totalCob - totalGastos;
    const ocupacionMedia = totalNoches > 0 ? Math.round((totalNoches / (12 * numCabanas * 30)) * 100) : 0;

    const insights = generarInsights(datosMeses, datosAnt, anioSel, totalCob, totalGastos, balanceAnio);
    const balanceAnt = datosAnt ? datosAnt.reduce((s, d) => s + d.cob, 0) - datosAnt.reduce((s, d) => s + d.gastos, 0) : null;
    const deltaBalance = balanceAnt != null && balanceAnt !== 0 ? Math.round(((balanceAnio - balanceAnt) / Math.abs(balanceAnt)) * 100) : null;

    const datosTrimestre = vistaGrafico === 'trimestral' ? [1, 2, 3, 4].map(q => {
        const from = (q - 1) * 3;
        const slice = datosMeses.slice(from, from + 3);
        return { q, label: `Q${q}`, ing: slice.reduce((s, d) => s + d.ing, 0), cob: slice.reduce((s, d) => s + d.cob, 0), gastos: slice.reduce((s, d) => s + d.gastos, 0), balance: slice.reduce((s, d) => s + d.balance, 0), ocup: Math.round(slice.reduce((s, d) => s + d.ocup, 0) / 3) };
    }) : null;
    const datosGrafico = vistaGrafico === 'trimestral' ? datosTrimestre : datosMeses;
    const maxVal = Math.max(1, ...(datosGrafico || datosMeses).map(d => Math.max(d.cob || d.ing, d.gastos || 0)));

    return (
        <div data-tour="vista-reportes" className="p-4 space-y-4 max-w-4xl mx-auto">
            {/* Encabezado */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold">📈 Reportes</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Resumen anual de ingresos, cobranzas, ocupación y gastos</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setAnioSel(a => Math.max(anioMin, a - 1))} disabled={anioSel <= anioMin} className="w-8 h-8 rounded-md bg-white text-gray-700 font-bold disabled:opacity-30 shadow-sm flex items-center justify-center">‹</button>
                        <span className="text-base font-bold text-gray-800 w-12 text-center">{anioSel}</span>
                        <button onClick={() => setAnioSel(a => Math.min(hoy.getFullYear(), a + 1))} disabled={anioSel >= hoy.getFullYear()} className="w-8 h-8 rounded-md bg-white text-gray-700 font-bold disabled:opacity-30 shadow-sm flex items-center justify-center">›</button>
                    </div>
                    <button onClick={() => { exportarReporteExcel(reservas, gastos, anioSel); showToast('Reporte exportado', 'success'); }} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2">
                        <DlIcon /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Pestañas Resumen / Detalle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                <button onClick={() => setPestañaReporte('resumen')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${pestañaReporte === 'resumen' ? 'bg-white text-teal-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}>
                    Resumen
                </button>
                <button onClick={() => setPestañaReporte('detalle')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${pestañaReporte === 'detalle' ? 'bg-white text-teal-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}>
                    Tabla detallada
                </button>
            </div>

            {pestañaReporte === 'resumen' ? (
                <>
                    {/* 1. BALANCE PROTAGONISTA */}
                    <div className={`rounded-2xl p-6 text-center ${balanceAnio >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200'}`}>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Este año quedaste con</p>
                        <p className={`text-3xl sm:text-4xl font-bold ${balanceAnio >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                            ${balanceAnio.toLocaleString('es-CL')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Cobrado − gastos</p>
                        {deltaBalance != null && (
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${deltaBalance >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                vs {anioSel - 1}: {deltaBalance >= 0 ? '+' : ''}{deltaBalance}%
                            </span>
                        )}
                    </div>

                    {/* 2. INSIGHTS */}
                    {insights.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {insights.map((ins, i) => (
                                <span key={i} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2 shadow-sm">
                                    <span>{ins.icon}</span> {ins.text}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 3. GRÁFICO BARRAS APILADAS: Cobrado vs Gastos */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                            <h3 className="font-bold text-gray-800">💰 Cobrado vs Gastos</h3>
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                                <button onClick={() => setVistaGrafico('mensual')} className={`px-3 py-1 rounded text-xs font-medium ${vistaGrafico === 'mensual' ? 'bg-white shadow text-teal-700' : 'text-gray-600'}`}>Mensual</button>
                                <button onClick={() => setVistaGrafico('trimestral')} className={`px-3 py-1 rounded text-xs font-medium ${vistaGrafico === 'trimestral' ? 'bg-white shadow text-teal-700' : 'text-gray-600'}`}>Trimestral</button>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"/>&nbsp;Cobrado</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"/>&nbsp;Gastos</span>
                        </div>
                        <div className="space-y-2">
                            {(datosGrafico || datosMeses).map((d, idx) => (
                                <div key={d.mes || d.q || idx} className="flex items-center gap-2">
                                    <span className="w-10 text-xs font-medium text-gray-500 shrink-0">{d.label}</span>
                                    <div className="flex-1 h-8 flex rounded-lg overflow-hidden bg-gray-100">
                                        <div className="h-full bg-green-500 transition-all" style={{ width: maxVal > 0 ? Math.max(2, (d.cob / maxVal) * 100) + '%' : 0 }} title={`Cobrado: $${d.cob.toLocaleString('es-CL')}`}/>
                                        <div className="h-full bg-red-500 transition-all" style={{ width: maxVal > 0 ? Math.max(2, (d.gastos / maxVal) * 100) + '%' : 0 }} title={`Gastos: $${d.gastos.toLocaleString('es-CL')}`}/>
                                    </div>
                                    <span className={`text-xs font-medium w-16 text-right shrink-0 ${d.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>${d.balance.toLocaleString('es-CL')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. HEATMAP OCUPACIÓN */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-2">🏠 Ocupación por mes</h3>
                        <p className="text-xs text-gray-500 mb-3">Cada celda = un mes. Mientras más oscuro, mayor ocupación.</p>
                        <div className="grid grid-cols-12 gap-1">
                            {datosMeses.map(d => {
                                const color = d.ocup >= 70 ? '#22c55e' : d.ocup >= 40 ? '#eab308' : d.ocup >= 20 ? '#94a3b8' : '#e2e8f0';
                                return (
                                    <div key={d.mes} className="flex flex-col items-center gap-0.5" title={`${d.label}: ${d.ocup}%`}>
                                        <div className="w-full aspect-square rounded-md border border-gray-200" style={{ backgroundColor: color }}/>
                                        <span className="text-[10px] font-medium text-gray-500">{d.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 opacity-70"/> Alta (≥70%)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 opacity-70"/> Media (40-69%)</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 opacity-70"/> Baja (&lt;40%)</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-2">Ocupación media del año: {ocupacionMedia}%</p>
                    </div>

                    {/* 5. Números auxiliares compactos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                            <p className="text-xs text-teal-600 font-medium">Ingresos</p>
                            <p className="text-lg font-bold text-teal-800">${totalIng.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                            <p className="text-xs text-green-600 font-medium">Cobrado</p>
                            <p className="text-lg font-bold text-green-800">${totalCob.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                            <p className="text-xs text-red-600 font-medium">Gastos</p>
                            <p className="text-lg font-bold text-red-800">${totalGastos.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                            <p className="text-xs text-purple-600 font-medium">Reservas</p>
                            <p className="text-lg font-bold text-purple-800">{totalReservas}</p>
                        </div>
                    </div>
                </>
            ) : (
                /* Tabla detallada */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">📋 Detalle mensual</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Reservas, noches, ingresos, cobrado, gastos y balance por mes</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left p-3 font-medium text-gray-600">Mes</th>
                                    <th className="text-right p-3 font-medium text-gray-600">Reservas</th>
                                    <th className="text-right p-3 font-medium text-gray-600">Noches</th>
                                    <th className="text-right p-3 font-medium text-gray-600">Ingresos</th>
                                    <th className="text-right p-3 font-medium text-gray-600">Cobrado</th>
                                    <th className="text-right p-3 font-medium text-gray-600">Gastos</th>
                                    <th className="text-right p-3 font-medium text-gray-600">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosMeses.map(d => (
                                    <tr key={d.mes} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3 font-medium">{d.label}</td>
                                        <td className="p-3 text-right">{d.reservas}</td>
                                        <td className="p-3 text-right">{d.noches}</td>
                                        <td className="p-3 text-right">${d.ing.toLocaleString('es-CL')}</td>
                                        <td className="p-3 text-right text-green-600">${d.cob.toLocaleString('es-CL')}</td>
                                        <td className="p-3 text-right text-red-600">${d.gastos.toLocaleString('es-CL')}</td>
                                        <td className={`p-3 text-right font-medium ${d.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>${d.balance.toLocaleString('es-CL')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const VistaResumen=({reservas,gastos,setVerDetalle})=>{
    const hoy=new Date();
    const [anioSel,setAnioSel]=React.useState(hoy.getFullYear());
    const [mesSel,setMesSel]=React.useState(hoy.getMonth());
    const [tabActiva,setTabActiva]=React.useState('mes');
    const anios=[...new Set(reservas.map(r=>new Date(r.fechaInicio).getFullYear()))].sort();
    const anioMin=anios.length>0?Math.min(...anios):hoy.getFullYear();
    const mIni=new Date(anioSel,mesSel,1);
    const mFin=new Date(anioSel,mesSel+1,0);
    const rm=reservas.filter(r=>{ const i=new Date(r.fechaInicio); return i>=mIni&&i<=mFin&&estadoReserva(r)!=='cancelada'; });
    const imgm=rm.reduce((s,r)=>s+(parseFloat(r.precioTotal)||0),0),pagm=rm.reduce((s,r)=>s+calcularTotalPagado(r),0),pendm=rm.reduce((s,r)=>s+Math.max(0,(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r)),0);
    const igtot=reservas.filter(r=>estadoReserva(r)!=='cancelada').reduce((s,r)=>s+(parseFloat(r.precioTotal)||0),0),pagtot=reservas.filter(r=>estadoReserva(r)!=='cancelada').reduce((s,r)=>s+calcularTotalPagado(r),0),pendtot=reservas.filter(r=>estadoReserva(r)!=='cancelada').reduce((s,r)=>s+Math.max(0,(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r)),0);
    const sobrepagoM=rm.filter(r=>calcularTotalPagado(r)>(parseFloat(r.precioTotal)||0));
    const sobrepagoTot=reservas.filter(r=>estadoReserva(r)!=='cancelada'&&calcularTotalPagado(r)>(parseFloat(r.precioTotal)||0));
    const hS=hoy.toISOString().split('T')[0];
    const tinajaDias=r=>(r.diasTinaja?.length||0)+(r.tinajaAdicional?.length||0);
    const tinajaIng=r=>{const cabs=typeof getCabanas==='function'?getCabanas():CABANAS;const p=cabs[r.cabana]?.precioTinaja||Object.values(cabs)[0]?.precioTinaja||0;return (r.diasTinaja?.length||0)*p+(r.tinajaAdicional||[]).reduce((a,t)=>a+(parseFloat(t.precio)||0),0);};
    const noCanc=reservas.filter(r=>estadoReserva(r)!=='cancelada');
    const rmNoCanc=rm.filter(r=>estadoReserva(r)!=='cancelada');
    const tinajasDiasM=rmNoCanc.reduce((s,r)=>s+tinajaDias(r),0);
    const tinajasIngM=rmNoCanc.reduce((s,r)=>s+tinajaIng(r),0);
    const tinajasDiasTot=noCanc.reduce((s,r)=>s+tinajaDias(r),0);
    const tinajasIngTot=noCanc.reduce((s,r)=>s+tinajaIng(r),0);
    const periodoMes=anioSel+'-'+String(mesSel+1).padStart(2,'0');
    const gastosMes=(gastos||[]).filter(g=>g.periodo===periodoMes).reduce((s,g)=>s+(Number(g.monto)||0),0);
    const balanceMes=pagm-gastosMes;
    const descuentoMes=rmNoCanc.reduce((s,r)=>s+(parseFloat(r.descuento)||0),0);
    const descuentoTot=noCanc.reduce((s,r)=>s+(parseFloat(r.descuento)||0),0);
    const proximasLlegadas=reservas.filter(r=>r.fechaInicio>=hS&&estadoReserva(r)!=='cancelada').sort((a,b)=>a.fechaInicio.localeCompare(b.fechaInicio)).slice(0,8);
    const cabs=typeof getCabanas==='function'?getCabanas():CABANAS;

    const tabBtn=(id,label)=>(
        <button key={id} onClick={()=>setTabActiva(id)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] touch-manipulation ${tabActiva===id?'bg-teal-600 text-white shadow-md':'bg-white dark:bg-stone-800 text-gray-600 dark:text-stone-400 hover:bg-teal-50 dark:hover:bg-stone-700'}`}>{label}</button>
    );

    const cardCls='rounded-xl p-4 shadow-sm border border-gray-100 dark:border-stone-700';
    const cardMetric='rounded-xl p-3 text-center';

    return (
        <div data-tour="vista-resumen" className="p-4 pb-24 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-stone-100">📊 Resumen</h2>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 -mx-1 overflow-x-auto pb-1">
                {tabBtn('mes','Este mes')}
                {tabBtn('historico','Histórico')}
                {tabBtn('tinajas','Tinajas')}
                {tabBtn('proximas','Próximas')}
            </div>

            {tabActiva==='mes' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Selector mes/año */}
                    <div className={`${cardCls} bg-teal-50 dark:bg-teal-900/30 dark:border-teal-800/50`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h3 className="text-lg font-bold text-teal-800 dark:text-teal-200">{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mesSel]} {anioSel}</h3>
                            <div className="flex items-center gap-1">
                                <button onClick={()=>{ if(mesSel===0){ setMesSel(11); setAnioSel(a=>a-1); }else setMesSel(m=>m-1); }} disabled={anioSel<=anioMin&&mesSel===0} className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-200 font-bold disabled:opacity-40 flex items-center justify-center min-h-[44px] min-w-[44px]" aria-label="Mes anterior">‹</button>
                                <button onClick={()=>{ if(mesSel===11){ setMesSel(0); setAnioSel(a=>Math.min(hoy.getFullYear(),a+1)); }else setMesSel(m=>m+1); }} disabled={anioSel>=hoy.getFullYear()&&mesSel>=hoy.getMonth()} className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-200 font-bold disabled:opacity-40 flex items-center justify-center min-h-[44px] min-w-[44px]" aria-label="Mes siguiente">›</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className={`${cardMetric} bg-white dark:bg-stone-800`}>
                                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{rm.length}</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Reservas</p>
                            </div>
                            <div className={`${cardMetric} bg-white dark:bg-stone-800`}>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">${imgm.toLocaleString('es-CL')}</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Total cotizado</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`${cardMetric} bg-green-100 dark:bg-green-900/40`}>
                                <p className="text-xs font-medium text-green-800 dark:text-green-200">Cobrado</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">${pagm.toLocaleString('es-CL')}</p>
                            </div>
                            <div className={`${cardMetric} bg-orange-100 dark:bg-orange-900/40`}>
                                <p className="text-xs font-medium text-orange-800 dark:text-orange-200">Pendiente</p>
                                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">${pendm.toLocaleString('es-CL')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className={`${cardMetric} bg-red-50 dark:bg-red-900/30`}>
                                <p className="text-xs font-medium text-red-800 dark:text-red-200">Gastos del mes</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-300">${gastosMes.toLocaleString('es-CL')}</p>
                            </div>
                            <div className={`${cardMetric} bg-indigo-50 dark:bg-indigo-900/30`}>
                                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200">Balance</p>
                                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">${balanceMes.toLocaleString('es-CL')}</p>
                            </div>
                        </div>
                        {sobrepagoM.length>0 && (
                            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                                <p className="font-bold text-amber-800 dark:text-amber-200 mb-2">⚠️ {sobrepagoM.length} reserva{sobrepagoM.length!==1?'s':''} con sobrepago</p>
                                {sobrepagoM.map(r=>{const exceso=calcularTotalPagado(r)-(parseFloat(r.precioTotal)||0); return (
                                    <button key={r.id} onClick={()=>setVerDetalle(r)} className="w-full text-left flex justify-between items-center py-2 px-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors">
                                        <span className="font-medium truncate">{r.cliente}</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold shrink-0 ml-2">+${exceso.toLocaleString('es-CL')}</span>
                                    </button>
                                );})}
                            </div>
                        )}
                    </div>

                    {/* Este mes por cabaña */}
                    <div className={`${cardCls} bg-white dark:bg-stone-800`}>
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-stone-100">🏡 Por cabaña</h3>
                        {getCabanaIds().map((cab,i)=>{
                            const cabInfo=cabs[cab]; const resCab=rmNoCanc.filter(r=>r.cabana===cab);
                            const ingCab=resCab.reduce((s,r)=>s+(parseFloat(r.precioTotal)||0),0);
                            const pendCab=resCab.reduce((s,r)=>s+Math.max(0,(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r)),0);
                            const borderCls=['border-l-green-500 bg-green-50 dark:bg-green-900/20','border-l-purple-500 bg-purple-50 dark:bg-purple-900/20','border-l-amber-500 bg-amber-50 dark:bg-amber-900/20','border-l-blue-500 bg-blue-50 dark:bg-blue-900/20','border-l-rose-500 bg-rose-50 dark:bg-rose-900/20'][i%5];
                            return (
                                <div key={cab} className={`mb-3 last:mb-0 rounded-xl p-3 border-l-4 ${borderCls}`}>
                                    <p className="font-bold mb-2 text-gray-800 dark:text-stone-200">{cabInfo?.nombre}</p>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div><p className="text-lg font-bold text-teal-600 dark:text-teal-400">{resCab.length}</p><p className="text-gray-500 dark:text-stone-400">Reservas</p></div>
                                        <div><p className="text-base font-bold text-green-600 dark:text-green-400">${(ingCab/1000).toFixed(0)}k</p><p className="text-gray-500 dark:text-stone-400">Cotizado</p></div>
                                        <div><p className="text-base font-bold text-orange-500 dark:text-orange-400">${(pendCab/1000).toFixed(0)}k</p><p className="text-gray-500 dark:text-stone-400">Pendiente</p></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tabActiva==='historico' && (
                <div className="space-y-4 animate-fade-in">
                    <div className={`${cardCls} bg-white dark:bg-stone-800`}>
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-stone-100">Total histórico</h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className={`${cardMetric} bg-gray-50 dark:bg-stone-700/50`}>
                                <p className="text-2xl font-bold text-gray-800 dark:text-stone-100">{reservas.length}</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Reservas</p>
                            </div>
                            <div className={`${cardMetric} bg-gray-50 dark:bg-stone-700/50`}>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">${igtot.toLocaleString('es-CL')}</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Total cotizado</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className={`${cardMetric} bg-green-50 dark:bg-green-900/30`}>
                                <p className="text-xs text-gray-600 dark:text-stone-400">Cobrado</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">${pagtot.toLocaleString('es-CL')}</p>
                            </div>
                            <div className={`${cardMetric} bg-orange-50 dark:bg-orange-900/30`}>
                                <p className="text-xs text-gray-600 dark:text-stone-400">Por cobrar</p>
                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">${pendtot.toLocaleString('es-CL')}</p>
                            </div>
                            <div className={`${cardMetric} bg-amber-50 dark:bg-amber-900/30`}>
                                <p className="text-xs text-gray-600 dark:text-stone-400">Descuentos</p>
                                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">${descuentoTot.toLocaleString('es-CL')}</p>
                            </div>
                        </div>
                        {descuentoMes>0 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Este mes: ${descuentoMes.toLocaleString('es-CL')} en descuentos</p>}
                        {sobrepagoTot.length>0 && (
                            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                                <p className="font-bold text-amber-800 dark:text-amber-200 mb-2">⚠️ {sobrepagoTot.length} reserva{sobrepagoTot.length!==1?'s':''} con sobrepago</p>
                                {sobrepagoTot.slice(0,5).map(r=>{const exceso=calcularTotalPagado(r)-(parseFloat(r.precioTotal)||0); return (
                                    <button key={r.id} onClick={()=>setVerDetalle(r)} className="w-full text-left flex justify-between items-center py-2 px-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/50"><span className="font-medium truncate">{r.cliente}</span><span className="text-red-600 font-bold shrink-0">+${exceso.toLocaleString('es-CL')}</span></button>
                                );})}
                            </div>
                        )}
                    </div>
                    <div className={`${cardCls} bg-white dark:bg-stone-800`}>
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-stone-100">🏡 Por cabaña (histórico)</h3>
                        {getCabanaIds().map((cab,i)=>{
                            const cabInfo=cabs[cab]; const resCab=reservas.filter(r=>r.cabana===cab&&estadoReserva(r)!=='cancelada');
                            const ingCab=resCab.reduce((s,r)=>s+(parseFloat(r.precioTotal)||0),0);
                            const pendCab=resCab.reduce((s,r)=>s+Math.max(0,(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r)),0);
                            const nochesCab=resCab.reduce((s,r)=>s+calcularNoches(r.fechaInicio,r.fechaFin),0);
                            const borderCls=['border-l-green-500 bg-green-50 dark:bg-green-900/20','border-l-purple-500 bg-purple-50 dark:bg-purple-900/20','border-l-amber-500 bg-amber-50 dark:bg-amber-900/20','border-l-blue-500 bg-blue-50 dark:bg-blue-900/20','border-l-rose-500 bg-rose-50 dark:bg-rose-900/20'][i%5];
                            return (
                                <div key={cab} className={`mb-3 last:mb-0 rounded-xl p-3 border-l-4 ${borderCls}`}>
                                    <p className="font-bold mb-2 text-gray-800 dark:text-stone-200">{cabInfo?.nombre}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                                        <div><p className="text-lg font-bold text-teal-600 dark:text-teal-400">{resCab.length}</p><p className="text-gray-500 dark:text-stone-400">Reservas</p></div>
                                        <div><p className="text-lg font-bold text-gray-700 dark:text-stone-300">{nochesCab}</p><p className="text-gray-500 dark:text-stone-400">Noches</p></div>
                                        <div><p className="text-base font-bold text-green-600 dark:text-green-400">${(ingCab/1000).toFixed(0)}k</p><p className="text-gray-500 dark:text-stone-400">Cotizado</p></div>
                                        <div><p className="text-base font-bold text-orange-500 dark:text-orange-400">${(pendCab/1000).toFixed(0)}k</p><p className="text-gray-500 dark:text-stone-400">Pendiente</p></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tabActiva==='tinajas' && (
                <div className="space-y-4 animate-fade-in">
                    <div className={`${cardCls} bg-cyan-50 dark:bg-cyan-900/30 dark:border-cyan-800/50`}>
                        <h3 className="text-lg font-bold mb-4 text-cyan-800 dark:text-cyan-200">🛁 Tinajas</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className={`${cardMetric} bg-white dark:bg-stone-800 border border-cyan-100 dark:border-cyan-800`}>
                                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{tinajasDiasM}</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Días este mes</p>
                            </div>
                            <div className={`${cardMetric} bg-white dark:bg-stone-800 border border-cyan-100 dark:border-cyan-800`}>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">${tinajasIngM.toLocaleString('es-CL')}</p>
                                <p className="text-xs text-gray-500 dark:text-stone-400">Ingresos este mes</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className={`${cardMetric} bg-cyan-100 dark:bg-cyan-900/50`}>
                                <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{tinajasDiasTot}</p>
                                <p className="text-xs text-cyan-800 dark:text-cyan-200">Total días histórico</p>
                            </div>
                            <div className={`${cardMetric} bg-cyan-100 dark:bg-cyan-900/50`}>
                                <p className="text-xl font-bold text-green-700 dark:text-green-400">${tinajasIngTot.toLocaleString('es-CL')}</p>
                                <p className="text-xs text-cyan-800 dark:text-cyan-200">Total ingresos</p>
                            </div>
                        </div>
                        {getCabanaIds().map((cab,i)=>{
                            const resCab=noCanc.filter(r=>r.cabana===cab);
                            const dias=resCab.reduce((s,r)=>s+tinajaDias(r),0);
                            const ing=resCab.reduce((s,r)=>s+tinajaIng(r),0);
                            const bgCls=['bg-green-100 dark:bg-green-900/40','bg-purple-100 dark:bg-purple-900/40','bg-amber-100 dark:bg-amber-900/40','bg-blue-100 dark:bg-blue-900/40','bg-rose-100 dark:bg-rose-900/40'][i%5];
                            return dias>0 ? <div key={cab} className={`flex justify-between items-center p-3 rounded-xl mb-2 ${bgCls}`}><span className="font-medium text-gray-800 dark:text-stone-200">{cabs[cab]?.nombre}</span><span className="font-bold text-gray-700 dark:text-stone-300">{dias} días · ${ing.toLocaleString('es-CL')}</span></div> : null;
                        })}
                        {tinajasDiasTot===0 && <p className="text-center text-gray-500 dark:text-stone-400 text-sm py-6">Sin usos de tinaja registrados</p>}
                    </div>
                </div>
            )}

            {tabActiva==='proximas' && (
                <div className="space-y-4 animate-fade-in">
                    <div className={`${cardCls} bg-white dark:bg-stone-800`}>
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-stone-100">🔜 Próximas llegadas</h3>
                        {proximasLlegadas.length>0 ? proximasLlegadas.map(r=>(
                            <button key={r.id} onClick={()=>setVerDetalle(r)} className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-stone-700/50 transition-colors text-left mb-2 last:mb-0">
                                <div className="min-w-0">
                                    <p className="font-bold truncate text-gray-800 dark:text-stone-100">{r.cliente}</p>
                                    <p className="text-sm text-gray-500 dark:text-stone-400">{cabs[r.cabana]?.nombre}</p>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{new Date(r.fechaInicio+'T12:00:00').toLocaleDateString('es-CL',{day:'numeric',month:'short'})}</p>
                                    <p className="text-xs text-gray-400 dark:text-stone-500">{r.personas} personas</p>
                                </div>
                            </button>
                        )) : <p className="text-gray-500 dark:text-stone-400 text-center py-10">Sin próximas reservas</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

// Plantillas WhatsApp: clave localStorage y valores por defecto (máx. 5)
const PLANTILLAS_WA_KEY = 'mis_reservas_plantillas_wa';
const PLANTILLAS_DEFAULT = [
    { id: 'p1', nombre: 'Bienvenida', texto: 'Hola {cliente}! 👋 Somos {nombreNegocio}. Te confirmamos tu reserva en {cabana}. Entrada: {fechaEntrada}. Salida: {fechaSalida}. Total: $ {total}. ¡Te esperamos!' },
    { id: 'p2', nombre: 'Recordatorio pago', texto: 'Hola {cliente}! Te recordamos el saldo de $ {saldo} por tu reserva del {fechaEntrada}. ¡Gracias!' },
    { id: 'p3', nombre: 'Llegada', texto: 'Hola {cliente}! Mañana es tu llegada a {cabana}. Check-in desde las 16:00 · Check-out hasta las 14:00. ¡Nos vemos!' },
    { id: 'p4', nombre: 'Despedida', texto: 'Hola {cliente}! Gracias por hospedarte en {nombreNegocio}. ¡Esperamos verte pronto! ⭐' },
];
function aplicarPlantilla(r, texto) {
    const cabs = typeof getCabanas === 'function' ? getCabanas() : CABANAS;
    const cabanaInfo = cabs[r.cabana] || Object.values(cabs)[0];
    const noches = calcularNoches(r.fechaInicio, r.fechaFin);
    const saldo = (parseFloat(r.precioTotal) || 0) - calcularTotalPagado(r);
    const fe = new Date(r.fechaInicio + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    const fs = new Date(r.fechaFin + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    const total = (parseFloat(r.precioTotal) || 0).toLocaleString('es-CL');
    const saldoStr = saldo.toLocaleString('es-CL');
    const nombreNegocio = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.nombreNegocio) || 'Cabañas Eli';
    return (texto || '')
        .replace(/\{cliente\}/gi, r.cliente || '')
        .replace(/\{cabana\}/gi, cabanaInfo.nombre || '')
        .replace(/\{fechaEntrada\}/gi, fe)
        .replace(/\{fechaSalida\}/gi, fs)
        .replace(/\{saldo\}/gi, saldoStr)
        .replace(/\{total\}/gi, total)
        .replace(/\{noches\}/gi, String(noches))
        .replace(/\{nombreNegocio\}/gi, nombreNegocio);
}
function loadPlantillas() {
    try {
        const raw = localStorage.getItem(PLANTILLAS_WA_KEY);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) return arr.slice(0, 5);
        }
    } catch (_) {}
    return PLANTILLAS_DEFAULT.slice(0, 5);
}

const VistaMensajes=({reservas,setVerDetalle})=>{
    const [bN,setBN]=useState(''), [bF,setBF]=useState({desde:'',hasta:''}), [msgMan,setMsgMan]=useState(null), [filtroRapido,setFiltroRapido]=useState(null);
    const [plantillas, setPlantillas] = useState(() => loadPlantillas());
    const [showPlantillasForm, setShowPlantillasForm] = useState(false);
    const [editingPlantillaId, setEditingPlantillaId] = useState(null);
    const [plantillaForm, setPlantillaForm] = useState({ nombre: '', texto: '' });
    const [plantillaPorReserva, setPlantillaPorReserva] = useState({});
    const hoyS=new Date().toISOString().split('T')[0];
    const manS=new Date(Date.now()+(typeof MS_PER_DAY !== 'undefined' ? MS_PER_DAY : 86400000)).toISOString().split('T')[0];
    const filtrosRapidos=[{id:'hoy',label:'📥 Llegan hoy',fn:r=>r.fechaInicio===hoyS&&estadoReserva(r)!=='cancelada'},{id:'mañana',label:'🔔 Llegan mañana',fn:r=>r.fechaInicio===manS&&estadoReserva(r)!=='cancelada'},{id:'saldo',label:'💰 Con saldo',fn:r=>(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r)>0&&estadoReserva(r)!=='cancelada'},{id:'checkin',label:'🏠 En check-in',fn:r=>estadoReserva(r)==='checkin'}];
    const rf=reservas.filter(r=>{if(filtroRapido) return filtrosRapidos.find(f=>f.id===filtroRapido)?.fn(r);if(bN&&!r.cliente.toLowerCase().includes(bN.toLowerCase())) return false;if(bF.desde&&bF.hasta){ const i=new Date(r.fechaInicio); if(i<new Date(bF.desde)||i>new Date(bF.hasta)) return false;}return true;}).sort((a,b)=>new Date(a.fechaInicio)-new Date(b.fechaInicio));
    const copiar=msg=>{if(navigator.clipboard?.writeText) navigator.clipboard.writeText(msg).then(()=>showToast('Copiado', 'success')).catch(()=>setMsgMan(msg)); else setMsgMan(msg);};
    const fmtWA=typeof formatearTelefonoWA==='function'?formatearTelefonoWA:(tel)=>{const n=(tel||'').replace(/\D/g,'');return n?(n.startsWith('56')?n:'56'+n):'';};
    const abrirWA=(tel,msg)=>{const n=fmtWA(tel);if(!n){showToast('Esta reserva no tiene teléfono registrado.');return;}window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank');};
    const savePlantillas=(list)=>{ setPlantillas(list); try { localStorage.setItem(PLANTILLAS_WA_KEY, JSON.stringify(list)); } catch(_){} };
    const addPlantilla=()=>{ setEditingPlantillaId(null); setPlantillaForm({ nombre: '', texto: '' }); setShowPlantillasForm(true); };
    const editPlantilla=(p)=>{ setEditingPlantillaId(p.id); setPlantillaForm({ nombre: p.nombre, texto: p.texto }); setShowPlantillasForm(true); };
    const deletePlantilla=(id)=>{ if(!confirm('¿Eliminar esta plantilla?')) return; const next = plantillas.filter(p=>p.id!==id); savePlantillas(next.length?next:PLANTILLAS_DEFAULT.slice(0,5)); };
    const submitPlantilla=()=>{
        const nombre=(plantillaForm.nombre||'').trim(), texto=(plantillaForm.texto||'').trim();
        if(!nombre||!texto){ showToast('Nombre y texto son obligatorios','error'); return; }
        let list;
        if(editingPlantillaId){
            list=plantillas.map(p=>p.id===editingPlantillaId?{...p,nombre,texto}:p);
        } else {
            if(plantillas.length>=5){ showToast('Máximo 5 plantillas','error'); return; }
            list=[...plantillas,{ id:'p'+Date.now(), nombre, texto }];
        }
        savePlantillas(list); setShowPlantillasForm(false); setEditingPlantillaId(null); showToast('Plantilla guardada','success');
    };
    return (
        <div data-tour="vista-mensajes" className="p-4 space-y-4">
            <h2 className="text-2xl font-bold">📱 Mensajes WhatsApp</h2>
            <div className="flex flex-wrap gap-2">{filtrosRapidos.map(f=>(<button key={f.id} onClick={()=>setFiltroRapido(filtroRapido===f.id?null:f.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${filtroRapido===f.id?'bg-teal-600 text-white border-teal-600':'bg-white text-gray-700 border-gray-300 hover:border-teal-400'}`}>{f.label}</button>))}</div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-800">📝 Plantillas guardadas</h3>
                <p className="text-xs text-gray-500">Usa {'{cliente}'}, {'{cabana}'}, {'{fechaEntrada}'}, {'{fechaSalida}'}, {'{saldo}'}, {'{total}'}, {'{noches}'} en el texto.</p>
                <div className="space-y-2">{plantillas.map(p=>(<div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg"><span className="font-medium truncate">{p.nombre}</span><div className="flex gap-1 shrink-0"><button onClick={()=>editPlantilla(p)} className="p-1.5 text-teal-600 text-sm font-medium">Editar</button><button onClick={()=>deletePlantilla(p.id)} className="p-1.5 text-red-600 text-sm font-medium">Eliminar</button></div></div>))}</div>
                {plantillas.length<5&&<button onClick={addPlantilla} className="w-full p-2 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-200">+ Agregar plantilla</button>}
            </div>
            {showPlantillasForm&&(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-3">{editingPlantillaId?'Editar plantilla':'Nueva plantilla'}</h3>
                        <input type="text" value={plantillaForm.nombre} onChange={e=>setPlantillaForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre (ej. Bienvenida)" className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3"/>
                        <textarea value={plantillaForm.texto} onChange={e=>setPlantillaForm(f=>({...f,texto:e.target.value}))} placeholder="Texto. Usa {cliente}, {cabana}, {fechaEntrada}, {fechaSalida}, {saldo}, {total}, {noches}" rows={5} className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3 resize-y"/>
                        <div className="flex gap-2"><button onClick={()=>{ setShowPlantillasForm(false); setEditingPlantillaId(null); }} className="flex-1 p-3 bg-gray-200 rounded-xl font-bold">Cancelar</button><button onClick={submitPlantilla} className="flex-1 p-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">Guardar</button></div>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 space-y-3">
                <input type="text" value={bN} onChange={e=>{setBN(e.target.value);setFiltroRapido(null);}} placeholder="Buscar por nombre..." className="w-full p-3 border-2 border-gray-300 rounded-xl"/>
                <div className="grid grid-cols-2 gap-2"><input type="date" value={bF.desde} onChange={e=>{setBF({...bF,desde:e.target.value});setFiltroRapido(null);}} className="w-full p-2 border-2 border-gray-300 rounded-xl"/><input type="date" value={bF.hasta} onChange={e=>{setBF({...bF,hasta:e.target.value});setFiltroRapido(null);}} className="w-full p-2 border-2 border-gray-300 rounded-xl"/></div>
                {(bN||bF.desde||filtroRapido)&&<button onClick={()=>{setBN('');setBF({desde:'',hasta:''});setFiltroRapido(null);}} className="w-full p-2 bg-gray-200 rounded-lg text-sm">Limpiar filtros</button>}
                <p className="text-center text-sm text-gray-500">{rf.length} reserva{rf.length!==1?'s':''}</p>
            </div>
            {msgMan&&<div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4"><p className="font-bold text-yellow-800 mb-2">📋 Mantén presionado para copiar:</p><pre className="whitespace-pre-wrap text-sm p-3 bg-white border-2 border-gray-300 rounded-lg" style={{userSelect:'text',WebkitUserSelect:'text'}}>{msgMan}</pre><button onClick={()=>setMsgMan(null)} className="mt-2 w-full p-2 bg-gray-200 rounded-lg text-sm">Cerrar</button></div>}
            <div className="space-y-3">{rf.map(r=>{
                const saldo=(parseFloat(r.precioTotal)||0)-calcularTotalPagado(r);
                const plantillaSel = plantillaPorReserva[r.id] || '';
                const msgConPlantilla = plantillaSel ? (()=>{ const p = plantillas.find(x=>x.id===plantillaSel); return p ? aplicarPlantilla(r, p.texto) : ''; })() : '';
                return (
                <div key={r.id} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3"><div><h3 className="text-lg font-bold">{r.cliente}</h3><p className="text-xs text-gray-500">{(typeof getCabanas==='function'?getCabanas():CABANAS)[r.cabana]?.nombre} · {new Date(r.fechaInicio+'T12:00:00').toLocaleDateString('es-CL')} → {new Date(r.fechaFin+'T12:00:00').toLocaleDateString('es-CL')}</p>{r.telefono&&<span className="text-xs">📞 {r.telefono} · <a href={`https://wa.me/${fmtWA(r.telefono)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">Abrir en WhatsApp</a></span>}</div><button onClick={()=>setVerDetalle(r)} className="shrink-0 px-3 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-teal-600 transition-colors shadow-sm"><EyeIcon/>Ver</button></div>
                    <div className="mb-3"><label className="block text-xs font-medium text-gray-600 mb-1">Usar plantilla</label><select value={plantillaSel} onChange={e=>setPlantillaPorReserva(prev=>({...prev,[r.id]:e.target.value}))} className="w-full p-2 border-2 border-gray-300 rounded-xl text-sm"><option value="">— Elegir plantilla —</option>{plantillas.map(p=>(<option key={p.id} value={p.id}>{p.nombre}</option>))}</select>{msgConPlantilla&&<div className="mt-2 flex gap-2"><button onClick={()=>abrirWA(r.telefono,msgConPlantilla)} className="flex-1 p-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors">Abrir WhatsApp</button><button onClick={()=>copiar(msgConPlantilla)} className="p-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300">📋 Copiar</button></div>}</div>
                    <div className="grid grid-cols-2 gap-2">{[{t:'confirmacion',l:'✅ Confirmación',c:'bg-green-500',h:'hover:bg-green-600'},{t:'recordatorio',l:'🔔 Recordatorio',c:'bg-teal-500',h:'hover:bg-teal-600'},...(saldo>0?[{t:'saldo',l:'💰 Cobrar saldo',c:'bg-orange-500',h:'hover:bg-orange-600'}]:[]),{t:'agradecimiento',l:'💜 Agradecimiento',c:'bg-purple-500',h:'hover:bg-purple-600'}].map(({t,l,c,h})=>(<button key={t} onClick={()=>abrirWA(r.telefono,generarMsg(r,t))} className={`p-2 ${c} ${h} text-white rounded-lg font-bold text-sm transition-colors`}>{l}</button>))}</div>
                </div>
            );})}{rf.length===0&&<div className="text-center py-12 text-gray-500"><p className="text-xl">Sin reservas</p></div>}</div>
        </div>
    );
};

// ── Notificaciones push (PWA) ──
const PushNotificationsToggle = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'granted'|'denied'|'default'|'unsupported'|null
    const [pushAvailable, setPushAvailable] = useState(false);

    useEffect(() => {
        if (typeof Notification === 'undefined') { setStatus('unsupported'); return; }
        setStatus(Notification.permission);
        authFetch('/.netlify/functions/getpushconfig').then(r => r.json()).then(d => setPushAvailable(!!d.vapidPublicKey)).catch(() => {});
    }, []);

    const urlBase64ToUint8Array = (base64) => {
        const padding = '='.repeat((4 - base64.length % 4) % 4);
        const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(b64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
    };

    const activar = async () => {
        if (status === 'granted') { showToast('Ya tienes notificaciones activadas'); return; }
        if (status === 'denied') { showToast('Debes permitir notificaciones en la configuración del navegador'); return; }
        if (!pushAvailable) { showToast('Push no configurado en el servidor'); return; }
        setLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setStatus(perm);
            if (perm !== 'granted') { showToast('Se necesitan permisos para notificaciones'); setLoading(false); return; }
            const cfg = await authFetch('/.netlify/functions/getpushconfig').then(r => r.json());
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(cfg.vapidPublicKey),
            });
            const res = await authFetch('/.netlify/functions/subscribir', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub.toJSON ? sub.toJSON() : { endpoint: sub.endpoint, keys: { p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))), auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))) } }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            showToast('Notificaciones activadas', 'success');
        } catch (e) {
            showToast('Error: ' + (e.message || 'No se pudo activar'));
        }
        setLoading(false);
    };

    if (status === 'unsupported') return <p className="text-sm text-gray-500">Tu navegador no soporta notificaciones push.</p>;
    if (!pushAvailable) return <p className="text-sm text-gray-500">Configura VAPID keys en Netlify para habilitar push.</p>;
    return (
        <div className="flex items-center gap-3">
            <button onClick={activar} disabled={loading || status === 'granted'} className={`p-3 min-h-[44px] rounded-xl font-bold text-sm flex items-center gap-2 ${status === 'granted' ? 'bg-green-100 text-green-700 cursor-default' : 'bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50'}`}>
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {status === 'granted' ? '✓ Notificaciones activas' : loading ? 'Activando…' : 'Activar notificaciones'}
            </button>
            {status === 'denied' && <span className="text-sm text-amber-600">Permiso denegado. Actívalo en la configuración del navegador.</span>}
        </div>
    );
};

const CONFIG_DEFAULTS = {
    principal: { id: 'principal', nombre: 'Cabaña Principal', maxPersonas: 6, precioExtraPorPersona: 10000, precioUnaNoche: 80000, precioVariasNoches: 70000, precioTinaja: 25000, activa: true, orden: 1 },
    grande:    { id: 'grande', nombre: 'Cabaña Grande', maxPersonas: 10, precioExtraPorPersona: 10000, precioUnaNoche: 120000, precioVariasNoches: 100000, precioTinaja: 30000, activa: true, orden: 2 },
};
function parseConfigFromApi(data) {
    if (!data || typeof data !== 'object') return { ...CONFIG_DEFAULTS };
    const skip = k => k.startsWith('_');
    const entries = Object.entries(data).filter(([k]) => !skip(k));
    if (entries.length === 0) return { ...CONFIG_DEFAULTS };
    const out = {};
    entries.forEach(([id, c], i) => {
        out[id] = {
            id,
            nombre: c?.nombre ?? 'Cabaña',
            maxPersonas: c?.maxPersonas ?? 6,
            precioExtraPorPersona: c?.precioExtraPorPersona ?? 10000,
            precioUnaNoche: c?.precioUnaNoche ?? 80000,
            precioVariasNoches: c?.precioVariasNoches ?? 70000,
            precioTinaja: c?.precioTinaja ?? 25000,
            activa: c?.activa !== false,
            orden: typeof c?.orden === 'number' ? c.orden : i,
        };
    });
    return out;
}
function configToCabanasObj(form) {
    const out = {};
    Object.entries(form).forEach(([id, c]) => {
        out[id] = {
            nombre: c.nombre,
            maxPersonas: c.maxPersonas,
            precioExtraPorPersona: c.precioExtraPorPersona,
            precioUnaNoche: c.precioUnaNoche,
            precioVariasNoches: c.precioVariasNoches,
            precioTinaja: c.precioTinaja,
        };
    });
    return out;
}
function configsEqual(a, b) {
    if (!a || !b) return !a && !b;
    return JSON.stringify(a) === JSON.stringify(b);
}
function parseNum(val, def = 0) { const x = parseFloat(String(val).replace(/\D/g, '')); return isNaN(x) ? def : Math.max(0, x); }

const CABANA_COLORS = ['border-green-300 bg-green-50/80', 'border-purple-300 bg-purple-50/80', 'border-amber-300 bg-amber-50/80', 'border-blue-300 bg-blue-50/80', 'border-rose-300 bg-rose-50/80'];

const VistaConfig = ({ exportar, onAbrirCambiarPass, onCerrarEnTodos }) => {
    const [form, setForm] = useState(() => parseConfigFromApi(window.CABANAS || CABANAS));
    const [lastSaved, setLastSaved] = useState(null);
    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [editingCab, setEditingCab] = useState(null);
    const hasChanges = lastSaved !== null && !configsEqual(form, lastSaved);

    useEffect(() => {
        setLoadError(false);
        setLoading(true);
        authFetch('/.netlify/functions/obtenerconfig')
            .then(r => r.json())
            .then(data => {
                const parsed = parseConfigFromApi(data);
                setForm(parsed);
                setLastSaved(parsed);
                setLoadError(false);
            })
            .catch(() => {
                setLoadError(true);
                showToast('No se pudo cargar la configuración desde el servidor');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (e) => { if (hasChanges) e.preventDefault(); };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [hasChanges]);

    const update = (cab, key, value) => setForm(prev => ({ ...prev, [cab]: { ...prev[cab], [key]: value } }));
    const updateNum = (cab, key, value) => update(cab, key, parseNum(value, 0));
    const toggleActiva = (cab) => update(cab, 'activa', !form[cab].activa);

    const agregarCabaña = () => {
        const tempId = 'new-' + Date.now();
        const orden = Math.max(0, ...Object.values(form).map(c => (c.orden ?? 0))) + 1;
        setForm(prev => ({
            ...prev,
            [tempId]: {
                id: '',
                nombre: 'Cabaña Nueva',
                maxPersonas: 6,
                precioExtraPorPersona: 10000,
                precioUnaNoche: 80000,
                precioVariasNoches: 70000,
                precioTinaja: 25000,
                activa: true,
                orden
            }
        }));
        setEditingCab(tempId);
    };

    const quitarCabañaTemporal = (tempId) => {
        if (!tempId.startsWith('new-')) return;
        setForm(prev => {
            const next = { ...prev };
            delete next[tempId];
            return next;
        });
        setEditingCab(null);
    };

    const guardar = () => {
        const cabanasArray = Object.entries(form)
            .filter(([k]) => !k.startsWith('_'))
            .sort((a, b) => (a[1].orden ?? 0) - (b[1].orden ?? 0))
            .map(([id, c]) => ({
                id: id.startsWith('new-') ? '' : id,
                nombre: (c.nombre || '').trim().substring(0, 100) || 'Cabaña',
                maxPersonas: Math.max(1, Math.min(99, parseInt(c.maxPersonas, 10) || 6)),
                precioExtraPorPersona: parseNum(c.precioExtraPorPersona),
                precioUnaNoche: parseNum(c.precioUnaNoche),
                precioVariasNoches: parseNum(c.precioVariasNoches),
                precioTinaja: parseNum(c.precioTinaja),
                activa: c.activa !== false,
                orden: parseInt(c.orden, 10) || 0
            }));
        const activasCount = cabanasArray.filter(c => c.activa).length;
        if (activasCount === 0) {
            showToast('Debe haber al menos una cabaña activa');
            return;
        }
        setSaving(true);
        authFetch('/.netlify/functions/guardarconfig', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cabanas: cabanasArray })
        })
            .then(r => r.json())
            .then(data => {
                setSaving(false);
                if (data.error) { showToast(data.error); return; }
                authFetch('/.netlify/functions/obtenerconfig')
                    .then(r => r.json())
                    .then(apiData => {
                        const parsed = parseConfigFromApi(apiData);
                        setForm(parsed);
                        setLastSaved(parsed);
                        window.CABANAS = parsed;
                        showToast('Configuración guardada', 'success');
                        setSavedOk(true);
                        setEditingCab(null);
                        setTimeout(() => setSavedOk(false), 2000);
                    })
                    .catch(() => {
                        setForm(parseConfigFromApi({}));
                        setLastSaved(null);
                        showToast('Guardado, pero no se pudo recargar la config');
                    });
            })
            .catch(err => { setSaving(false); showToast('Error: ' + err.message); });
    };

    const inputClass = 'w-full p-3 min-h-[44px] border-2 rounded-xl transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const helpId = (cab, key) => `help-${String(cab).replace(/[^a-z0-9]/gi, '-')}-${key}`;

    const cabanasOrdenadas = Object.entries(form)
        .filter(([k]) => !k.startsWith('_'))
        .sort((a, b) => (a[1].orden ?? 0) - (b[1].orden ?? 0));

    const CamposCabana = ({ cab, color, isNew }) => {
        const c = form[cab];
        if (!c) return null;
        const expandido = editingCab === cab;
        return (
            <div className={`rounded-xl p-4 border-2 ${color} space-y-4`} role="group">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="font-bold text-lg">{c.nombre || 'Sin nombre'}</h3>
                        <p className="text-sm text-gray-600">{c.maxPersonas} pers. · 1 noche: ${(c.precioUnaNoche||0).toLocaleString('es-CL')} · Varias: ${(c.precioVariasNoches||0).toLocaleString('es-CL')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => toggleActiva(cab)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${c.activa ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`} title={c.activa ? 'Activa (aparece en reservas)' : 'Inactiva (oculta en nuevas reservas)'}>
                            {c.activa ? '✓ Activa' : 'Inactiva'}
                        </button>
                        <button type="button" onClick={() => setEditingCab(expandido ? null : cab)} className="p-2 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200"><EditIcon/></button>
                        {isNew && <button type="button" onClick={() => quitarCabañaTemporal(cab)} className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200" title="Quitar"><TrashIcon/></button>}
                    </div>
                </div>
                {expandido && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200/80">
                        <div>
                            <label htmlFor={`${cab}-nombre`} className={labelClass}>Nombre</label>
                            <input id={`${cab}-nombre`} type="text" value={c.nombre||''} onChange={e=>update(cab,'nombre',e.target.value)} className={inputClass} placeholder="Ej. Cabaña Principal" />
                        </div>
                        <div>
                            <label htmlFor={`${cab}-maxPersonas`} className={labelClass}>Capacidad máx. (personas)</label>
                            <input id={`${cab}-maxPersonas`} type="number" min="1" max="99" value={c.maxPersonas??6} onChange={e=>updateNum(cab,'maxPersonas',e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Persona extra (CLP)</label>
                            <input type="number" min="0" value={c.precioExtraPorPersona??0} onChange={e=>updateNum(cab,'precioExtraPorPersona',e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Una noche (CLP)</label>
                            <input type="number" min="0" value={c.precioUnaNoche??0} onChange={e=>updateNum(cab,'precioUnaNoche',e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Por noche varias (CLP)</label>
                            <input type="number" min="0" value={c.precioVariasNoches??0} onChange={e=>updateNum(cab,'precioVariasNoches',e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Tinaja (CLP)</label>
                            <input type="number" min="0" value={c.precioTinaja??0} onChange={e=>updateNum(cab,'precioTinaja',e.target.value)} className={inputClass} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-4 flex flex-col items-center justify-center min-h-[200px] pb-24">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" aria-hidden />
                <p className="text-gray-600">Cargando configuración desde el servidor…</p>
            </div>
        );
    }
    if (loadError) {
        return (
            <div data-tour="vista-config" className="p-4 space-y-4 pb-24">
                <h2 className="text-2xl font-bold">⚙️ Configuración</h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-700 font-medium mb-2">No se pudo cargar la configuración.</p>
                    <p className="text-sm text-gray-600 mb-3">Usa valores por defecto y guarda para actualizar la BD.</p>
                    <button onClick={() => { setForm(parseConfigFromApi(CABANAS)); setLastSaved(parseConfigFromApi(CABANAS)); setLoadError(false); }} className="px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Usar valores por defecto</button>
                </div>
            </div>
        );
    }

    return (
        <div data-tour="vista-config" className="p-4 pb-24">
            {hasChanges && (
                <div className="sticky top-14 z-10 -mx-4 px-4 py-3 bg-amber-100 border-b border-amber-300 flex items-center justify-between gap-3 text-amber-900">
                    <span className="text-sm font-medium">📝 Cambios sin guardar en cabañas</span>
                    <button onClick={guardar} disabled={saving} className="shrink-0 px-4 py-2 min-h-[44px] bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-60 flex items-center gap-2">
                        {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden /> : null}
                        {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            )}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">⚙️ Configuración</h2>
                <p className="text-sm text-gray-500 mt-1">Gestiona cabañas, precios, cuenta y respaldos.</p>
            </div>

            <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-700 text-sm font-bold">1</span>
                    <h3 className="text-lg font-bold text-gray-800">Cabañas y precios</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Define nombres, capacidad y tarifas. Las cabañas inactivas no aparecen al crear reservas.</p>
                <div className="space-y-4">
                    {cabanasOrdenadas.map(([cabId], i) => (
                        <CamposCabana key={cabId} cab={cabId} color={CABANA_COLORS[i % CABANA_COLORS.length]} isNew={cabId.startsWith('new-')} />
                    ))}
                </div>
                <button type="button" onClick={agregarCabaña} className="mt-4 w-full p-4 min-h-[44px] border-2 border-dashed border-teal-300 rounded-xl text-teal-700 font-bold hover:bg-teal-50 flex items-center justify-center gap-2">
                    <PlusIcon/> Agregar cabaña
                </button>
            </section>

            {(onAbrirCambiarPass || onCerrarEnTodos) && (
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-700 text-sm font-bold">2</span>
                        <h3 className="text-lg font-bold text-gray-800">Cuenta y seguridad</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200 space-y-3">
                        {onAbrirCambiarPass && (
                            <button onClick={onAbrirCambiarPass} className="w-full flex items-center gap-3 p-4 min-h-[44px] text-left rounded-xl border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition">
                                <span className="text-xl">🔑</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800">Cambiar contraseña</p>
                                    <p className="text-xs text-gray-500">Actualiza tu contraseña de acceso al panel</p>
                                </div>
                            </button>
                        )}
                        {onCerrarEnTodos && (
                            <button onClick={onCerrarEnTodos} className="w-full flex items-center gap-3 p-4 min-h-[44px] text-left rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition">
                                <span className="text-xl">🔓</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800">Cerrar sesión en todos</p>
                                    <p className="text-xs text-gray-500">Invalida todas las sesiones activas</p>
                                </div>
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* Notificaciones push */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-700 text-sm font-bold">3</span>
                        <h3 className="text-lg font-bold text-gray-800">Notificaciones push</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">Recibe alertas en tu dispositivo (llegan hoy, salen hoy, saldo pendiente) aunque la app esté cerrada.</p>
                        <PushNotificationsToggle />
                    </div>
                </section>

            {exportar && (
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-700 text-sm font-bold">4</span>
                        <h3 className="text-lg font-bold text-gray-800">Respaldo de datos</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">Descarga una copia de todas las reservas en JSON. Recomendado hacerlo de forma periódica.</p>
                        <p className="text-xs text-gray-500 mb-3">
                            {(()=>{
                                const u=localStorage.getItem('ultimoRespaldo');
                                if(!u) return 'Último respaldo: Nunca';
                                const d=Math.floor((new Date()-new Date(u))/(typeof MS_PER_DAY !== 'undefined' ? MS_PER_DAY : 86400000));
                                return `Último respaldo: ${d===0?'Hoy ✅':d===1?'Ayer':`Hace ${d} días${d>=7?' ⚠️':''}`}`;
                            })()}
                        </p>
                        <button onClick={exportar} className="w-full p-4 min-h-[44px] bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"><DlIcon/>Descargar respaldo</button>
                    </div>
                </section>
            )}

            {savedOk && (
                <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-30 px-4 py-2 bg-green-100 border border-green-400 text-green-800 rounded-xl text-center text-sm font-medium shadow-lg animate-fade-in">
                    ✓ Configuración guardada
                </div>
            )}
        </div>
    );
};

// Tarjeta de reserva para la vista lista (extraída para legibilidad)
const eC={pendiente:'bg-yellow-100 text-yellow-700',confirmada:'bg-teal-100 text-teal-700',checkin:'bg-green-100 text-green-700',completada:'bg-gray-100 text-gray-600',cancelada:'bg-red-100 text-red-700'};
const eL={pendiente:'⏳',confirmada:'✅',checkin:'🏠',completada:'✔️',cancelada:'❌'};
const ReservaCard=({r,setVerDetalle,solicitarEliminarReserva,marcarCheckIn,marcarCheckOut})=>{
    const tp=calcularTotalPagado(r);
    const saldo=(parseFloat(r.precioTotal)||0)-tp;
    const tinajas=(r.diasTinaja?.length||0)+(r.tinajaAdicional?.length||0);
    const abrirWA=()=>{
        const n=formatearTelefonoWA(r.telefono);
        if(!n){showToast('Esta reserva no tiene teléfono registrado.');return;}
        const msg=typeof generarMsg==='function'?generarMsg(r,'confirmacion'):'Hola '+r.cliente+'!';
        window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank');
    };
    return (
        <div className={`bg-white rounded-xl p-4 border-2 border-gray-200 ${r.cabana==='principal'?'border-l-4 border-l-green-500':'border-l-4 border-l-purple-500'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">{r.cliente}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eC[estadoReserva(r)]}`}>{eL[estadoReserva(r)]} {estadoReserva(r)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{(typeof getCabanas==='function'?getCabanas():CABANAS)[r.cabana]?.nombre} · {r.personas}p{tinajas>0?` · 🛁 ${tinajas}d`:''}</p>
                </div>
                {saldo>0&&<div className="bg-red-100 px-2 py-1 rounded-lg text-xs font-bold text-red-700 shrink-0">Debe ${saldo.toLocaleString('es-CL')}</div>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <span>📅 {new Date(r.fechaInicio+'T12:00:00').toLocaleDateString('es-CL')}</span>
                <span>→ {new Date(r.fechaFin+'T12:00:00').toLocaleDateString('es-CL')}</span>
            </div>
            {r.telefono&&<p className="text-sm text-gray-500 mb-2">📱 {r.telefono}</p>}
            {(()=>{
                const hoyS=new Date().toISOString().split('T')[0];
                const puedeCI=estadoReserva(r)==='confirmada'&&r.fechaInicio===hoyS;
                const puedeCO=estadoReserva(r)==='checkin'&&r.fechaFin===hoyS;
                return (puedeCI||puedeCO)&&marcarCheckIn&&marcarCheckOut&&(
                    <div className="flex gap-2 mb-2">
                        {puedeCI&&<button onClick={()=>marcarCheckIn(r)} className="flex-1 p-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 min-h-[40px]">🏠 Check-in</button>}
                        {puedeCO&&<button onClick={()=>marcarCheckOut(r)} className="flex-1 p-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 min-h-[40px]">✔️ Check-out</button>}
                    </div>
                );
            })()}
            <div className="flex flex-wrap gap-2">
                <button onClick={()=>setVerDetalle(r)} className="flex-1 min-w-[80px] p-2 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm hover:bg-teal-600 min-h-[44px]"><EyeIcon/>Ver</button>
                <button onClick={()=>irReserva(r.id)} className="flex-1 min-w-[80px] p-2 bg-gray-200 rounded-lg font-bold flex items-center justify-center gap-1 text-sm hover:bg-gray-300 min-h-[44px]"><EditIcon/>Editar</button>
                {r.telefono&&<button onClick={abrirWA} className="p-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm hover:bg-green-200 min-h-[44px] min-w-[44px] flex items-center justify-center" title="WhatsApp"><WaIcon/></button>}
                <button onClick={()=>solicitarEliminarReserva(r)} className="p-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Eliminar"><TrashIcon/></button>
            </div>
        </div>
    );
};

const VistaLista=({reservas,setVerDetalle,solicitarEliminarReserva,marcarCheckIn,marcarCheckOut,exportar,importar,busqueda,setBusqueda})=>{
    const [pag, setPag] = useState(0);
    const [filtroCabana, setFiltroCabana] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroDesde, setFiltroDesde] = useState('');
    const [filtroHasta, setFiltroHasta] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('fechaInicio');
    const [ordenDir, setOrdenDir] = useState('desc');
    const [showFiltros, setShowFiltros] = useState(false);
    const POR_PAGINA = 20;
    const tieneFiltros = busqueda||filtroCabana||filtroEstado||filtroDesde||filtroHasta;
    const limpiarFiltros = ()=>{ setBusqueda(''); setFiltroCabana(''); setFiltroEstado(''); setFiltroDesde(''); setFiltroHasta(''); setPag(0); };
    useEffect(()=>{ setPag(0); }, [busqueda, filtroCabana, filtroEstado, filtroDesde, filtroHasta, ordenarPor, ordenDir]);
    const rfBase=reservas.filter(r=>{
        if(busqueda){
            const q=(busqueda||'').trim().toLowerCase();
            const qTel=typeof normalizarTelefono==='function'?normalizarTelefono(busqueda):(busqueda||'').replace(/\D/g,'');
            const matchName=(r.cliente||'').toLowerCase().includes(q);
            const telNorm=(r.telefono||'').replace(/\D/g,'');
            const matchTel=qTel.length>=5&&telNorm&&(telNorm.includes(qTel)||qTel.includes(telNorm)||telNorm.slice(-8)===qTel.slice(-8));
            if(!matchName&&!matchTel) return false;
        }
        if(filtroCabana&&r.cabana!==filtroCabana) return false;
        if(filtroEstado&&estadoReserva(r)!==filtroEstado) return false;
        if(filtroDesde&&(r.fechaInicio||'').substring(0,10)<filtroDesde) return false;
        if(filtroHasta&&(r.fechaInicio||'').substring(0,10)>filtroHasta) return false;
        return true;
    });
    const rf=rfBase.slice().sort((a,b)=>{
        let vA,vB;
        if(ordenarPor==='fechaInicio'){ vA=(a.fechaInicio||'').substring(0,10); vB=(b.fechaInicio||'').substring(0,10); return ordenDir==='asc'?vA.localeCompare(vB):vB.localeCompare(vA); }
        if(ordenarPor==='fechaFin'){ vA=(a.fechaFin||'').substring(0,10); vB=(b.fechaFin||'').substring(0,10); return ordenDir==='asc'?vA.localeCompare(vB):vB.localeCompare(vA); }
        if(ordenarPor==='cliente'){ vA=(a.cliente||'').toLowerCase(); vB=(b.cliente||'').toLowerCase(); return ordenDir==='asc'?vA.localeCompare(vB):vB.localeCompare(vA); }
        if(ordenarPor==='saldo'){ vA=(parseFloat(a.precioTotal)||0)-calcularTotalPagado(a); vB=(parseFloat(b.precioTotal)||0)-calcularTotalPagado(b); return ordenDir==='asc'?vA-vB:vB-vA; }
        return 0;
    });
    const totalPags = Math.ceil(rf.length / POR_PAGINA);
    const rfPag = rf.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA);
    const desde = pag * POR_PAGINA + 1;
    const hasta = Math.min((pag + 1) * POR_PAGINA, rf.length);
    const emptyPorFiltros = tieneFiltros && rf.length === 0;
    const emptySinReservas = reservas.length === 0;

    return (
        <div data-tour="vista-lista" className="p-4">
            <div className="mb-4 relative">
                <div className="absolute left-4 top-4 text-gray-400"><SearchIcon/></div>
                <input type="text" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por nombre o teléfono..." className="w-full p-4 pl-14 text-lg border-2 border-gray-300 rounded-xl min-h-[44px]" aria-label="Buscar reservas"/>
            </div>
            <button onClick={()=>setShowFiltros(!showFiltros)} className="mb-4 sm:hidden w-full p-3 bg-gray-200 rounded-xl text-sm font-medium flex items-center justify-between">
                Filtros y orden {tieneFiltros&&<span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">activos</span>}
                <span className="text-gray-500">{showFiltros?'▲':'▼'}</span>
            </button>
            <div className={`mb-4 flex flex-wrap gap-2 items-center ${showFiltros?'':'hidden sm:flex'}`}>
                <select value={filtroCabana} onChange={e=>setFiltroCabana(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] min-w-[100px]">
                    <option value="">Todas las cabañas</option>
                    {getCabanaIds().map(id=>(<option key={id} value={id}>{getCabanas()[id]?.nombre||id}</option>))}
                </select>
                <select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] min-w-[120px]">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="checkin">Check-in</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
                <input type="date" value={filtroDesde} onChange={e=>setFiltroDesde(e.target.value)} placeholder="Desde" className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] w-36" aria-label="Filtrar desde"/>
                <input type="date" value={filtroHasta} onChange={e=>setFiltroHasta(e.target.value)} placeholder="Hasta" className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] w-36" aria-label="Filtrar hasta"/>
                {tieneFiltros&&<button onClick={limpiarFiltros} className="p-2 bg-gray-200 rounded-xl text-sm font-medium min-h-[44px] hover:bg-gray-300">Limpiar filtros</button>}
                <select value={ordenarPor} onChange={e=>setOrdenarPor(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] min-w-[120px]">
                    <option value="fechaInicio">Por entrada</option>
                    <option value="fechaFin">Por salida</option>
                    <option value="cliente">Por cliente</option>
                    <option value="saldo">Por saldo</option>
                </select>
                <select value={ordenDir} onChange={e=>setOrdenDir(e.target.value)} className="p-2 border-2 border-gray-300 rounded-xl text-sm min-h-[44px] w-24">
                    <option value="desc">Más reciente</option>
                    <option value="asc">Más antigua</option>
                </select>
            </div>
            <div className="mb-4 flex gap-2">
                <button onClick={exportar} className="flex-1 p-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 text-sm min-h-[44px]"><DlIcon/>Respaldar</button>
                <label className="flex-1 p-3 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 cursor-pointer text-sm min-h-[44px]"><UpIcon/>Importar<input type="file" accept=".json" onChange={importar} className="hidden"/></label>
            </div>
            {rf.length>0&&<p className="text-sm text-gray-600 mb-3" role="status">Mostrando {desde}–{hasta} de {rf.length} reservas</p>}
            <div className="space-y-3">
                {rfPag.map(r=>(
                    <ReservaCard key={r.id} r={r} setVerDetalle={setVerDetalle} solicitarEliminarReserva={solicitarEliminarReserva} marcarCheckIn={marcarCheckIn} marcarCheckOut={marcarCheckOut}/>
                ))}
                {rfPag.length===0&&(
                    <div className="text-center py-12 text-gray-500">
                        <div className="flex justify-center mb-4 text-4xl"><UsersIcon/></div>
                        <p className="text-xl font-medium">{emptySinReservas?'No hay reservas':'Sin resultados'}</p>
                        <p className="text-sm mt-1">{emptyPorFiltros?`No se encontraron reservas con los filtros aplicados${busqueda?` para "${busqueda}"`:''}.`:'Agrega una nueva reserva para empezar.'}</p>
                    </div>
                )}
            </div>
            {totalPags>1&&(
                <div className="flex items-center justify-between gap-2 py-4">
                    <button onClick={()=>setPag(p=>Math.max(0,p-1))} disabled={pag===0} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-teal-700 min-h-[44px]">← Anterior</button>
                    <span className="text-sm text-gray-600 font-medium">Página {pag+1} de {totalPags}</span>
                    <button onClick={()=>setPag(p=>Math.min(totalPags-1,p+1))} disabled={pag>=totalPags-1} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-teal-700 min-h-[44px]">Siguiente →</button>
                </div>
            )}
        </div>
    );
};

ReactDOM.render(<ErrorBoundary><App/></ErrorBoundary>, document.getElementById('root'));