-- Agrega columnas activa y orden para cabañas dinámicas
-- Ejecutar en Neon SQL Editor después de migracion_config_cabanas.sql

ALTER TABLE config_cabanas ADD COLUMN IF NOT EXISTS activa BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE config_cabanas ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

-- Asegurar que las cabañas existentes tengan orden
UPDATE config_cabanas SET orden = 1 WHERE id = 'principal';
UPDATE config_cabanas SET orden = 2 WHERE id = 'grande';
