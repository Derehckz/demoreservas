-- Tabla para configuración de admin (ej.: invalidar todos los tokens)
-- Ejecutar una vez en Neon SQL Editor
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO admin_settings (key, value) VALUES ('logout_all_before', '0')
ON CONFLICT (key) DO NOTHING;
