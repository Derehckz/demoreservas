const { neon } = require('@netlify/neon');
const webpush = require('web-push');
const { isAuthorized } = require('./_auth');
const { toDateStr, safeParseJson, jsonResponse } = require('./_utils');

const DIAS_SALDO = 7;
const DIAS_SALDO_EXT = 14;
const DIAS_SIN_TELEFONO = 7;

function fechasTinaja(r) {
  const dias = safeParseJson(r.dias_tinaja, []);
  const tinajaAdic = safeParseJson(r.tinaja_adicional, []);
  const fechasAdic = tinajaAdic.map((t) => (t && t.fecha) || '').filter(Boolean);
  return [...dias, ...fechasAdic];
}

/** Calcula alertas simplificadas (server-side), alineado con dashboard. */
function calcularAlertasServer(reservas, hoyStr, mananaStr, t7Str, t14Str, tSinTelStr) {
  const llH = reservas.filter(
    (r) => r.fechaInicio === hoyStr && r.estado && !['cancelada'].includes(r.estado)
  );
  const llHPend = llH.filter((r) => r.estado === 'pendiente');
  const saH = reservas.filter(
    (r) => r.fechaFin === hoyStr && r.estado === 'checkin'
  );
  const llM = reservas.filter(
    (r) => r.fechaInicio === mananaStr && r.estado && !['cancelada'].includes(r.estado)
  );
  const totalPagado = (r) =>
    (r.abonos || []).reduce((s, a) => s + (parseFloat(a.monto) || 0), 0);
  const llIds = new Set([...llH, ...llM].map((r) => r.id));
  const cS = reservas.filter((r) => {
    const total = parseFloat(r.precio_total) || 0;
    const pagado = totalPagado(r);
    return (
      total - pagado > 0 &&
      r.fechaInicio >= hoyStr &&
      r.fechaInicio <= t7Str &&
      r.estado !== 'cancelada' &&
      !llIds.has(r.id)
    );
  });
  const cS14 = reservas.filter((r) => {
    const total = parseFloat(r.precio_total) || 0;
    const pagado = totalPagado(r);
    return (
      total - pagado > 0 &&
      r.fechaInicio > t7Str &&
      r.fechaInicio <= t14Str &&
      r.estado !== 'cancelada'
    );
  });
  const llMSaldo = llM.filter((r) => (parseFloat(r.precio_total) || 0) - totalPagado(r) > 0);
  const sC = reservas.filter(
    (r) =>
      r.estado === 'pendiente' &&
      r.fechaInicio >= hoyStr &&
      r.fechaInicio <= t7Str &&
      !llIds.has(r.id)
  );
  const sinTelefono = reservas.filter(
    (r) =>
      r.estado !== 'cancelada' &&
      r.fechaInicio >= hoyStr &&
      r.fechaInicio <= tSinTelStr &&
      !(r.telefono && String(r.telefono).replace(/\D/g, '').length >= 8)
  );
  const tinajaHoy = reservas.filter((r) => {
    const fechas = fechasTinaja(r);
    return (
      fechas.some((f) => f === hoyStr) &&
      r.estado !== 'cancelada' &&
      r.fechaInicio <= hoyStr &&
      r.fechaFin >= hoyStr
    );
  });
  const tinajaMana = reservas.filter((r) => {
    const fechas = fechasTinaja(r);
    return (
      fechas.some((f) => f === mananaStr) &&
      r.estado !== 'cancelada' &&
      r.fechaInicio <= mananaStr &&
      r.fechaFin >= mananaStr
    );
  });
  return { llH, saH, llM, cS, sC, llHPend, llMSaldo, cS14, sinTelefono, tinajaHoy, tinajaMana };
}

