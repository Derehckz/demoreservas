const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { toDateStr, safeParseJson, jsonResponse } = require('./_utils');

exports.handler = async (event) => {
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }
  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) {
    return jsonResponse(400, { error: 'Falta el parámetro id' });
  }
  const sql = neon();
  try {
    const result = await sql`SELECT * FROM reservas WHERE id = ${id}`;
    if (!result[0]) {
      return jsonResponse(404, { error: 'Reserva no encontrada' });
    }
    const r = result[0];
    const reserva = {
      ...r,
      diasTinaja: safeParseJson(r.dias_tinaja),
      abonos: safeParseJson(r.abonos),
      tinajaAdicional: safeParseJson(r.tinaja_adicional),
      fechaInicio: toDateStr(r.fecha_inicio),
      fechaFin: toDateStr(r.fecha_fin),
      precioTotal: r.precio_total || '',
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
    };
    return jsonResponse(200, reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    return jsonResponse(500, { error: 'Error al cargar la reserva. Intenta de nuevo.' });
  }
}
