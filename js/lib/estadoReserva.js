(function() {
/** Hora de check-out (14:00). Si ya pasó, la reserva se considera completada ese día. Local para no chocar con config.js */
var HORA_CHECKOUT = 14;

/**
 * Calcula el estado de la reserva según total pagado, fechas y hora de check-out.
 * Si hoy es fechaFin y ya pasó la hora de check-out (14:00), devuelve 'completada'.
 * @param {Object} reserva
 * @param {number} totalPagado
 * @param {Date} [now] - Opcional, para tests. Si no se pasa, usa new Date().
 */
function calcularEstadoReserva(reserva, totalPagado, now) {
  const estado = (reserva && reserva.estado) || 'pendiente';
  if (estado === 'cancelada') return 'cancelada';
  const total = parseFloat(reserva && reserva.precioTotal) || 0;
  const pct = total > 0 ? (totalPagado / total) * 100 : 0;
  if (totalPagado === 0) return 'pendiente';
  if (pct >= 100) {
    const hoy = now ? new Date(now) : new Date();
    const hoySolo = new Date(hoy);
    hoySolo.setHours(0, 0, 0, 0);
    const fin = new Date((reserva.fechaFin || '') + 'T12:00:00');
    fin.setHours(0, 0, 0, 0);
    const ini = new Date((reserva.fechaInicio || '') + 'T12:00:00');
    ini.setHours(0, 0, 0, 0);
    if (isNaN(fin.getTime())) return 'confirmada';
    if (hoySolo.getTime() > fin.getTime()) return 'completada';
    if (hoySolo.getTime() === fin.getTime()) {
      const yaCheckout = hoy.getHours() > HORA_CHECKOUT || (hoy.getHours() === HORA_CHECKOUT && hoy.getMinutes() >= 0);
      if (yaCheckout) return 'completada';
    }
    if (hoySolo.getTime() >= ini.getTime()) return 'checkin';
    return 'confirmada';
  }
  if (pct >= 50) return 'confirmada';
  return 'pendiente';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcularEstadoReserva };
} else if (typeof window !== 'undefined') {
  window.calcularEstadoReserva = calcularEstadoReserva;
}
})();
