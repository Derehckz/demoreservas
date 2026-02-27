-- Añadir columna descuento a la tabla reservas (ejecutar una vez en Neon SQL Editor)
-- Permite registrar montos de descuento/atención por reserva para reportes

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS descuento NUMERIC(12,2) DEFAULT 0;

-- Para filas existentes, asegurar que no queden NULL
UPDATE reservas SET descuento = 0 WHERE descuento IS NULL;
