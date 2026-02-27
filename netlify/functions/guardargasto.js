const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { toDateStrOrNull, jsonResponse } = require('./_utils');

const TIPOS_VALIDOS = ['luz', 'internet', 'gas', 'aseo', 'mantenimiento', 'otro'];

exports.handler = async (event) => {
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, { error: 'JSON inválido' });
  }

  if (!data.id || typeof data.id !== 'string' || !data.id.trim()) {
    return jsonResponse(400, { error: 'Falta id del gasto' });
  }

  const sql = neon();
  let cabanasValidas = ['principal', 'grande', 'compartido'];
  try {
    const rows = await sql`SELECT id FROM config_cabanas ORDER BY orden, id`;
    const ids = rows.map(r => r.id);
    if (ids.length > 0) {
      cabanasValidas = [...ids, 'compartido'];
    }
  } catch {
    // usar default
  }

  if (!cabanasValidas.includes(data.cabana)) {
    return jsonResponse(400, { error: `Cabaña no válida. Valores: ${cabanasValidas.join(', ')}` });
  }

  if (!TIPOS_VALIDOS.includes(data.tipo)) {
    return jsonResponse(400, { error: 'Tipo no válido. Valores: luz, internet, gas, aseo, mantenimiento, otro' });
  }

  const monto = parseFloat(data.monto);
  if (isNaN(monto) || monto < 0) {
    return jsonResponse(400, { error: 'Monto debe ser un número mayor o igual a 0' });
  }

  if (!data.periodo || !/^\d{4}-\d{2}$/.test(String(data.periodo).trim())) {
    return jsonResponse(400, { error: 'Periodo debe ser YYYY-MM (ej. 2026-02)' });
  }

  const periodo = String(data.periodo).trim();
  const nota = data.nota != null ? String(data.nota) : '';
  const fechaPago = toDateStrOrNull(data.fechaPago || data.fecha_pago);

  try {
    await sql`
      INSERT INTO gastos (id, cabana, tipo, monto, periodo, fecha_pago, nota, created_at, updated_at)
      VALUES (${data.id.trim()}, ${data.cabana}, ${data.tipo}, ${monto}, ${periodo}, ${fechaPago}, ${nota}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        cabana = EXCLUDED.cabana,
        tipo = EXCLUDED.tipo,
        monto = EXCLUDED.monto,
        periodo = EXCLUDED.periodo,
        fecha_pago = EXCLUDED.fecha_pago,
        nota = EXCLUDED.nota,
        updated_at = NOW();
    `;
    return jsonResponse(200, { message: 'Gasto guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    return jsonResponse(500, { error: 'Error al guardar el gasto. Intenta de nuevo.' });
  }
};
