/**
 * Utilidades compartidas entre funciones Netlify.
 * - toDateStr: normaliza fecha a YYYY-MM-DD; devuelve '' si no válida.
 * - toDateStrOrNull: igual pero devuelve null para uso en BD opcional.
 * - safeParseJson: parsea JSONB; devuelve fallback si falla.
 * - jsonResponse: respuesta HTTP JSON estándar.
 */

function toDateStr(d) {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d).substring(0, 10);
}

/** Para campos de fecha opcionales en BD (ej. fecha_pago). Devuelve null si vacío o no válido. */
function toDateStrOrNull(d) {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString().split('T')[0];
  const s = String(d).substring(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function safeParseJson(val, fallback = []) {
  if (val == null) return fallback;
  if (Array.isArray(val)) return val;
  if (typeof val !== 'string' || val.length === 0) return fallback;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

module.exports = { toDateStr, toDateStrOrNull, safeParseJson, jsonResponse };
