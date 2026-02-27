const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { toDateStr, safeParseJson, jsonResponse } = require('./_utils');

exports.handler = async (event) => {
  let sql;
  try {
    if (!(await isAuthorized(event))) {
      return jsonResponse(401, { error: 'No autorizado' });
    }
    if (event.httpMethod !== 'GET') {
      return jsonResponse(405, { error: 'Método no permitido' });
    }
    sql = neon();
  } catch (authErr) {
    console.error('listarreservas auth/neon:', authErr);
    return jsonResponse(500, { error: 'Error de configuración. Intenta de nuevo.' });
  }
  try {
    const result = await sql`SELECT * FROM reservas ORDER BY fecha_inicio DESC`;
    // Convertir campos JSONB a objetos JS
    const reservas = Array.isArray(result) ? result.map(r => ({
      ...r,
      diasTinaja: safeParseJson(r.dias_tinaja),
      abonos: safeParseJson(r.abonos),
      tinajaAdicional: safeParseJson(r.tinaja_adicional),
      fechaInicio: toDateStr(r.fecha_inicio),
      fechaFin: toDateStr(r.fecha_fin),
      precioTotal: r.precio_total,
      descuento: r.descuento != null ? Number(r.descuento) : 0,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      dias_tinaja: undefined,
      tinaja_adicional: undefined,
      fecha_inicio: undefined,
      fecha_fin: undefined,
      precio_total: undefined,
      created_at: undefined,
      updated_at: undefined
    })) : [];
    return jsonResponse(200, reservas);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    return jsonResponse(500, { error: 'Error al cargar las reservas. Intenta de nuevo.' });
  }
}