exports.handler = async (event) => {
  const cronSecret = process.env.CRON_SECRET;
  const hasCronSecret = cronSecret && event.headers?.['x-cron-secret'] === cronSecret;
  let body = {};
  try {
    if (event.body) body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {}
  const isScheduled = !!body.next_run;
  const isCron = hasCronSecret || isScheduled;
  if (!isCron && !(await isAuthorized(event))) {
    return jsonResponse(401, { error: 'No autorizado' });
  }
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return jsonResponse(500, { error: 'Configura VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en Netlify' });
  }

  webpush.setVapidDetails('mailto:admin@cabanas-eli.cl', vapidPublic, vapidPrivate);

  try {
    const sql = neon();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];
    const manana = new Date(hoy.getTime() + 86400000);
    const mananaStr = manana.toISOString().split('T')[0];
    const t7 = new Date(hoy.getTime() + 7 * 86400000);
    const t7Str = t7.toISOString().split('T')[0];

    const t14 = new Date(hoy.getTime() + DIAS_SALDO_EXT * 86400000);
    const t14Str = t14.toISOString().split('T')[0];
    const tSinTel = new Date(hoy.getTime() + DIAS_SIN_TELEFONO * 86400000);
    const tSinTelStr = tSinTel.toISOString().split('T')[0];

    const raw = await sql`SELECT * FROM reservas ORDER BY fecha_inicio ASC`;
    const reservas = (raw || []).map((r) => ({
      ...r,
      fechaInicio: toDateStr(r.fecha_inicio),
      fechaFin: toDateStr(r.fecha_fin),
      abonos: safeParseJson(r.abonos),
    }));

    const { llH, saH, llM, cS, sC, llHPend, llMSaldo, cS14, sinTelefono, tinajaHoy, tinajaMana } =
      calcularAlertasServer(reservas, hoyStr, mananaStr, t7Str, t14Str, tSinTelStr);

    const allIds = new Set();
    [...llH, ...saH, ...llM, ...cS, ...sC, ...cS14, ...sinTelefono, ...tinajaHoy, ...tinajaMana].forEach((r) => allIds.add(r.id));
    const total = allIds.size;

    const nombrar = (arr, max = 2) =>
      arr.slice(0, max).map((r) => (r.cliente || '').split(' ')[0] || '?').join(', ') + (arr.length > max ? '…' : '');

    const hoyFecha = new Date();
    const diaSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][hoyFecha.getDay()];
    const diaMes = hoyFecha.getDate();
    const mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][hoyFecha.getMonth()];
    const fechaCorta = `${diaSemana} ${diaMes} ${mes}`;

    let title = 'Cabañas Eli';
    let message = 'Todo tranquilo hoy.';
    let url = '/';
    let requireInteraction = false;

    if (total > 0) {
      const parts = [];
      if (llHPend.length) {
        parts.push(`🚨 ${llHPend.length} llegan HOY sin confirmar: ${nombrar(llHPend)}`);
        requireInteraction = true;
      } else if (llH.length) {
        parts.push(`${llH.length} llegan hoy: ${nombrar(llH)}`);
      }
      if (saH.length) parts.push(`${saH.length} salen hoy`);
      if (llM.length) parts.push(`${llM.length} mañana${llMSaldo.length ? ` (${llMSaldo.length} con saldo)` : ''}`);
      if (cS.length) parts.push(`${cS.length} con saldo pendiente (próximos 7d)`);
      if (cS14.length) parts.push(`${cS14.length} saldo 8-14d`);
      if (sC.length) parts.push(`${sC.length} pendientes de confirmar`);
      if (sinTelefono.length) parts.push(`${sinTelefono.length} sin teléfono`);
      if (tinajaHoy.length || tinajaMana.length)
        parts.push(`🛁 ${tinajaHoy.length + tinajaMana.length} tinaja hoy/mañana`);

      if (llHPend.length) {
        title = `⚠️ ${llHPend.length} sin confirmar — ${fechaCorta}`;
      } else {
        title = total === 1 ? `1 alerta · ${fechaCorta}` : `${total} alertas · ${fechaCorta}`;
      }
      message = parts.join('\n');
      url = '/#alertas';
    } else {
      title = `Cabañas Eli · ${fechaCorta}`;
    }

    // Solo enviar si hay alertas; si está todo tranquilo, no molestar
    if (total === 0) {
      return jsonResponse(200, {
        ok: true,
        total: 0,
        sent: 0,
        skipped: true,
        message: 'Sin alertas, no se envió notificación',
      });
    }

    const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions`;
    const payload = JSON.stringify({
      title,
      body: message,
      url,
      tag: 'alerta-diaria',
      requireInteraction,
    });

    let sent = 0;
    const failed = [];
    for (const s of subs || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          payload,
          { TTL: 86400 }
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          failed.push(s.endpoint);
        }
        console.warn('Push falló:', err.message);
      }
    }

    if (failed.length > 0) {
      for (const ep of failed) {
        await sql`DELETE FROM push_subscriptions WHERE endpoint = ${ep}`.catch(() => {});
      }
    }

    return jsonResponse(200, {
      ok: true,
      total,
      sent,
      failed: failed.length,
      message,
    });
  } catch (err) {
    console.error('enviaralertas:', err);
    return jsonResponse(500, { error: err.message || 'Error al enviar alertas' });
  }
};
