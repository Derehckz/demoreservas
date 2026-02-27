-- Tabla completa para reservas en Neon (Netlify DB)
CREATE TABLE IF NOT EXISTS reservas (
    id BIGINT PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    cabana VARCHAR(30) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    personas INTEGER NOT NULL,
    dias_tinaja JSONB,
    precio_total NUMERIC(12,2),
    abonos JSONB,
    tinaja_adicional JSONB,
    notas TEXT,
    origen VARCHAR(30),
    estado VARCHAR(20),
    pagado NUMERIC(12,2)
);

-- Índices para mejorar el rendimiento de consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_inicio  ON reservas (fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_fin     ON reservas (fecha_fin);
CREATE INDEX IF NOT EXISTS idx_reservas_estado        ON reservas (estado);
CREATE INDEX IF NOT EXISTS idx_reservas_cabana        ON reservas (cabana);
-- Índice compuesto para búsquedas de disponibilidad (cabaña + rango de fechas)
CREATE INDEX IF NOT EXISTS idx_reservas_cabana_fechas ON reservas (cabana, fecha_inicio, fecha_fin);