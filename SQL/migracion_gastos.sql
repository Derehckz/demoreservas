-- Tabla de gastos por cabaña (luz, internet, gas, aseo, mantenimiento, etc.)
-- Ejecutar una vez en Neon SQL Editor

CREATE TABLE IF NOT EXISTS gastos (
    id TEXT PRIMARY KEY,
    cabana TEXT NOT NULL CHECK (cabana IN ('principal', 'grande', 'compartido')),
    tipo TEXT NOT NULL CHECK (tipo IN ('luz', 'internet', 'gas', 'aseo', 'mantenimiento', 'otro')),
    monto NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    periodo TEXT NOT NULL,
    fecha_pago DATE,
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para filtrar por periodo, cabaña y tipo
CREATE INDEX IF NOT EXISTS idx_gastos_periodo ON gastos (periodo);
CREATE INDEX IF NOT EXISTS idx_gastos_cabana ON gastos (cabana);
CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos (tipo);

COMMENT ON COLUMN gastos.periodo IS 'Mes de referencia en formato YYYY-MM (ej. 2026-02)';
COMMENT ON COLUMN gastos.fecha_pago IS 'Fecha en que se realizó el pago (opcional)';
