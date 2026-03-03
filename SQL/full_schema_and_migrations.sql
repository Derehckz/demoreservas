-- ============================================================
-- Script único: creación de esquema + migraciones principales
-- Proyecto: Panel Reservas Demo (Neon / Netlify DB)
-- Uso recomendado:
--   - Ejecutar sobre una base de datos vacía o nueva de DEMO.
--   - Cada sección está marcada claramente con encabezados.
-- ============================================================

-- ============================================================
-- 1) Tabla principal de reservas
--    Fuente: crear_tabla_reservas_completa.sql
-- ============================================================

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

-- Índices frecuentes para reservas
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_inicio  ON reservas (fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_fin     ON reservas (fecha_fin);
CREATE INDEX IF NOT EXISTS idx_reservas_estado        ON reservas (estado);
CREATE INDEX IF NOT EXISTS idx_reservas_cabana        ON reservas (cabana);
CREATE INDEX IF NOT EXISTS idx_reservas_cabana_fechas ON reservas (cabana, fecha_inicio, fecha_fin);


-- ============================================================
-- 2) Migraciones sobre reservas (auditoría + descuento)
--    Fuente: migracion_created_updated_at.sql, migracion_descuento.sql
-- ============================================================

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE reservas SET created_at = NOW() WHERE created_at IS NULL;
UPDATE reservas SET updated_at = NOW() WHERE updated_at IS NULL;

-- Columna descuento (para registrar descuentos/atenciones por reserva)
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS descuento NUMERIC(12,2) DEFAULT 0;

UPDATE reservas SET descuento = 0 WHERE descuento IS NULL;


-- ============================================================
-- 3) Configuración de cabañas
--    Fuente: migracion_config_cabanas.sql
-- ============================================================

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


-- ============================================================
-- 4) Cabañas dinámicas: columnas activa y orden
--    Fuente: migracion_cabanas_activa.sql
-- ============================================================

ALTER TABLE config_cabanas ADD COLUMN IF NOT EXISTS activa BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE config_cabanas ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

UPDATE config_cabanas SET orden = 1 WHERE id = 'principal';
UPDATE config_cabanas SET orden = 2 WHERE id = 'grande';


-- ============================================================
-- 5) Tabla de gastos por cabaña
--    Fuente: migracion_gastos.sql
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_gastos_periodo ON gastos (periodo);
CREATE INDEX IF NOT EXISTS idx_gastos_cabana ON gastos (cabana);
CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos (tipo);

COMMENT ON COLUMN gastos.periodo IS 'Mes de referencia en formato YYYY-MM (ej. 2026-02)';
COMMENT ON COLUMN gastos.fecha_pago IS 'Fecha en que se realizó el pago (opcional)';


-- ============================================================
-- 6) Configuración de admin para logout global
--    Fuente: migracion_admin_settings.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO admin_settings (key, value) VALUES ('logout_all_before', '0')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- 7) Suscripciones de notificaciones push (PWA)
--    Fuente: migracion_push_subscriptions.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- Fin de script consolidado
-- ============================================================

