#!/usr/bin/env node
/**
 * Sincroniza la constante CABANAS en js/config.js desde config/cabanas.default.json
 * Ejecutar: node scripts/sync-config.js
 */
const fs = require('fs');
const path = require('path');

const defaultsPath = path.join(__dirname, '../config/cabanas.default.json');
const configPath = path.join(__dirname, '../js/config.js');

const defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8'));
const { app = {}, principal, grande } = defaults;
const defaultCabanas = { principal, grande };
const appConfig = {
  nombreNegocio: app.nombreNegocio || 'Demo Cabañas',
  tituloPanel: app.tituloPanel || 'Panel Reservas Demo',
  urlResena: app.urlResena || '',
};

const toJs = (obj) => JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, '$1:');
const cabanasJs = `// @@CABANAS_START@@ (sincronizar con: npm run sync-config)
const CABANAS = ${toJs(defaultCabanas)};
const APP_CONFIG = ${toJs(appConfig)};
`;

let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(/\r\n/g, '\n');

const startMarker = '// @@CABANAS_START@@';
const endMarker = '\n\n/** Normaliza teléfono';

const startIdx = config.indexOf(startMarker);
const endIdx = config.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
  console.error('No se encontraron los marcadores en config.js');
  process.exit(1);
}

config =
  config.substring(0, startIdx) +
  cabanasJs +
  config.substring(endIdx);

fs.writeFileSync(configPath, config, 'utf8');
console.log('js/config.js sincronizado desde config/cabanas.default.json');
