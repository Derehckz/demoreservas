# Mis Cabañas (Cabañas Eli)

Sistema de gestión de reservas para dos cabañas (Principal y Grande): panel de control, calendario, alertas, pagos/abonos, tinaja, mensajes WhatsApp y respaldo.

## Stack

- **Frontend:** HTML, React (UMD), Tailwind CSS. Build con esbuild → bundles precompilados; Babel en el navegador como fallback.
- **Backend:** Netlify Functions (Node.js).
- **Base de datos:** Neon (PostgreSQL).
- **Tests:** Jest (unitarios de utilidades y lógica de estado).

## Cómo correr en local

### Opción 1: Con backend (recomendado)

Necesitas las variables de entorno en un archivo `.env` (usa `.env.example` como plantilla).

```bash
npm install
npx netlify dev
```

Se abre en `http://localhost:8888`. Las funciones y la base de datos se usan con tu `.env`.

### Opción 2: Solo frontend (sin API ni base de datos)

```bash
npx serve .
```

Abre `http://localhost:3000`. El login y las reservas no funcionarán sin el backend; sirve para revisar la interfaz.

### Ambiente de pruebas (otra base de datos)

Para no tocar datos reales, usa una **base de datos Neon separada** para pruebas:

1. **En Neon:** En [console.neon.tech](https://console.neon.tech), en tu proyecto:
   - Crea una **nueva base de datos** (p. ej. `neondb_test`), o
   - Usa un **Branch** (copia de la BD) y toma su connection string.
2. **En el proyecto:** Copia `.env.example` a `.env.test` y pon la URL de esa base de pruebas en `NETLIFY_DATABASE_URL` (y `LOGIN_PASSWORD` si quieres).
3. **Ejecutar migraciones en la BD de pruebas:** En Neon, en la BD de pruebas, ejecuta en el SQL Editor los archivos en `SQL/`: `crear_tabla_reservas_completa.sql`, `migracion_admin_settings.sql`, `migracion_created_updated_at.sql`, `migracion_config_cabanas.sql`, `migracion_cabanas_activa.sql`, `migracion_gastos.sql`.
4. **Arrancar en modo pruebas:**
   ```bash
   npm install
   npm run dev:test
   ```
   Eso usa las variables de `.env.test` y abre `http://localhost:8888` conectado a la base de pruebas.

Si no usas `dotenv-cli`, puedes renombrar `.env` a `.env.production`, copiar `.env.test` a `.env`, ejecutar `npx netlify dev`, y al terminar restaurar `.env`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NETLIFY_DATABASE_URL` | URL de conexión a Neon (PostgreSQL). |
| `LOGIN_PASSWORD` | Contraseña del panel de administración. |
| `VAPID_PUBLIC_KEY` | (Opcional) Clave pública para notificaciones push. |
| `VAPID_PRIVATE_KEY` | (Opcional) Clave privada para notificaciones push. |

Genera claves VAPID: `node scripts/generate-vapid.js`. Copia `.env.example` a `.env` y rellena los valores. **No subas `.env` a git.**

### Si ves error 500 (Internal Server Error)

1. **En local:** usa `npx netlify dev` (no abras el HTML con `file://` ni solo con `npx serve`).
2. **Variables:** comprueba que `.env` tenga `NETLIFY_DATABASE_URL` (URL de Neon) y `LOGIN_PASSWORD` con valores reales (no "CAMBIA_ESTA_CONTRASENA").
3. **Base de datos:** en [Neon SQL Editor](https://console.neon.tech) ejecuta las migraciones en `SQL/`: `crear_tabla_reservas_completa.sql`, `migracion_config_cabanas.sql`, `migracion_cabanas_activa.sql`, `migracion_admin_settings.sql`, `migracion_gastos.sql`, etc.
4. **Respuesta del servidor:** en DevTools → pestaña Network, abre la petición que devuelve 500 y revisa la pestaña "Response"; el cuerpo suele incluir un mensaje (ej. "Falta LOGIN_PASSWORD" o "relation \"reservas\" does not exist").

## Despliegue en Netlify

1. Conecta el repositorio a Netlify.
2. **Build:** `npm run build` (esbuild genera los bundles). Directorio de publicación: `.` (raíz).
3. **Environment variables:** en Site configuration → Environment variables añade:
   - `NETLIFY_DATABASE_URL`
   - `LOGIN_PASSWORD`
   - `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` (para push; genera con `node scripts/generate-vapid.js`)
4. Las funciones están en `netlify/functions`; Netlify las publica automáticamente si `netlify.toml` tiene `functions = "netlify/functions"`.

## Estructura del proyecto

- `index.html` + `js/dashboard.js` / `js/dashboard.bundle.js` — Panel principal (inicio, calendario, alertas, mensajes, resumen, pagos, lista, configuración de cabañas/precios).
- `reserva.html` + `js/reserva.js` / `js/reserva.bundle.js` — Crear o editar una reserva (3 pasos: cliente, reserva, pago).
- `login.html` — Inicio de sesión por contraseña.
- `js/config.js` — Configuración (cabañas, fechas, auth, toast).
- `js/lib/estadoReserva.js` — Lógica de estado de reserva (pendiente, confirmada, checkin, completada, cancelada).
- `config/cabanas.default.json` — Valores por defecto de cabañas; sincronizar con `npm run sync-config`.
- `scripts/sync-config.js` — Sincroniza `config/cabanas.default.json` → `js/config.js`.
- `netlify/functions/` — API: login, reservas, gastos, config, logoutall, cambiarpassword. `_utils.js` contiene utilidades compartidas.

## Base de datos

Las migraciones están en `SQL/`. Ejecutar una vez en Neon (SQL Editor):

- **Tabla principal:** `crear_tabla_reservas_completa.sql` — tabla e índices.
- **Auditoría:** `migracion_created_updated_at.sql` — añade `created_at` y `updated_at` a `reservas`.
- **Cerrar sesión en todos:** `migracion_admin_settings.sql` — tabla `admin_settings` para invalidar tokens.
- **Cabañas y precios:** `migracion_config_cabanas.sql` — tabla `config_cabanas` (nombre, capacidad, precios y tinaja por cabaña).
- **Cabañas dinámicas:** `migracion_cabanas_activa.sql` — columnas `activa` y `orden` para gestionar cabañas desde Config.
- **Gastos:** `migracion_gastos.sql` — tabla `gastos` (cabana, tipo, monto, periodo YYYY-MM, fecha_pago, nota).
- **Push (opcional):** `migracion_push_subscriptions.sql` — tabla `push_subscriptions` para notificaciones push.

## Sesión y seguridad

- El token de sesión expira a los 7 días. Si caduca, al hacer cualquier petición se redirige al login con el mensaje "Sesión expirada".
- **Cambiar contraseña:** En el header (icono 🔑) se puede verificar la contraseña actual; la nueva se debe configurar en Netlify (Environment variables → `LOGIN_PASSWORD`) y volver a desplegar.
- **Cerrar sesión en todos los dispositivos:** En el header (🔓 Todos) se invalidan todos los tokens; hay que volver a iniciar sesión en cada dispositivo.

## Estructura de funciones (API)

- `login.js` — POST: inicia sesión con contraseña, devuelve token.
- `listarreservas.js` — GET: lista todas las reservas.
- `listargastos.js` — GET: lista gastos (query: periodo, cabana, tipo).
- `guardargasto.js` — POST: crea o actualiza un gasto.
- `eliminargasto.js` — DELETE ?id=: elimina un gasto.
- `obtenerreserva.js` — GET ?id=: obtiene una reserva por id.
- `guardarreserva.js` — POST: crea o actualiza una reserva.
- `eliminarreserva.js` — DELETE ?id=: elimina una reserva.
- `obtenerconfig.js` — GET: devuelve la configuración de cabañas (nombres, precios, tinaja). La app la carga al iniciar.
- `guardarconfig.js` — POST: guarda la configuración de cabañas (desde la pestaña Config del panel).
- `logoutall.js` — POST: invalida todos los tokens (cerrar en todos).
- `cambiarpassword.js` — POST: verifica contraseña actual y devuelve instrucciones para cambiar en Netlify.
- `subscribir.js` — POST: guarda suscripción para notificaciones push.
- `getpushconfig.js` — GET: devuelve la clave pública VAPID (para activar push en el cliente).
- `enviaralertas.js` — POST/GET: envía alertas push (llegan hoy, salen hoy, saldo pendiente, sin teléfono, tinaja). Se ejecuta 2 veces al día (8:00 y 14:00 UTC) vía Netlify Scheduled Functions. Solo envía si hay alertas; si está todo tranquilo, no molesta.

## Scripts NPM

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Arranca Netlify Dev con backend y BD. |
| `npm run dev:test` | Igual pero usando `.env.test` (BD de pruebas). |
| `npm run dev:watch` | Build en modo watch + Netlify Dev. |
| `npm run build` | Genera `dashboard.bundle.js` y `reserva.bundle.js` con esbuild. |
| `npm run sync-config` | Sincroniza `config/cabanas.default.json` → `js/config.js`. |
| `npm run generate-icons` | Genera iconos PWA (192x192, 512x512) desde favicon.svg. |
| `npm test` | Ejecuta tests unitarios (Jest). |

## PWA, Push, Check-in/out y Modo oscuro

- **PWA:** La app es instalable. `manifest.json`, `sw.js` e iconos en `icons/`. El navegador ofrece "Agregar a pantalla de inicio".
- **Notificaciones push:** En Config → Activar notificaciones. Requiere `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` en Netlify, y ejecutar `migracion_push_subscriptions.sql`. Se envían 2 veces al día (8:00 y 14:00 UTC, aprox. 4–5 AM y 9–10 AM Chile) **solo cuando hay alertas** (llegan hoy, salen hoy, saldo pendiente, sin confirmar, sin teléfono, tinaja). Título con fecha, mensaje por líneas, y al tocar abre la sección de alertas.
- **Check-in/Check-out rápido:** Botones en Alertas, Lista, Calendario y Dashboard para marcar check-in o check-out sin abrir el detalle.
- **Modo oscuro:** Toggle ☀️/🌙 en el header. Se guarda en localStorage y respeta `prefers-color-scheme` si no hay preferencia guardada.

## Changelog / mejoras recientes

- **Notificaciones push (2026):** 2 envíos diarios (8:00 y 14:00 UTC); solo envía si hay alertas; título con fecha (ej. Lun 27 feb); mensaje por líneas; requireInteraction cuando llegan hoy sin confirmar; al tocar abre `/#alertas`.
- **Build con esbuild:** Bundles precompilados; Babel solo como fallback si falla la carga.
- **Tests unitarios:** Jest para `_utils` (toDateStr, safeParseJson, jsonResponse…) y `estadoReserva` (pendiente, confirmada, checkin, completada, cancelada).
- **Config sync:** `config/cabanas.default.json` + `npm run sync-config` para mantener valores por defecto.
- **Configuración en BD:** Cabañas y precios (incl. tinaja) se guardan en la tabla `config_cabanas`. Nueva pestaña "Config" en el panel para editarlos sin tocar código.
- **Cabañas dinámicas:** En Config puedes agregar, editar y activar/desactivar cabañas. Las inactivas no aparecen al crear nuevas reservas. Ejecuta `migracion_cabanas_activa.sql` antes de usar esta función.
- Filtros en Lista: por cabaña, estado y rango de fechas.
- Auditoría: `created_at` / `updated_at` en reservas; se muestran en el detalle.
- Validaciones en reserva: salida ≥ entrada, mensajes claros de conflicto, entrada máxima 1 año.
- Resumen: bloque "Este mes por cabaña"; Pagos: filtros por cabaña y por mes.
- UX móvil: áreas táctiles (min 44px), toast arriba del nav en móvil, calendario más usable.
- Seguridad: cambiar contraseña (flujo con Netlify) y cerrar sesión en todos los dispositivos.
- **PWA:** manifest, service worker, iconos. App instalable en móvil y desktop.
- **Notificaciones push:** suscripción en Config; 2 envíos diarios (8:00 y 14:00 UTC) solo si hay alertas; título con fecha, mensaje legible, requireInteraction para urgentes; al tocar abre `/#alertas`.
- **Check-in/Check-out rápido** en Alertas, Lista, Calendario y bloque Hoy.
- **Modo oscuro** con toggle y persistencia.
