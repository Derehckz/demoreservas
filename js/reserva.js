// reserva.js — App de crear/editar reserva (3 pasos)
// Depende de: React, ReactDOM (global), js/config.js (CABANAS, calcularNoches, calcularPrecio, normalizaFecha, formatearTelefonoWA, normalizarTelefono)

const { useState, useEffect, useRef } = React;

const BORRADOR_KEY = 'mis_reservas_borrador';

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
                    <button onClick={()=>window.location.href='index.html'} className="w-full bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 mb-2">Volver al inicio</button>
                    <button onClick={()=>window.location.reload()} className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300">Recargar</button>
                </div>
            </div>
        );
        return this.props.children;
    }
}

// authFetch → definido en js/config.js

const BackIcon   = ()=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>);
const TrashIcon  = ()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>);
const PencilIcon = ()=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);

/** Sanitiza input de dinero: solo dígitos y un punto decimal. Permite vacío. Evita type="number" (flechas +1, no borrar 0). */
const sanitizeMoneyInput = (v) => {
    const s = String(v || '').replace(',', '.');
    if (s === '') return '';
    const m = s.match(/^\d*\.?\d*$/);
    return m ? m[0] : '';
};
/** Valor para mostrar en input de dinero. Permite campo vacío para escribir cómodo. */
const formatMoneyInputValue = (v) => {
    if (v === '' || v === null || v === undefined) return '';
    const n = parseFloat(v);
    return isNaN(n) ? '' : String(v);
};

const getCabanasActivas = () => {
    const c = window.CABANAS || typeof CABANAS !== 'undefined' ? CABANAS : {};
    return Object.entries(c).filter(([_, v]) => v && v.activa !== false);
};

