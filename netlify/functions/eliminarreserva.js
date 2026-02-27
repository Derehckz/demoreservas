const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

exports.handler = async (event) => {
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'DELETE') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }
  try {
    const { id } = event.queryStringParameters || {};
    if (!id) {
      return jsonResponse(400, { error: 'Falta el parámetro id' });
    }
    const sql = neon();
    const result = await sql`DELETE FROM reservas WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
      return jsonResponse(404, { error: 'Reserva no encontrada' });
    }
    return jsonResponse(200, { ok: true, deleted: result[0] });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    return jsonResponse(500, { error: 'Error al eliminar la reserva. Intenta de nuevo.' });
  }
};
