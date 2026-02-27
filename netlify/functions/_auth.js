/**
 * Módulo compartido de autenticación.
 * Genera y verifica tokens firmados con HMAC-SHA256.
 * El token nunca contiene ni expone la contraseña.
 * Soporta "cerrar sesión en todos" vía tabla admin_settings.
 */
const crypto = require('crypto');
const { neon } = require('@netlify/neon');

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

function generateToken(secret) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${nonce}.${timestamp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [nonce, timestamp, sig] = parts;
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) return false;
    if (Date.now() - ts > TOKEN_TTL) return false;
    const payload = `${nonce}.${timestamp}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (sig.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch {
    return false;
  }
}

/** Devuelve el timestamp de emisión del token (número) o null. */
function getTokenTimestamp(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const ts = parseInt(parts[1], 10);
    return isNaN(ts) ? null : ts;
  } catch {
    return null;
  }
}

async function isAuthorized(event) {
  const secret = process.env.LOGIN_PASSWORD;
  if (!secret) return false;
  const auth = event.headers['authorization'] || event.headers['Authorization'] || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  if (!verifyToken(token, secret)) return false;
  const tokenTs = getTokenTimestamp(token);
  if (tokenTs == null) return false;
  try {
    const sql = neon();
    const row = await sql`SELECT value FROM admin_settings WHERE key = 'logout_all_before' LIMIT 1`;
    const before = row[0] ? parseInt(row[0].value, 10) : 0;
    if (isNaN(before)) return true;
    return tokenTs > before;
  } catch {
    return true;
  }
}

module.exports = { generateToken, verifyToken, getTokenTimestamp, isAuthorized };
