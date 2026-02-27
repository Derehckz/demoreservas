-- Configuración de cabañas (nombres, capacidad, precios incl. tinaja)
-- Ejecutar una vez en Neon SQL Editor
CREATE TABLE IF NOT EXISTS config_cabanas (
    id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    max_personas INTEGER NOT NULL,
    precio_extra_por_persona NUMERIC(12,2) NOT NULL,
    precio_una_noche NUMERIC(12,2) NOT NULL,
    precio_varias_noches NUMERIC(12,2) NOT NULL,
    precio_tinaja NUMERIC(12,2) NOT NULL
);

INSERT INTO config_cabanas (id, nombre, max_personas, precio_extra_por_persona, precio_una_noche, precio_varias_noches, precio_tinaja) VALUES
('principal', 'Cabaña Principal', 6, 10000, 80000, 70000, 25000),
('grande', 'Cabaña Grande', 10, 10000, 120000, 100000, 30000)
ON CONFLICT (id) DO NOTHING;
