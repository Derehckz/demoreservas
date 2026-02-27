const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

/**
 * POST /.netlify/functions/cambiarpassword
 * Body: { currentPassword, newPassword }
 * Verifica la contraseña actual. Si es correcta, devuelve instrucciones para actualizar
 * LOGIN_PASSWORD en Netlify (no se puede cambiar la variable de entorno desde la app).
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Cuerpo inválido' });
  }
  const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newP = typeof body.newPassword === 'string' ? body.newPassword : '';
  const correct = process.env.LOGIN_PASSWORD;
  if (!correct) {
    return jsonResponse(500, { error: 'Servidor no configurado' });
  }
  if (current !== correct) {
    return jsonResponse(401, { ok: false, error: 'Contraseña actual incorrecta' });
  }
  if (!newP || newP.length < 6) {
    return jsonResponse(400, { ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }
  return jsonResponse(200, {
    ok: true,
    message: 'Contraseña actual correcta. Para activar la nueva contraseña: ve a Netlify → tu sitio → Site configuration → Environment variables, actualiza LOGIN_PASSWORD con tu nueva contraseña y vuelve a desplegar (o espera al próximo deploy).'
  });
};
