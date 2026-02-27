-- Añadir columnas de auditoría a la tabla reservas (ejecutar una vez en Neon SQL Editor)
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Para filas existentes, rellenar con la fecha actual si quedan NULL
UPDATE reservas SET created_at = NOW() WHERE created_at IS NULL;
UPDATE reservas SET updated_at = NOW() WHERE updated_at IS NULL;
