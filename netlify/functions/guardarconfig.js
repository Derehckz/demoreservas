const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { jsonResponse } = require('./_utils');

/** Genera un id slug a partir del nombre: "Cabaña Nueva" -> "nueva" */
function slugFromNombre(nombre) {
  return (nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cabanas-' + Date.now().toString(36);
}

exports.handler = async (event) => {
  if (!(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'JSON inválido' });
  }

  const cabanasInput = body.cabanas;
  if (!cabanasInput || !Array.isArray(cabanasInput)) {
    return jsonResponse(400, { error: 'Se requiere cabanas como array' });
  }

  if (cabanasInput.length === 0) {
    return jsonResponse(400, { error: 'Debe haber al menos una cabaña' });
  }

  const sql = neon();
  try {
    for (let i = 0; i < cabanasInput.length; i++) {
      const c = cabanasInput[i];
      const nombre = (c.nombre || '').trim().substring(0, 100) || 'Cabaña';
      const id = (c.id || '').trim() || slugFromNombre(nombre);
      const idFinal = id.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '') || 'cab-' + i;
      const maxPersonas = Math.max(1, Math.min(99, parseInt(c.maxPersonas, 10) || 6));
      const precioExtraPorPersona = Math.max(0, parseFloat(c.precioExtraPorPersona) || 0);
      const precioUnaNoche = Math.max(0, parseFloat(c.precioUnaNoche) || 0);
      const precioVariasNoches = Math.max(0, parseFloat(c.precioVariasNoches) || 0);
      const precioTinaja = Math.max(0, parseFloat(c.precioTinaja) || 0);
      const activa = c.activa !== false;
      const orden = parseInt(c.orden, 10) || i;

      await sql`
        INSERT INTO config_cabanas (id, nombre, max_personas, precio_extra_por_persona, precio_una_noche, precio_varias_noches, precio_tinaja, activa, orden)
        VALUES (${idFinal}, ${nombre}, ${maxPersonas}, ${precioExtraPorPersona}, ${precioUnaNoche}, ${precioVariasNoches}, ${precioTinaja}, ${activa}, ${orden})
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          max_personas = EXCLUDED.max_personas,
          precio_extra_por_persona = EXCLUDED.precio_extra_por_persona,
          precio_una_noche = EXCLUDED.precio_una_noche,
          precio_varias_noches = EXCLUDED.precio_varias_noches,
          precio_tinaja = EXCLUDED.precio_tinaja,
          activa = EXCLUDED.activa,
          orden = EXCLUDED.orden
      `;
    }
    return jsonResponse(200, { ok: true });
  } catch (err) {
    console.error('Error al guardar config:', err);
    return jsonResponse(500, { error: 'Error al guardar la configuración. Intenta de nuevo.' });
  }
};
