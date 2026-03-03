-- Datos ficticios para ambiente DEMO
-- Ejecutar este archivo solo en la base de datos de demo en Neon.

-- Limpia tablas principales (opcional; haz backup si las usas para otra cosa)
TRUNCATE TABLE reservas RESTART IDENTITY;
TRUNCATE TABLE gastos RESTART IDENTITY;

-- Configuración de cabañas de ejemplo (si quieres sobreescribir)
DELETE FROM config_cabanas;
INSERT INTO config_cabanas (id, nombre, max_personas, precio_extra_por_persona, precio_una_noche, precio_varias_noches, precio_tinaja)
VALUES
  ('principal', 'Cabaña Lago Demo', 6, 10000, 80000, 70000, 25000),
  ('grande', 'Cabaña Bosque Demo', 10, 10000, 120000, 100000, 30000);

-- Reservas ficticias
INSERT INTO reservas (
  id, cliente, telefono, cabana, fecha_inicio, fecha_fin, personas,
  dias_tinaja, precio_total, abonos, tinaja_adicional, notas, origen, estado, pagado
) VALUES
  (1001, 'Juan Demo',       '+56911111111', 'principal', DATE_TRUNC('day', NOW())::date + INTERVAL '1 day', DATE_TRUNC('day', NOW())::date + INTERVAL '3 days', 4,
   '["2026-03-05"]', 260000, '[{"monto":100000,"fecha":"2026-03-01","medio":"transferencia"}]', '[]',
   'Familia en fin de semana', 'web', 'confirmada', 100000),

  (1002, 'Ana Prueba',      '+56922222222', 'grande', DATE_TRUNC('day', NOW())::date - INTERVAL '2 days', DATE_TRUNC('day', NOW())::date + INTERVAL '1 day', 8,
   '[]', 360000, '[{"monto":200000,"fecha":"2026-02-28","medio":"efectivo"}]', '[]',
   'Grupo de amigos', 'whatsapp', 'checkin', 200000),

  (1003, 'Carlos Test',     '+56933333333', 'principal', DATE_TRUNC('day', NOW())::date + INTERVAL '10 days', DATE_TRUNC('day', NOW())::date + INTERVAL '12 days', 2,
   '[]', 160000, '[]', '[]',
   'Reserva reciente sin abono', 'instagram', 'pendiente', 0),

  (1004, 'María Ejemplo',   '+56944444444', 'grande', DATE_TRUNC('day', NOW())::date - INTERVAL '10 days', DATE_TRUNC('day', NOW())::date - INTERVAL '7 days', 5,
   '[]', 300000, '[{"monto":300000,"fecha":"2026-02-15","medio":"transferencia"}]', '[]',
   'Estadía completada', 'web', 'completada', 300000),

  (1005, 'Empresa Demo SpA','+56955555555', 'principal', DATE_TRUNC('day', NOW())::date + INTERVAL '20 days', DATE_TRUNC('day', NOW())::date + INTERVAL '23 days', 6,
   '["2026-03-25","2026-03-26"]', 420000, '[{"monto":150000,"fecha":"2026-03-05","medio":"transferencia"}]', '[]',
   'Reserva corporativa', 'correo', 'confirmada', 150000),

  -- Reservas históricas (años anteriores)
  (1101, 'Lucía Histórica', '+56966666666', 'principal', DATE '2023-01-10', DATE '2023-01-15', 3,
   '[]', 250000, '[{"monto":250000,"fecha":"2023-01-05","medio":"transferencia"}]', '[]',
   'Reserva antigua completada', 'web', 'completada', 250000),

  (1102, 'Pedro Archivo',    '+56977777777', 'grande', DATE '2023-07-20', DATE '2023-07-25', 9,
   '[]', 450000, '[{"monto":200000,"fecha":"2023-07-01","medio":"efectivo"},{"monto":250000,"fecha":"2023-07-10","medio":"transferencia"}]', '[]',
   'Grupo grande invierno 2023', 'whatsapp', 'completada', 450000),

  (1103, 'Reserva Cancelada 2023', '+56988888888', 'principal', DATE '2023-11-05', DATE '2023-11-07', 2,
   '[]', 120000, '[{"monto":50000,"fecha":"2023-10-20","medio":"transferencia"}]', '[]',
   'Cliente canceló por enfermedad', 'instagram', 'cancelada', 50000),

  -- Reservas del año pasado
  (1201, 'Familia Verano 2024', '+56999999999', 'grande', DATE '2024-01-15', DATE '2024-01-20', 6,
   '["2024-01-17"]', 380000, '[{"monto":150000,"fecha":"2023-12-15","medio":"transferencia"}]', '[]',
   'Verano alta demanda', 'booking', 'completada', 380000),

  (1202, 'Pareja Otoño', '+56910101010', 'principal', DATE '2024-04-05', DATE '2024-04-08', 2,
   '[]', 180000, '[{"monto":80000,"fecha":"2024-03-20","medio":"transferencia"}]', '[]',
   'Escapada de fin de semana', 'airbnb', 'completada', 180000),

  (1203, 'Reserva Pendiente 2024', '+56912121212', 'grande', DATE '2024-09-10', DATE '2024-09-13', 5,
   '[]', 320000, '[]', '[]',
   'Solicitud sin abono aún', 'web', 'pendiente', 0),

  -- Reservas futuras lejanas (años siguientes)
  (1301, 'Evento 2027', '+56913131313', 'grande', DATE '2027-02-10', DATE '2027-02-15', 10,
   '["2027-02-11","2027-02-13"]', 600000, '[{"monto":200000,"fecha":"2026-12-01","medio":"transferencia"}]', '[]',
   'Reserva anticipada para evento grande', 'correo', 'confirmada', 200000),

  (1302, 'Reserva 2028 Sin Confirmar', '+56914141414', 'principal', DATE '2028-07-01', DATE '2028-07-04', 4,
   '[]', 260000, '[]', '[]',
   'Reserva muy anticipada, pendiente de confirmar', 'web', 'pendiente', 0);

-- Gastos ficticios de ejemplo (mes actual)
INSERT INTO gastos (
  id, cabana, tipo, monto, periodo, fecha_pago, nota
) VALUES
  ('g-2026-03-01', 'principal', 'luz',        85000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '5 days', 'Cuenta de luz mes anterior'),
  ('g-2026-03-02', 'grande',    'gas',        65000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '3 days', 'Carga de gas'),
  ('g-2026-03-03', 'compartido','internet',   35000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '7 days', 'Internet fibra'),
  ('g-2026-03-04', 'compartido','aseo',       50000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '2 days', 'Servicio de aseo general'),
  ('g-2026-03-05', 'principal', 'mantenimiento', 45000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '1 day', 'Mantención tinaja'),

  -- Gastos de meses y años anteriores para ver historial
  ('g-2024-01-01', 'principal', 'luz',        78000, '2024-01', DATE '2024-01-05', 'Luz enero 2024'),
  ('g-2024-01-02', 'grande',    'gas',        62000, '2024-01', DATE '2024-01-08', 'Gas enero 2024'),
  ('g-2024-07-01', 'compartido','internet',   34000, '2024-07', DATE '2024-07-03', 'Internet julio 2024'),
  ('g-2023-02-01', 'principal', 'aseo',       42000, '2023-02', DATE '2023-02-10', 'Aseo febrero 2023'),
  ('g-2023-08-01', 'grande',    'mantenimiento', 70000, '2023-08', DATE '2023-08-15', 'Mantención general cabaña grande 2023');

