const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

/**
 * POST /.netlify/functions/logoutall
 * Invalida todos los tokens emitidos hasta ahora (cerrar sesión en todos los dispositivos).
 * Requiere Bearer token válido.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  try {
    const sql = neon();
    const now = Date.now().toString();
    await sql`
      INSERT INTO admin_settings (key, value) VALUES ('logout_all_before', ${now})
      ON CONFLICT (key) DO UPDATE SET value = ${now}
    `;
    return jsonResponse(200, { ok: true, message: 'Sesiones cerradas en todos los dispositivos.' });
  } catch (err) {
    console.error('Error en logoutall:', err);
    return jsonResponse(500, { error: 'Error al cerrar sesiones. Intenta de nuevo.' });
  }
};
