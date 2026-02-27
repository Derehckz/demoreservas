const { generateToken } = require('./_auth');
const { jsonResponse } = require('./_utils');

// Rate limiting en memoria: 5 intentos por IP cada 15 minutos
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  if (checkRateLimit(ip)) {
    return jsonResponse(429, { error: 'Demasiados intentos. Espera 15 minutos.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
    const correctPassword = process.env.LOGIN_PASSWORD;

    if (!correctPassword) {
      return jsonResponse(500, { error: 'Falta LOGIN_PASSWORD en variables de entorno. En local: .env. En Netlify: Site → Environment variables.' });
    }

    if (password === correctPassword) {
      loginAttempts.delete(ip);
      return jsonResponse(200, { ok: true, token: generateToken(correctPassword) });
    }

    return jsonResponse(401, { ok: false, error: 'Contraseña incorrecta' });
  } catch (err) {
    return jsonResponse(400, { error: 'Solicitud inválida' });
  }
};
