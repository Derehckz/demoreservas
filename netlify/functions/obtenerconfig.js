const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

// Config por defecto si la BD no tiene la tabla o no está migrada
const DEFAULT_CABANAS = {
  principal: { nombre: 'Cabaña Principal', maxPersonas: 6, precioExtraPorPersona: 10000, precioUnaNoche: 80000, precioVariasNoches: 70000, precioTinaja: 25000, activa: true, orden: 1 },
  grande: { nombre: 'Cabaña Grande', maxPersonas: 10, precioExtraPorPersona: 10000, precioUnaNoche: 120000, precioVariasNoches: 100000, precioTinaja: 30000, activa: true, orden: 2 }
};

function rowToCabana(r) {
  if (!r) return null;
  return {
    nombre: r.nombre,
    maxPersonas: parseInt(r.max_personas, 10) || 0,
    precioExtraPorPersona: parseFloat(r.precio_extra_por_persona) || 0,
    precioUnaNoche: parseFloat(r.precio_una_noche) || 0,
    precioVariasNoches: parseFloat(r.precio_varias_noches) || 0,
    precioTinaja: parseFloat(r.precio_tinaja) || 0,
    activa: r.activa !== false,
    orden: parseInt(r.orden, 10) || 0
  };
}

exports.handler = async (event) => {
  try {
    if (!(await isAuthorized(event))) {
      return jsonResponse(401, { error: 'No autorizado' });
    }
    if (event.httpMethod !== 'GET') {
      return jsonResponse(405, { error: 'Método no permitido' });
    }
    const sql = neon();
    const rows = await sql`SELECT * FROM config_cabanas ORDER BY orden ASC, id ASC`;
    const cabanas = {};
    for (const r of rows) {
      cabanas[r.id] = rowToCabana(r);
    }
    if (Object.keys(cabanas).length === 0) {
      console.warn('config_cabanas vacío; usando valores por defecto. Ejecuta migracion_config_cabanas.sql en Neon.');
      return jsonResponse(200, { ...DEFAULT_CABANAS, _fallback: true, _message: 'Config vacía en BD; se muestran valores por defecto.' });
    }
    return jsonResponse(200, cabanas);
  } catch (err) {
    console.error('Error al obtener config:', err);
    return jsonResponse(200, {
      ...DEFAULT_CABANAS,
      _fallback: true,
      _error: 'Error al leer la configuración desde la base de datos. Se muestran valores por defecto.',
    });
  }
};