const App = () => {
    const [cabanas, setCabanas] = useState(() => getCabanasActivas());
    const [reservas,    setReservas]    = useState([]);
    const [paso,        setPaso]        = useState(1);
    const [editId,      setEditId]      = useState(null);
    const primeraActiva = cabanas.length ? cabanas[0][0] : 'principal';
    const [datos,       setDatos]       = useState({
        id: Date.now() * 10000 + Math.floor(Math.random() * 10000),
        cliente: '',
        telefono: '',
        cabana: 'principal',
        fechaInicio: '',
        fechaFin: '',
        personas: 2,
        diasTinaja: [],
        precioTotal: '',
        abonos: [],
        tinajaAdicional: [],
        descuento: '',
        notas: '',
        origen: 'whatsapp',
        estado: 'pendiente'
    });
    const [conflictos,      setConflictos]      = useState([]);
    const [showAbono,       setShowAbono]       = useState(false);
    const [abonoForm,       setAbonoForm]       = useState({ monto:'', metodo:'transferencia', fecha:new Date().toISOString().split('T')[0], nota:'' });
    const [editAbonoId,     setEditAbonoId]     = useState(null);
    const [guardadoOk,      setGuardadoOk]      = useState(false);
    const [saving,          setSaving]          = useState(false);
    const [deleting,        setDeleting]        = useState(false);
    const [confirmarEliminar, setConfirmarEliminar] = useState(false);
    const [errores,         setErrores]         = useState({});
    const [loadErrorEdit, setLoadErrorEdit]  = useState(false);
    const [idFromUrl, setIdFromUrl] = useState(() => new URLSearchParams(window.location.search).get('id'));
    const duplicarId = (() => { const p = new URLSearchParams(window.location.search).get('duplicar'); return p || null; })();
    const desdeUrl = (() => { const p = new URLSearchParams(window.location.search).get('desde'); return (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) ? p : ''; })();
    const skipNextRecalc = useRef(false);
    const [modoRapido, setModoRapido] = useState(() => { try { return localStorage.getItem('mis_reservas_modo_rapido') === '1'; } catch { return false; } });
    const [ultimoGuardado, setUltimoGuardado] = useState(null);

    useEffect(() => {
        authFetch('/.netlify/functions/listarreservas')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setReservas(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        authFetch('/.netlify/functions/obtenerconfig')
            .then(r => r.json())
            .then(data => {
                if (data && typeof data === 'object') {
                    window.CABANAS = data;
                    setCabanas(getCabanasActivas());
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const ids = cabanas.map(([id]) => id);
        if (ids.length && !ids.includes(datos.cabana)) {
            setDatos(prev => ({ ...prev, cabana: ids[0] }));
        }
    }, [cabanas]);

    const cargarReservaPorId = (id) => {
        if (!id) return;
        setLoadErrorEdit(false);
        authFetch('/.netlify/functions/obtenerreserva?id=' + encodeURIComponent(id))
            .then(res => res.json())
            .then(data => {
                if (data && data.id) {
                    skipNextRecalc.current = true;
                    setDatos(prev => ({
                        ...prev,
                        ...data,
                        abonos: Array.isArray(data.abonos) ? data.abonos : [],
                        diasTinaja: Array.isArray(data.diasTinaja) ? data.diasTinaja : [],
                        tinajaAdicional: Array.isArray(data.tinajaAdicional) ? data.tinajaAdicional : [],
                        cliente: data.cliente ?? '',
                        telefono: data.telefono ?? '',
                        cabana: data.cabana ?? 'principal',
                        fechaInicio: normalizaFecha(typeof data.fechaInicio === 'string' ? data.fechaInicio : (data.fechaInicio ?? '')),
                        fechaFin: normalizaFecha(typeof data.fechaFin === 'string' ? data.fechaFin : (data.fechaFin ?? '')),
                        personas: data.personas ?? 2,
                        precioTotal: data.precioTotal ?? '',
                        descuento: (data.descuento == null || data.descuento === '' || data.descuento === 0) ? '' : String(data.descuento),
                        notas: data.notas ?? '',
                        origen: data.origen ?? 'whatsapp',
                        estado: data.estado ?? 'pendiente'
                    }));
                    setEditId(data.id);
                } else {
                    showToast('No se encontró la reserva. Puede haber sido eliminada.');
                    window.location.replace('index.html');
                }
            })
            .catch(err => {
                console.error('Error al obtener la reserva:', err);
                showToast('Error al cargar la reserva. Verifica tu conexión.');
                setLoadErrorEdit(true);
            });
    };

    useEffect(() => {
        if (modoRapido && !idFromUrl && !duplicarId && !editId) setPaso(2);
    }, [modoRapido, idFromUrl, duplicarId, editId]);

    useEffect(() => {
        if (idFromUrl) cargarReservaPorId(idFromUrl);
        else if (duplicarId) {
            authFetch('/.netlify/functions/obtenerreserva?id=' + encodeURIComponent(duplicarId))
                .then(res => res.json())
                .then(data => {
                    if (data && data.id) {
                        const base = { ...data, id: Date.now() * 10000 + Math.floor(Math.random() * 10000), fechaInicio: '', fechaFin: '', abonos: [], diasTinaja: [], tinajaAdicional: [], precioTotal: '', estado: 'pendiente' };
                        setDatos(prev => ({ ...prev, ...base, cliente: data.cliente ?? '', telefono: data.telefono ?? '', cabana: data.cabana ?? 'principal', personas: data.personas ?? 2, notas: data.notas ?? '', origen: data.origen ?? 'whatsapp' }));
                        setEditId(null);
                        window.history.replaceState({}, '', 'reserva.html');
                    }
                })
                .catch(() => showToast('No se pudo cargar la reserva a duplicar.'));
        } else if (desdeUrl) setDatos(prev => ({ ...prev, fechaInicio: desdeUrl }));
    }, []);

    // Borrador: guardar en localStorage (solo nueva reserva, no al editar)
    useEffect(() => {
        if (editId || guardadoOk) return;
        const key = BORRADOR_KEY;
        const tieneDatos = datos.cliente?.trim() || datos.fechaInicio || datos.fechaFin;
        if (!tieneDatos) { try { localStorage.removeItem(key); } catch {}; return; }
        const t = setTimeout(() => { try { localStorage.setItem(key, JSON.stringify({ datos, ts: Date.now() })); } catch {}; }, 500);
        return () => clearTimeout(t);
    }, [datos, editId, guardadoOk]);

    // Borrador: ofrecer restaurar al cargar
    useEffect(() => {
        if (idFromUrl || duplicarId || editId) return;
        try {
            const raw = localStorage.getItem(BORRADOR_KEY);
            if (!raw) return;
            const { datos: d, ts } = JSON.parse(raw);
            if (!d || (Date.now() - (ts || 0)) > (typeof MS_PER_DAY !== 'undefined' ? MS_PER_DAY : 86400000) * (typeof DIAS_BORRADOR_EXPIRA !== 'undefined' ? DIAS_BORRADOR_EXPIRA : 2)) { localStorage.removeItem(BORRADOR_KEY); return; }
            if (confirm('¿Restaurar el borrador de reserva que dejaste sin guardar?')) {
                setDatos(prev => ({ ...prev, ...d, id: prev.id }));
            } else {
                localStorage.removeItem(BORRADOR_KEY);
            }
        } catch {}
    }, []);

    // Tour guiado en reserva (primer ingreso a esta página)
    useEffect(() => {
        if (localStorage.getItem('mis_reservas_tour_reserva_visto') === '1') return;
        if (editId) return; // No tour al editar
        const driverFn = (() => {
            try {
                if (window.driver && typeof window.driver.js === 'function' && !window.driver.js.driver) {
                    window.driver.js(window.driver.js);
                }
                return window.driver && window.driver.js && window.driver.js.driver;
            } catch (_) { return null; }
        })();
        if (typeof driverFn !== 'function') return;
        const t = setTimeout(() => {
            try {
                const driverObj = driverFn({
                    showProgress: true,
                    nextBtnText: 'Siguiente',
                    prevBtnText: 'Anterior',
                    doneBtnText: '¡Entendido!',
                    progressText: '{{current}} de {{total}}',
                    onDestroyed: () => { localStorage.setItem('mis_reservas_tour_reserva_visto', '1'); },
                    steps: [
                        { popover: { title: 'Nueva reserva en 3 pasos', description: 'Te guiaremos: 1) Cliente (nombre, teléfono), 2) Reserva (cabaña, fechas, tinaja), 3) Pago (abonos). Puedes omitir con la X.' } },
                        { element: '[data-tour="reserva-pasos-bar"]', popover: { title: 'Progreso', description: 'Indica en qué paso estás. Puedes volver atrás tocando un paso completado.' } },
                        { element: '[data-tour="reserva-paso1-form"]', popover: { title: 'Paso 1: Cliente', description: 'Nombre obligatorio. Teléfono para WhatsApp. Origen y notas opcionales. Luego «Siguiente: Reserva».' } },
                        { popover: { title: 'Paso 2: Reserva', description: 'Elige cabaña y fechas. La salida debe ser ≥ entrada. Si hay conflicto de fechas se avisará. Puedes marcar días de tinaja.' } },
                        { popover: { title: 'Paso 3: Pago', description: 'Registra abonos (transferencia o efectivo). El estado se calcula según lo pagado. Guarda cuando termines.' } },
                        { popover: { title: '¡Listo!', description: 'Rellena los datos y guarda.' } }
                    ]
                });
                driverObj.drive();
            } catch (_) {}
        }, 600);
        return () => clearTimeout(t);
    }, [editId]);

    useEffect(()=>{
        if(skipNextRecalc.current){ skipNextRecalc.current=false; return; }
        const pc=calcularPrecio(datos.cabana,datos.fechaInicio,datos.fechaFin,datos.personas,datos.diasTinaja);
        const taExtra=(datos.tinajaAdicional||[]).reduce((s,t)=>s+(parseFloat(t.precio)||0),0);
        const desc=parseFloat(datos.descuento)||0;
        const total=Math.max(0,(pc+taExtra)-desc);
        if(pc>0||taExtra>0||desc>0) setDatos(prev=>({...prev,precioTotal:total}));
    },[datos.cabana,datos.fechaInicio,datos.fechaFin,datos.personas,datos.diasTinaja,datos.descuento,datos.tinajaAdicional]);

    useEffect(()=>{
        if(datos.fechaInicio&&datos.fechaFin&&datos.cabana){
            setConflictos(reservas.filter(r=>{
                if(editId&&String(r.id)===String(editId)) return false;
                if(r.cabana!==datos.cabana) return false;
                if((r.estado||'').toLowerCase()==='cancelada') return false;
                const iniA = new Date(datos.fechaInicio);
                const finA = new Date(datos.fechaFin);
                const iniB = new Date(r.fechaInicio||r.fecha_inicio);
                const finB = new Date(r.fechaFin||r.fecha_fin);
                if(isNaN(iniA)||isNaN(finA)||isNaN(iniB)||isNaN(finB)) return false;
                return (iniA < finB && finA > iniB);
            }));
        } else setConflictos([]);
    },[datos.fechaInicio,datos.fechaFin,datos.cabana,reservas,editId]);

    const totalPagado = (datos.abonos||[]).reduce((s,a)=>s+(parseFloat(a.monto)||0),0);
    const saldo       = (parseFloat(datos.precioTotal)||0)-totalPagado;

    const resetAbonoForm = ()=>{ setAbonoForm({monto:'',metodo:'transferencia',fecha:new Date().toISOString().split('T')[0],nota:''}); setEditAbonoId(null); setShowAbono(false); };

    const guardarAbono = ()=>{
        if(!abonoForm.monto||parseFloat(abonoForm.monto)<=0){ showToast('Ingresa un monto válido'); return; }
        if(editAbonoId){
            setDatos({...datos,abonos:(datos.abonos||[]).map(a=>a.id===editAbonoId?{...a,monto:parseFloat(abonoForm.monto),metodo:abonoForm.metodo,fecha:abonoForm.fecha,nota:abonoForm.nota}:a)});
        } else {
            setDatos({...datos,abonos:[...(datos.abonos||[]),{id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),monto:parseFloat(abonoForm.monto),metodo:abonoForm.metodo,fecha:abonoForm.fecha,nota:abonoForm.nota}]});
        }
        resetAbonoForm();
    };

    const editarAbono = (a)=>{ setEditAbonoId(a.id); setAbonoForm({monto:a.monto,metodo:a.metodo,fecha:a.fecha,nota:a.nota||''}); setShowAbono(true); };

    /** Envía la reserva a la API (crear/actualizar); en éxito redirige al inicio. */
    const guardar = ()=>{
        if(!datos.cliente.trim()||!datos.fechaInicio||!datos.fechaFin){ showToast('Completa nombre y fechas'); return; }
        if(conflictos.length>0){
            showToast('Ya existe una reserva para esta cabaña en esas fechas.');
            return;
        }
        if(parseFloat(datos.precioTotal)<=0){
            if(!confirm('El precio total es $0. ¿Confirmas guardar sin costo?')) return;
        }
        setSaving(true);
        const estado = calcularEstadoReserva(datos, totalPagado);
        const df = { ...datos, descuento: parseFloat(datos.descuento) || 0, pagado: totalPagado, estado };
        authFetch('/.netlify/functions/guardarreserva', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(df)
        })
        .then(async res => {
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                let msg = 'Error HTTP: ' + res.status;
                try { const errJson = await res.json(); msg += (errJson.error ? (' - ' + errJson.error) : ''); } catch {}
                throw new Error(msg);
            }
            if (contentType.includes('application/json')) return res.json();
            const text = await res.text();
            throw new Error('Respuesta inesperada del servidor: ' + text.slice(0,100));
        })
        .then(() => {
            try { localStorage.removeItem(BORRADOR_KEY); } catch {}
            setGuardadoOk(true);
            setUltimoGuardado({ telefono: datos.telefono || '', cliente: datos.cliente || '' });
            showToast('Reserva guardada', 'success');
        })
        .catch(err => { setSaving(false); showToast('Error al guardar: ' + err.message); });
    };

    const eliminar = ()=>{
        if(!editId) return;
        setConfirmarEliminar(true);
    };
    const eliminarConfirmado = ()=>{
        if(!editId) return;
        setDeleting(true);
        setConfirmarEliminar(false);
        authFetch('/.netlify/functions/eliminarreserva?id=' + encodeURIComponent(editId), { method: 'DELETE' })
            .then(res => res.json())
            .then(resp => {
                if(resp.ok){ setGuardadoOk(true); showToast('Reserva eliminada', 'success'); setTimeout(()=>{ window.location.href='index.html'; }, 1000); }
                else { setDeleting(false); showToast('Error al eliminar: ' + (resp.error || 'Desconocido')); }
            })
            .catch(err => { setDeleting(false); showToast('Error al eliminar: ' + err.message); });
    };

    if(guardadoOk) {
        const waNum = ultimoGuardado?.telefono && typeof formatearTelefonoWA === 'function' ? formatearTelefonoWA(ultimoGuardado.telefono) : '';
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full space-y-3">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-800">¡Reserva guardada!</h2>
                    <p className="text-green-600 mt-1 mb-4">{ultimoGuardado?.cliente ? `Reserva de ${ultimoGuardado.cliente}` : ''}</p>
                    <a href="index.html" className="block w-full p-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">📋 Ver en panel</a>
                    <button onClick={()=>{ setGuardadoOk(false); setUltimoGuardado(null); setDatos({ id: Date.now()*10000+Math.floor(Math.random()*10000), cliente:'', telefono:'', cabana:datos.cabana, fechaInicio:'', fechaFin:'', personas:datos.personas, diasTinaja:[], precioTotal:'', abonos:[], tinajaAdicional:[], descuento:'', notas:'', origen:datos.origen, estado:'pendiente' }); setPaso(modoRapido?2:1); }} className="block w-full p-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">➕ Crear otra reserva</button>
                    {waNum && <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="block w-full p-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2">📱 Abrir WhatsApp</a>}
                </div>
            </div>
        );
    }

    if (loadErrorEdit && idFromUrl) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
                <p className="text-red-600 font-bold mb-4">No se pudo cargar la reserva. Verifica tu conexión.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => cargarReservaPorId(idFromUrl)} className="w-full p-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">Reintentar</button>
                    <a href="index.html" className="w-full p-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 text-center">Volver al inicio</a>
                </div>
            </div>
        </div>
    );

    const PASOS = [{num:1,label:'Cliente'},{num:2,label:'Reserva'},{num:3,label:'Pago'}];
    const noches = calcularNoches(datos.fechaInicio,datos.fechaFin);

    if (!datos || typeof datos !== 'object') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="bg-white p-8 rounded-xl shadow text-center">
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Error de datos</h2>
                    <p className="text-red-500">No se pudo cargar la reserva. Intenta recargar la página o volver al inicio.</p>
                    <button className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold" onClick={()=>window.location.href='index.html'}>Volver al inicio</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
                <button onClick={()=>window.location.href='index.html'} className="p-1.5 rounded-full hover:bg-teal-500"><BackIcon/></button>
                <h1 className="flex-1 text-lg font-bold font-heading">{editId?'Editar':'Nueva'} Reserva</h1>
                {!editId&&<button onClick={()=>{ const v=!modoRapido; setModoRapido(v); try{localStorage.setItem('mis_reservas_modo_rapido',v?'1':'');}catch{}; if(v) setPaso(2); }} className={`text-xs px-2 py-1 rounded-lg ${modoRapido?'bg-teal-500':'bg-teal-700/50'}`} title="Empezar por fechas">⚡Rápido</button>}
                {editId&&<button onClick={eliminar} disabled={deleting} className="p-1.5 bg-red-600 rounded-full hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center" title={deleting?'Eliminando…':'Eliminar'}>{deleting?'…':<TrashIcon/>}</button>}
            </div>
            <div data-tour="reserva-pasos-bar" className="bg-white border-b px-4 py-3 flex items-center justify-center gap-2 sticky top-14 z-10 shadow-sm">
                {PASOS.map((p,i)=>(
                    <React.Fragment key={p.num}>
                        <button
                            onClick={()=>{ if(p.num<paso||(p.num===2&&(datos.cliente.trim()||modoRapido))||(p.num===3&&(datos.cliente.trim()||modoRapido)&&datos.fechaInicio)) setPaso(p.num); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${paso===p.num?'bg-teal-600 text-white shadow':p.num<paso?'bg-green-500 text-white cursor-pointer':'bg-gray-200 text-gray-400'}`}>
                            <span>{p.num<paso?'✓':p.num}</span><span>{p.label}</span>
                        </button>
                        {i<2&&<div className={`h-0.5 w-8 rounded ${p.num<paso?'bg-green-400':'bg-gray-200'}`}/>}
                    </React.Fragment>
                ))}
            </div>
            <div data-tour={`reserva-paso${paso}`} className="max-w-lg mx-auto p-4 pb-10 space-y-4">
                {paso===1&&(<PasoCliente datos={datos} setDatos={setDatos} errores={errores} setErrores={setErrores} setPaso={setPaso} reservas={reservas} editId={editId} />)}
                {paso===2&&(<PasoReserva datos={datos} setDatos={setDatos} conflictos={conflictos} errores={errores} setErrores={setErrores} setPaso={setPaso} editId={editId} cabanas={cabanas} />)}
                {paso===3&&(<PasoPago datos={datos} setDatos={setDatos} noches={noches} showAbono={showAbono} setShowAbono={setShowAbono} abonoForm={abonoForm} setAbonoForm={setAbonoForm} editAbonoId={editAbonoId} setEditAbonoId={setEditAbonoId} resetAbonoForm={resetAbonoForm} guardarAbono={guardarAbono} editarAbono={editarAbono} totalPagado={totalPagado} saldo={saldo} setPaso={setPaso} guardar={guardar} saving={saving} deleting={deleting} editId={editId} eliminar={eliminar} />)}
            </div>
            {confirmarEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar esta reserva?</h3>
                        <p className="text-gray-600 mb-4">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={()=>setConfirmarEliminar(false)} className="flex-1 p-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                            <button onClick={eliminarConfirmado} disabled={deleting} className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Paso 1: Cliente ───────────────────────────────────
const PasoCliente = ({ datos, setDatos, errores, setErrores, setPaso, reservas, editId }) => {
    const [sugerencias, setSugerencias] = useState([]);
    const [showSugerencias, setShowSugerencias] = useState(false);
    const normalizar = (t) => (typeof t === 'string' ? t : String(t || '')).replace(/\D/g, '');
    const coincidencias = React.useMemo(() => {
        if (!reservas || reservas.length === 0) return [];
        const excluir = editId ? String(editId) : null;
        return reservas.filter(r => (excluir && String(r.id) === excluir) ? false : ((r.cliente && r.cliente.trim()) || (r.telefono && String(r.telefono).replace(/\D/g,'').length >= 8))).slice(0, 50);
    }, [reservas, editId]);
    const buscarSugerencias = (nombre, tel) => {
        const n = (nombre || '').trim().toLowerCase();
        const t = normalizar(tel || '');
        if (n.length < 2 && t.length < 4) { setSugerencias([]); return; }
        const matches = coincidencias.filter(r => {
            const cn = (r.cliente || '').toLowerCase();
            const ct = normalizar(r.telefono || '');
            return (n.length >= 2 && cn.includes(n)) || (t.length >= 4 && ct.includes(t));
        });
        setSugerencias(matches.slice(0, 5));
    };
    useEffect(() => { buscarSugerencias(datos.cliente, datos.telefono); }, [datos.cliente, datos.telefono]);
    const aplicarSugerencia = (r) => {
        setDatos(prev => ({ ...prev, cliente: r.cliente || prev.cliente, telefono: r.telefono || prev.telefono }));
        setShowSugerencias(false);
    };
    const onPasteTelefono = (e) => {
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        if (!pasted || !/[\d]/.test(pasted)) return;
        e.preventDefault();
        const limpio = pasted.replace(/\D/g, '');
        if (limpio.length < 8) return;
        let num = limpio.startsWith('56') ? limpio : (limpio.startsWith('9') ? '56' + limpio : '56' + (limpio.length === 9 ? limpio : '9' + limpio));
        setDatos(prev => ({ ...prev, telefono: num }));
    };
    const validarEnTiempoReal = () => {
        const errs = {};
        if (datos.cliente.trim() && datos.cliente.trim().length < 2) errs.cliente = 'Nombre muy corto';
        if (datos.telefono && normalizar(datos.telefono).length > 0 && normalizar(datos.telefono).length < 8) errs.telefono = 'Mínimo 8 dígitos';
        setErrores(prev => ({ ...prev, ...errs }));
    };
    return (
        <>
            <div data-tour="reserva-paso1-form" className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-700 mb-4">👤 Datos del cliente</h2>
                <div className="space-y-4">
                    <div className="relative" onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Nombre completo *</label>
                        <input type="text" value={datos.cliente} onChange={e=>{ setDatos({...datos,cliente:e.target.value}); setShowSugerencias(true); }} onFocus={() => setShowSugerencias(true)} onBlur={validarEnTiempoReal} className={`w-full p-3 text-lg border-2 rounded-xl focus:border-teal-500 focus:outline-none ${errores.cliente ? 'border-red-300' : 'border-gray-200'}`} placeholder="Ej: Juan Pérez" />
                        {errores.cliente && <p className="text-red-600 text-xs mt-1">⚠️ {errores.cliente}</p>}
                        {showSugerencias && sugerencias.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-teal-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                                {sugerencias.map((r, i) => (
                                    <button key={r.id + '-' + i} type="button" onClick={() => aplicarSugerencia(r)} className="w-full text-left px-4 py-2 hover:bg-teal-50 flex justify-between items-center">
                                        <span className="font-medium">{r.cliente || 'Sin nombre'}</span>
                                        <span className="text-sm text-gray-500">{r.telefono || ''}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Teléfono</label>
                        <input type="tel" value={datos.telefono} onChange={e=>setDatos({...datos,telefono:e.target.value})} onPaste={onPasteTelefono} onBlur={validarEnTiempoReal} className={`w-full p-3 text-lg border-2 rounded-xl focus:border-teal-500 focus:outline-none ${errores.telefono ? 'border-red-300' : 'border-gray-200'}`} placeholder="+56 9 1234 5678" />
                        {errores.telefono && <p className="text-red-600 text-xs mt-1">⚠️ {errores.telefono}</p>}
                        <p className="text-xs text-gray-400 mt-1">Al pegar desde WhatsApp se normaliza automáticamente</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">¿Cómo llegó?</label>
                        <select value={datos.origen} onChange={e=>setDatos({...datos,origen:e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none">
                            <option value="whatsapp">📱 WhatsApp</option>
                            <option value="instagram">📸 Instagram</option>
                            <option value="facebook">👍 Facebook</option>
                            <option value="otro">🔗 Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Notas</label>
                        <textarea value={datos.notas} onChange={e=>setDatos({...datos,notas:e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none" rows="3" placeholder="Peticiones especiales, alergias, etc." />
                    </div>
                </div>
            </div>
            <button onClick={()=>{ const errs={}; if(!datos.cliente.trim()) errs.cliente='Ingresa el nombre del cliente'; if(datos.telefono&&normalizar(datos.telefono).length<8) errs.telefono='El teléfono debe tener al menos 8 dígitos'; if(Object.keys(errs).length){ setErrores(errs); return; } setErrores({}); setShowSugerencias(false); setPaso(2); }} className="w-full p-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 shadow">Siguiente: Reserva →</button>
        </>
    );
};

// ── Tinaja adicional (días con precio custom) ───────────
const TinajaAdicionalUI = ({ datos, setDatos, diasEstadia, cabanas }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [selDias, setSelDias] = useState([]);
    const cabs = cabanas && cabanas.length ? Object.fromEntries(cabanas) : (window.CABANAS || {});
    const cab = cabs[datos.cabana] || Object.values(cabs)[0];
    const precioBase = cab?.precioTinaja || 25000;
    const addTinaja = () => {
        if (selDias.length === 0) return;
        const nuevas = selDias.map(f => ({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), fecha: f, precio: precioBase }));
        setDatos({ ...datos, tinajaAdicional: [...(datos.tinajaAdicional || []), ...nuevas] });
        setSelDias([]);
        setShowAdd(false);
    };
    const delTinaja = (id) => {
        const t = (datos.tinajaAdicional || []).find(x => x.id === id);
        setDatos({ ...datos, tinajaAdicional: (datos.tinajaAdicional || []).filter(x => x.id !== id) });
    };
    const yaIncluidos = [...(datos.diasTinaja || []), ...(datos.tinajaAdicional || []).map(t => t.fecha)];
    return (
        <div>
            <label className="block text-sm font-bold mb-2 text-gray-600">🛁 Tinaja adicional (pedida después)</label>
            {showAdd && (
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-3 mb-2 space-y-2">
                    <p className="text-xs text-teal-700 font-bold">Selecciona días a agregar:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {diasEstadia.filter(f => !yaIncluidos.includes(f)).map(f => (
                            <label key={f} className="flex items-center gap-2 py-1 px-2 hover:bg-teal-100 rounded cursor-pointer">
                                <input type="checkbox" checked={selDias.includes(f)} onChange={e => setSelDias(e.target.checked ? [...selDias, f] : selDias.filter(d => d !== f))} className="w-4 h-4 accent-teal-500" />
                                <span className="text-sm">{new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            </label>
                        ))}
                    </div>
                    {selDias.length > 0 && <p className="text-sm font-bold text-teal-700">{selDias.length}d × ${precioBase.toLocaleString('es-CL')} = +${(selDias.length * precioBase).toLocaleString('es-CL')}</p>}
                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setShowAdd(false); setSelDias([]); }} className="flex-1 p-2 bg-gray-200 rounded-lg text-sm font-bold">Cancelar</button>
                        <button type="button" onClick={addTinaja} className="flex-1 p-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600">Agregar</button>
                    </div>
                </div>
            )}
            {(datos.tinajaAdicional || []).length === 0 ? (
                <button type="button" onClick={() => setShowAdd(true)} className="w-full p-3 border-2 border-dashed border-teal-200 rounded-xl text-teal-600 text-sm font-bold hover:bg-teal-50">+ Agregar tinaja adicional</button>
            ) : (
                <div className="space-y-1">
                    {(datos.tinajaAdicional || []).map(t => (
                        <div key={t.id} className="flex justify-between items-center bg-teal-50 rounded-lg p-2 border border-teal-200">
                            <span className="text-sm">🛁 {new Date((t.fecha||'').substring(0,10) + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-teal-700">+${(parseFloat(t.precio)||0).toLocaleString('es-CL')}</span>
                                <button type="button" onClick={() => delTinaja(t.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => setShowAdd(true)} className="text-teal-600 text-xs font-bold hover:underline">+ Más días</button>
                </div>
            )}
        </div>
    );
};

// ── Paso 2: Reserva ────────────────────────────────────
const PasoReserva = ({ datos, setDatos, conflictos, errores, setErrores, setPaso, editId, cabanas }) => {
    const today = new Date().toISOString().split('T')[0];
    const minEntrada = editId ? undefined : today;
    const minSalida = datos.fechaInicio || today;
    const maxEntrada = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })();
    const noches = calcularNoches(datos.fechaInicio, datos.fechaFin);
    let diasEstadia = [];
    if (noches > 0 && datos.fechaInicio) {
        const fiBase = (datos.fechaInicio || '').substring(0, 10);
        diasEstadia = Array.from({ length: noches }, (_, i) => { const f = new Date(fiBase + 'T12:00:00'); f.setDate(f.getDate() + i); return !isNaN(f) ? f.toISOString().split('T')[0] : null; }).filter(Boolean);
    }
    const toggleDiaTinaja = (f) => {
        const actual = datos.diasTinaja || [];
        if (actual.includes(f)) setDatos({ ...datos, diasTinaja: actual.filter(d => d !== f) });
        else setDatos({ ...datos, diasTinaja: [...actual, f] });
    };
    return (
        <>
            <div data-tour="reserva-paso2-form" className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-700 mb-4">🏡 Cabaña y fechas</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Cabaña</label>
                        <select value={datos.cabana} onChange={e => setDatos({ ...datos, cabana: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none">
                            {(cabanas && cabanas.length ? cabanas : getCabanasActivas()).map(([id, c]) => (
                                <option key={id} value={id}>{c?.nombre || id}</option>
                            ))}
                        </select>
                    </div>
                    {conflictos.length > 0 && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="font-bold text-red-700 text-sm">⚠️ Conflicto de fechas</p>
                            <p className="text-sm text-red-600">Ya existe una reserva para esta cabaña en las fechas elegidas. Elige otras fechas.</p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Entrada</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button type="button" onClick={() => setDatos({ ...datos, fechaInicio: today, fechaFin: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() })} className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-teal-100 text-gray-700 rounded-lg">Hoy</button>
                            <button type="button" onClick={() => { const m = new Date(); m.setDate(m.getDate() + 1); const m2 = new Date(m); m2.setDate(m2.getDate() + 1); setDatos({ ...datos, fechaInicio: m.toISOString().split('T')[0], fechaFin: m2.toISOString().split('T')[0] }); }} className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-teal-100 text-gray-700 rounded-lg">Mañana</button>
                            <button type="button" onClick={() => { const v = new Date(); const day = v.getDay(); const viernes = 5; const diff = (viernes - day + 7) % 7 || 7; const vi = new Date(v); vi.setDate(vi.getDate() + diff); const dom = new Date(vi); dom.setDate(dom.getDate() + 2); setDatos({ ...datos, fechaInicio: vi.toISOString().split('T')[0], fechaFin: dom.toISOString().split('T')[0] }); }} className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-teal-100 text-gray-700 rounded-lg">Fin de semana</button>
                        </div>
                        <input type="date" value={datos.fechaInicio} min={minEntrada} max={maxEntrada} onChange={e => setDatos({ ...datos, fechaInicio: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none" />
                        {errores.fechaInicio && <p className="text-red-600 text-xs mt-1">⚠️ {errores.fechaInicio}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Salida</label>
                        <input type="date" value={datos.fechaFin} min={minSalida} onChange={e => setDatos({ ...datos, fechaFin: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none" />
                        {errores.fechaFin && <p className="text-red-600 text-xs mt-1">⚠️ {errores.fechaFin}</p>}
                    </div>
                    {noches > 0 && <p className="text-sm text-gray-600 font-medium">{noches} noche{noches !== 1 ? 's' : ''}</p>}
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-600">Personas</label>
                        <input type="number" min="1" max={CABANAS[datos.cabana]?.maxPersonas || 10} value={datos.personas} onChange={e => setDatos({ ...datos, personas: parseInt(e.target.value, 10) || 1 })} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none" />
                    </div>
                    {diasEstadia.length > 0 && (
                        <>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-600">🛁 Días con tinaja (reserva)</label>
                                <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    {diasEstadia.map(f => (
                                        <label key={f} className="flex items-center gap-2 py-1.5 px-2 hover:bg-teal-50 rounded cursor-pointer">
                                            <input type="checkbox" checked={(datos.diasTinaja || []).includes(f)} onChange={() => toggleDiaTinaja(f)} className="w-4 h-4 accent-teal-500" />
                                            <span className="text-sm">{new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <TinajaAdicionalUI datos={datos} setDatos={setDatos} diasEstadia={diasEstadia} cabanas={cabanas} />
                        </>
                    )}
                    {editId && (
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-600">Estado</label>
                            <select value={datos.estado} onChange={e => setDatos({ ...datos, estado: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none">
                                <option value="pendiente">⏳ Pendiente</option>
                                <option value="confirmada">✅ Confirmada</option>
                                <option value="checkin">🏠 Check-in</option>
                                <option value="completada">✔️ Completada</option>
                                <option value="cancelada">❌ Cancelada</option>
                            </select>
                        </div>
                    )}
                    {!editId && <p className="text-xs text-gray-400">El estado se calcula automáticamente según los abonos.</p>}
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setPaso(1)} className="px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50">← Atrás</button>
                <button onClick={() => { const errs = {}; if (!datos.fechaInicio) errs.fechaInicio = 'Elige fecha de entrada'; if (!datos.fechaFin) errs.fechaFin = 'Elige fecha de salida'; if (datos.fechaInicio && datos.fechaFin && new Date(datos.fechaFin) <= new Date(datos.fechaInicio)) { errs.fechaFin = 'La fecha de salida debe ser posterior a la de entrada'; showToast('La fecha de salida debe ser después de la entrada.'); } if (Object.keys(errs).length) { setErrores(errs); return; } setErrores({}); setPaso(3); }} className="flex-1 p-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 shadow min-h-[44px]">Siguiente: Pago →</button>
            </div>
        </>
    );
};

// ── Paso 3: Pago ───────────────────────────────────────
const PasoPago = ({ datos, setDatos, noches, showAbono, setShowAbono, abonoForm, setAbonoForm, editAbonoId, setEditAbonoId, resetAbonoForm, guardarAbono, editarAbono, totalPagado, saldo, setPaso, guardar, saving, deleting, editId, eliminar }) => {
    return (
        <>
            <div data-tour="reserva-paso3-form" className="space-y-4">
                {!editId && (datos.cliente?.trim() && datos.fechaInicio && datos.fechaFin) && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                        <p className="text-sm font-bold text-emerald-800 mb-1">⚡ Guardar rápido</p>
                        <p className="text-xs text-emerald-700 mb-2">¿Solo confirmar? Puedes guardar ya y agregar pagos después desde el panel.</p>
                        <button onClick={guardar} disabled={saving} className="w-full p-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60">Crear reserva (sin abonos)</button>
                    </div>
                )}
                <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Resumen de la reserva</p>
                <p className="text-sm text-gray-800 font-bold">{datos.cliente || 'Cliente sin nombre'}</p>
                <p className="text-xs text-gray-600">{safeDateStr(datos.fechaInicio)} → {safeDateStr(datos.fechaFin)}</p>
                <p className="text-xs text-gray-600">{CABANAS[datos.cabana]?.nombre} · {noches || 0} noche{noches === 1 ? '' : 's'} · {datos.personas} persona{parseInt(datos.personas) === 1 ? '' : 's'}</p>
            </div>
            {noches > 0 && (() => { const c = CABANAS[datos.cabana]; const ppn = noches === 1 ? c.precioUnaNoche : c.precioVariasNoches; const pe = Math.max(0, parseInt(datos.personas) - c.maxPersonas); const desc = parseFloat(datos.descuento) || 0; return (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">💡 Desglose del precio</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">{noches} noche{noches > 1 ? 's' : ''} × ${ppn.toLocaleString('es-CL')}</span><span className="font-bold">${(noches * ppn).toLocaleString('es-CL')}</span></div>
                        {pe > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-orange-600">{pe} extra × ${c.precioExtraPorPersona.toLocaleString('es-CL')} × {noches}n</span><span className="font-bold text-orange-600">+${(pe * c.precioExtraPorPersona * noches).toLocaleString('es-CL')}</span></div>}
                        {datos.diasTinaja?.length > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-teal-600">🛁 Tinaja reserva {datos.diasTinaja.length}d × ${c.precioTinaja.toLocaleString('es-CL')}</span><span className="font-bold text-teal-600">+${(datos.diasTinaja.length * c.precioTinaja).toLocaleString('es-CL')}</span></div>}
                        {(datos.tinajaAdicional || []).length > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-teal-600">🛁 Tinaja adicional {(datos.tinajaAdicional || []).length}d</span><span className="font-bold text-teal-600">+${(datos.tinajaAdicional || []).reduce((s, t) => s + (parseFloat(t.precio) || 0), 0).toLocaleString('es-CL')}</span></div>}
                        {desc > 0 && <div className="flex justify-between py-2 border-b border-amber-200"><span className="text-amber-600">🎁 Descuento</span><span className="font-bold text-amber-600">−${desc.toLocaleString('es-CL')}</span></div>}
                    </div>
                </div>
            ); })()}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-bold mb-2 text-gray-600">🎁 Descuento (atención)</label>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-400">$</span>
                    <input type="text" inputMode="decimal" value={formatMoneyInputValue(datos.descuento)} onChange={e => { const v = sanitizeMoneyInput(e.target.value); setDatos({ ...datos, descuento: v }); }} className="flex-1 p-3 text-lg font-bold border-2 border-amber-200 rounded-xl bg-amber-50 focus:border-amber-500 focus:outline-none" placeholder="0" />
                </div>
                <p className="text-xs text-amber-600 mt-1">Monto que descontas. Se resta del total. Queda registrado para reportes.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-bold mb-2 text-gray-600">💰 Precio Total</label>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-400">$</span>
                    <input type="text" inputMode="decimal" value={formatMoneyInputValue(datos.precioTotal)} onChange={e => { const v = sanitizeMoneyInput(e.target.value); setDatos({ ...datos, precioTotal: v }); }} className="flex-1 p-3 text-2xl font-bold border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-teal-500 focus:outline-none" placeholder="0" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Calculado automáticamente (total − descuento), puedes modificarlo</p>
            </div>
            {parseFloat(datos.precioTotal) > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-amber-700 mb-1">💡 Anticipo sugerido (50%)</p>
                    <p className="text-3xl font-bold text-amber-800">${Math.round(parseFloat(datos.precioTotal) / 2).toLocaleString('es-CL')}</p>
                </div>
            )}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700">🏦 Abonos recibidos</h3>
                    <button onClick={() => setShowAbono(!showAbono)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600">+ Agregar</button>
                </div>
                {showAbono && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 space-y-3">
                        <p className="font-bold text-green-700 text-sm">{editAbonoId ? '✏️ Editar abono' : 'Nuevo abono'}</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 font-bold block mb-1">Monto</label>
                                <div className="flex gap-2">
                                    <input type="text" inputMode="decimal" value={formatMoneyInputValue(abonoForm.monto)} onChange={e => { const v = sanitizeMoneyInput(e.target.value); setAbonoForm({ ...abonoForm, monto: v }); }} className="flex-1 p-3 text-xl font-bold border-2 border-gray-200 rounded-xl" placeholder="0" />
                                    {parseFloat(datos.precioTotal) > 0 && (
                                        <button type="button" onClick={() => setAbonoForm({ ...abonoForm, monto: String(Math.round(parseFloat(datos.precioTotal) / 2)) })} className="px-3 py-2 text-xs font-bold bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 whitespace-nowrap" title="Rellenar con anticipo 50%">50%</button>
                                    )}
                                </div>
                            </div>
                            <div><label className="text-xs text-gray-500 font-bold block mb-1">Método</label><select value={abonoForm.metodo} onChange={e => setAbonoForm({ ...abonoForm, metodo: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl"><option value="transferencia">🏦 Transferencia</option><option value="efectivo">💵 Efectivo</option><option value="tarjeta">💳 Tarjeta</option><option value="otro">🔗 Otro</option></select></div>
                        </div>
                        <input type="date" value={abonoForm.fecha} onChange={e => setAbonoForm({ ...abonoForm, fecha: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl" />
                        <input type="text" value={abonoForm.nota} onChange={e => setAbonoForm({ ...abonoForm, nota: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl" placeholder="Nota: ej. anticipo 50%" />
                        <div className="flex gap-2"><button onClick={resetAbonoForm} className="flex-1 p-3 bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button><button onClick={guardarAbono} className="flex-1 p-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600">{editAbonoId ? 'Actualizar' : 'Guardar abono'}</button></div>
                    </div>
                )}
                {(datos.abonos || []).length === 0 ? <p className="text-sm text-gray-400 text-center py-3">Sin abonos aún</p> : (
                    <div className="space-y-2 mb-4">
                        {(datos.abonos || []).map(a => {
                            const metodoLabel = { transferencia: '🏦 Transfer', efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', otro: '🔗 Otro' }[a.metodo] || a.metodo;
                            const fechaFmt = a.fecha ? new Date(a.fecha + 'T12:00:00').toLocaleDateString('es-CL') : '';
                            return (
                                <div key={a.id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                                    <div><span className="text-lg font-bold text-green-700">${parseFloat(a.monto).toLocaleString('es-CL')}</span><span className="ml-2 text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">{metodoLabel}</span>{a.nota && <span className="ml-1 text-xs text-gray-400 italic"> — {a.nota}</span>}<p className="text-xs text-gray-400">{fechaFmt}</p></div>
                                    <div className="flex items-center gap-1"><button onClick={() => editarAbono(a)} className="text-teal-400 hover:text-teal-600 p-1.5 rounded-lg hover:bg-teal-50"><PencilIcon /></button><button onClick={() => setDatos({ ...datos, abonos: datos.abonos.filter(x => x.id !== a.id) })} className="text-red-400 hover:text-red-600 p-1 text-lg font-bold">✕</button></div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="border-t-2 border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Total:</span><span className="font-bold">${(parseFloat(datos.precioTotal) || 0).toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Pagado:</span><span className="font-bold text-green-600">${totalPagado.toLocaleString('es-CL')}</span></div>
                    {saldo > 0 ? <div className="flex justify-between bg-yellow-50 border border-yellow-200 p-3 rounded-xl"><span className="font-bold text-yellow-700">Saldo pendiente:</span><span className="font-bold text-yellow-700">${saldo.toLocaleString('es-CL')}</span></div> : parseFloat(datos.precioTotal) > 0 && <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-center font-bold text-green-700">✅ ¡Pagado completo!</div>}
                    {parseFloat(datos.precioTotal) > 0 && (<><div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (totalPagado / (parseFloat(datos.precioTotal) || 1)) * 100)}%` }} /></div><p className="text-xs text-center text-gray-400">{Math.round((totalPagado / (parseFloat(datos.precioTotal) || 1)) * 100)}% pagado</p></>)}
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setPaso(2)} className="px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50">← Atrás</button>
                <button onClick={guardar} disabled={saving} className="flex-1 p-4 min-h-[48px] bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-md disabled:opacity-60 disabled:cursor-not-allowed">{saving ? 'Guardando…' : (editId ? '💾 Guardar cambios' : '✅ Crear reserva')}</button>
            </div>
            {editId && <button onClick={eliminar} disabled={saving || deleting} className="w-full p-4 min-h-[48px] bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed">🗑️ {deleting ? 'Eliminando…' : 'Eliminar esta reserva'}</button>}
            </div>
        </>
    );
};

ReactDOM.render(<ErrorBoundary><App/></ErrorBoundary>, document.getElementById('root'));
