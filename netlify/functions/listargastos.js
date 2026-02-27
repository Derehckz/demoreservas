const { neon } = require('@netlify/neon');
const { isAuthorized } = require('./_auth');
const { toDateStr, jsonResponse } = require('./_utils');

exports.handler = async (event) => {
  let sql;
  try {
    if (!(await isAuthorized(event))) {
      return jsonResponse(401, { error: 'No autorizado' });
    }
    if (event.httpMethod !== 'GET') {
      return jsonResponse(405, { error: 'Método no permitido' });
    }
    sql = neon();
  } catch (authErr) {
    console.error('listargastos auth/neon:', authErr);
    return jsonResponse(500, { error: 'Error de configuración. Intenta de nuevo.' });
  }

  const q = event.queryStringParameters || {};
  const periodo = q.periodo || q.mes;
  const cabana = q.cabana || q.cabana_filter;
  const tipo = q.tipo;

  try {
    let result;
    if (periodo && cabana && tipo) {
      result = await sql`SELECT * FROM gastos WHERE periodo = ${periodo} AND cabana = ${cabana} AND tipo = ${tipo} ORDER BY periodo DESC, created_at DESC`;
    } else if (periodo && cabana) {
      result = await sql`SELECT * FROM gastos WHERE periodo = ${periodo} AND cabana = ${cabana} ORDER BY periodo DESC, created_at DESC`;
    } else if (periodo && tipo) {
      result = await sql`SELECT * FROM gastos WHERE periodo = ${periodo} AND tipo = ${tipo} ORDER BY periodo DESC, created_at DESC`;
    } else if (cabana && tipo) {
      result = await sql`SELECT * FROM gastos WHERE cabana = ${cabana} AND tipo = ${tipo} ORDER BY periodo DESC, created_at DESC`;
    } else if (periodo) {
      result = await sql`SELECT * FROM gastos WHERE periodo = ${periodo} ORDER BY periodo DESC, created_at DESC`;
    } else if (cabana) {
      result = await sql`SELECT * FROM gastos WHERE cabana = ${cabana} ORDER BY periodo DESC, created_at DESC`;
    } else if (tipo) {
      result = await sql`SELECT * FROM gastos WHERE tipo = ${tipo} ORDER BY periodo DESC, created_at DESC`;
    } else {
      result = await sql`SELECT * FROM gastos ORDER BY periodo DESC, created_at DESC`;
    }

    const list = Array.isArray(result) ? result : [];
    const gastos = list.map(g => ({
      id: g.id,
      cabana: g.cabana,
      tipo: g.tipo,
      monto: Number(g.monto),
      periodo: g.periodo,
      fechaPago: toDateStr(g.fecha_pago),
      nota: g.nota || '',
      createdAt: g.created_at ? new Date(g.created_at).toISOString() : null,
      updatedAt: g.updated_at ? new Date(g.updated_at).toISOString() : null,
    }));

    return jsonResponse(200, gastos);
  } catch (error) {
    console.error('Error al listar gastos:', error);
    return jsonResponse(500, { error: 'Error al cargar los gastos. Intenta de nuevo.' });
  }
};
