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
   'Reserva corporativa', 'correo', 'confirmada', 150000);

-- Gastos ficticios de ejemplo (mes actual)
INSERT INTO gastos (
  id, cabana, tipo, monto, periodo, fecha_pago, nota
) VALUES
  ('g-2026-03-01', 'principal', 'luz',        85000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '5 days', 'Cuenta de luz mes anterior'),
  ('g-2026-03-02', 'grande',    'gas',        65000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '3 days', 'Carga de gas'),
  ('g-2026-03-03', 'compartido','internet',   35000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '7 days', 'Internet fibra'),
  ('g-2026-03-04', 'compartido','aseo',       50000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '2 days', 'Servicio de aseo general'),
  ('g-2026-03-05', 'principal', 'mantenimiento', 45000, to_char(NOW(), 'YYYY-MM'), NOW()::date - INTERVAL '1 day', 'Mantención tinaja');

