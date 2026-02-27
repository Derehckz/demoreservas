const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

exports.handler = async (event) => {
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'JSON inválido' });
  }

  const { endpoint, keys } = data;
  const p256dh = keys?.p256dh || keys?.p256DH;
  const auth = keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return jsonResponse(400, { error: 'Faltan endpoint, keys.p256dh o keys.auth' });
  }

  try {
    const sql = neon();
    await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth)
      VALUES (${endpoint}, ${p256dh}, ${auth})
      ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
    `;
    return jsonResponse(200, { ok: true, message: 'Suscripción guardada' });
  } catch (err) {
    if (err.code === '42P01') {
      return jsonResponse(500, { error: 'Ejecuta la migración SQL migracion_push_subscriptions.sql en Neon' });
    }
    console.error('subscribir:', err);
    return jsonResponse(500, { error: 'Error al guardar la suscripción' });
  }
};
