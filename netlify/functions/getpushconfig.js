const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

exports.handler = async (event) => {
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  return jsonResponse(200, {
    vapidPublicKey: vapidPublic || null,
    pushAvailable: !!vapidPublic,
  });
};
