const { calcularEstadoReserva } = require('../../js/lib/estadoReserva');

describe('calcularEstadoReserva', () => {
  const base = { fechaInicio: '2026-03-01', fechaFin: '2026-03-05', precioTotal: 100000 };

  it('devuelve cancelada si la reserva ya está cancelada', () => {
    expect(calcularEstadoReserva({ ...base, estado: 'cancelada' }, 100000)).toBe('cancelada');
    expect(calcularEstadoReserva({ ...base, estado: 'cancelada' }, 0)).toBe('cancelada');
  });

  it('devuelve pendiente si totalPagado es 0', () => {
    expect(calcularEstadoReserva(base, 0)).toBe('pendiente');
  });

  it('devuelve confirmada si pago >= 50% y < 100%', () => {
    expect(calcularEstadoReserva(base, 50000)).toBe('confirmada');
    expect(calcularEstadoReserva(base, 99999)).toBe('confirmada');
  });

  it('devuelve confirmada si pago 100% y hoy antes de entrada', () => {
    const r = { ...base, fechaInicio: '2026-12-01', fechaFin: '2026-12-05' };
    expect(calcularEstadoReserva(r, 100000)).toBe('confirmada');
  });

  it('devuelve checkin si pago 100% y hoy entre entrada y salida', () => {
    const hoy = new Date();
    const ini = new Date(hoy);
    ini.setDate(ini.getDate() - 1);
    const fin = new Date(hoy);
    fin.setDate(fin.getDate() + 2);
    const r = {
      fechaInicio: ini.toISOString().slice(0, 10),
      fechaFin: fin.toISOString().slice(0, 10),
      precioTotal: 100000,
    };
    expect(calcularEstadoReserva(r, 100000)).toBe('checkin');
  });

  it('devuelve completada si pago 100% y hoy después de salida', () => {
    const hoy = new Date();
    const fin = new Date(hoy);
    fin.setDate(fin.getDate() - 2);
    const ini = new Date(fin);
    ini.setDate(ini.getDate() - 3);
    const r = {
      fechaInicio: ini.toISOString().slice(0, 10),
      fechaFin: fin.toISOString().slice(0, 10),
      precioTotal: 100000,
    };
    expect(calcularEstadoReserva(r, 100000)).toBe('completada');
  });

  it('devuelve completada si hoy es fechaFin y ya pasó hora check-out (14:00)', () => {
    const r = {
      fechaInicio: '2026-02-23',
      fechaFin: '2026-02-24',
      precioTotal: 100000,
    };
    const nowAfterCheckout = new Date('2026-02-24T14:30:00');
    expect(calcularEstadoReserva(r, 100000, nowAfterCheckout)).toBe('completada');
  });

  it('devuelve checkin si hoy es fechaFin pero aún no pasa hora check-out (14:00)', () => {
    const r = {
      fechaInicio: '2026-02-23',
      fechaFin: '2026-02-24',
      precioTotal: 100000,
    };
    const nowBeforeCheckout = new Date('2026-02-24T12:00:00');
    expect(calcularEstadoReserva(r, 100000, nowBeforeCheckout)).toBe('checkin');
  });

  it('maneja reserva sin estado', () => {
    expect(calcularEstadoReserva({ ...base }, 0)).toBe('pendiente');
  });

  it('maneja precioTotal 0', () => {
    expect(calcularEstadoReserva({ ...base, precioTotal: 0 }, 0)).toBe('pendiente');
  });
});
