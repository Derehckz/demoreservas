const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { toDateStr, jsonResponse } = require('./_utils');

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

  if (!data.id || !data.cliente || !data.cabana || !data.fechaInicio || !data.fechaFin) {
    return jsonResponse(400, { error: 'Faltan campos requeridos: id, cliente, cabana, fechaInicio, fechaFin' });
  }

  if (data.fechaFin <= data.fechaInicio) {
    return jsonResponse(400, { error: 'La fecha de salida debe ser posterior a la de entrada' });
  }

  const sql = neon();

  // Obtener cabañas activas desde config (para reservas solo aceptamos activas)
  let cabanasActivasIds = [];
  let cabanasNombres = {};
  try {
    const rows = await sql`SELECT id, nombre FROM config_cabanas WHERE COALESCE(activa, true) = true ORDER BY orden, id`;
    cabanasActivasIds = rows.map(r => r.id);
    rows.forEach(r => { cabanasNombres[r.id] = r.nombre; });
  } catch {
    cabanasActivasIds = ['principal', 'grande'];
    cabanasNombres = { principal: 'Principal', grande: 'Grande' };
  }
  if (cabanasActivasIds.length === 0) {
    cabanasActivasIds = ['principal', 'grande'];
    cabanasNombres = { principal: 'Principal', grande: 'Grande' };
  }

  if (!cabanasActivasIds.includes(data.cabana)) {
    return jsonResponse(400, {
      error: `Cabaña no válida. Valores aceptados: ${cabanasActivasIds.join(', ')}`
    });
  }

  const personas = parseInt(data.personas);
  if (isNaN(personas) || personas < 1) {
    return jsonResponse(400, { error: 'El número de personas debe ser al menos 1' });
  }

  const ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'checkin', 'completada', 'cancelada'];
  if (data.estado && !ESTADOS_VALIDOS.includes(data.estado)) {
    return jsonResponse(400, { error: `Estado no válido. Valores aceptados: ${ESTADOS_VALIDOS.join(', ')}` });
  }

  if (data.precioTotal !== undefined && data.precioTotal !== null && data.precioTotal !== '') {
    const precio = parseFloat(data.precioTotal);
    if (isNaN(precio) || precio < 0) {
      return jsonResponse(400, { error: 'El precio total no puede ser negativo' });
    }
  }

  const descuento = data.descuento !== undefined && data.descuento !== null ? parseFloat(data.descuento) : 0;
  const descuentoVal = isNaN(descuento) || descuento < 0 ? 0 : descuento;

  const METODOS_VALIDOS = ['efectivo', 'transferencia', 'tarjeta', 'otro'];
  if (data.abonos !== undefined && data.abonos !== null) {
    if (!Array.isArray(data.abonos)) {
      return jsonResponse(400, { error: 'abonos debe ser un array' });
    }
    for (let i = 0; i < data.abonos.length; i++) {
      const a = data.abonos[i];
      const monto = parseFloat(a.monto);
      if (isNaN(monto) || monto <= 0) {
        return jsonResponse(400, { error: `Abono ${i+1}: el monto debe ser un número mayor a 0` });
      }
      if (a.metodo && !METODOS_VALIDOS.includes(a.metodo)) {
        return jsonResponse(400, { error: `Abono ${i+1}: método no válido. Valores: ${METODOS_VALIDOS.join(', ')}` });
      }
      if (!a.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(a.fecha)) {
        return jsonResponse(400, { error: `Abono ${i+1}: fecha inválida, debe ser YYYY-MM-DD` });
      }
    }
  }

  try {
    const conflictos = await sql`
      SELECT id, cliente FROM reservas
      WHERE cabana = ${data.cabana}
        AND estado != 'cancelada'
        AND id != ${data.id}
        AND fecha_inicio < ${data.fechaFin}
        AND fecha_fin > ${data.fechaInicio}
    `;
    if (conflictos.length > 0) {
      const c = conflictos[0];
      const nombreCabana = cabanasNombres[data.cabana] || data.cabana;
      const fi = toDateStr(c.fecha_inicio);
      const ff = toDateStr(c.fecha_fin);
      return jsonResponse(409, { error: `La ${nombreCabana} ya tiene una reserva de ${c.cliente} entre el ${fi} y el ${ff}. Elige otras fechas.` });
    }

    await sql`
      INSERT INTO reservas (
        id, cliente, telefono, cabana, fecha_inicio, fecha_fin, personas,
        dias_tinaja, precio_total, abonos, tinaja_adicional, descuento, notas, origen, estado, pagado,
        created_at, updated_at
      ) VALUES (
        ${data.id}, ${data.cliente}, ${data.telefono}, ${data.cabana}, ${data.fechaInicio}, ${data.fechaFin}, ${data.personas},
        ${JSON.stringify(data.diasTinaja||[])}, ${data.precioTotal}, ${JSON.stringify(data.abonos||[])}, ${JSON.stringify(data.tinajaAdicional||[])},
        ${descuentoVal}, ${data.notas}, ${data.origen}, ${data.estado}, ${data.pagado},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cliente=EXCLUDED.cliente,
        telefono=EXCLUDED.telefono,
        cabana=EXCLUDED.cabana,
        fecha_inicio=EXCLUDED.fecha_inicio,
        fecha_fin=EXCLUDED.fecha_fin,
        personas=EXCLUDED.personas,
        dias_tinaja=EXCLUDED.dias_tinaja,
        precio_total=EXCLUDED.precio_total,
        abonos=EXCLUDED.abonos,
        tinaja_adicional=EXCLUDED.tinaja_adicional,
        descuento=EXCLUDED.descuento,
        notas=EXCLUDED.notas,
        origen=EXCLUDED.origen,
        estado=EXCLUDED.estado,
        pagado=EXCLUDED.pagado,
        updated_at=NOW();
    `;
    return jsonResponse(200, { message: 'Reserva guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar reserva:', error);
    return jsonResponse(500, { error: 'Error al guardar la reserva. Intenta de nuevo.' });
  }
};
