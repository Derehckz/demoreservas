// Genera claves VAPID para Web Push. Ejecutar: node scripts/generate-vapid.js
// Añade VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY a .env y a Netlify Environment Variables.
const webpush = require('web-push');
const vapid = webpush.generateVAPIDKeys();
console.log('Añade estas variables a .env y a Netlify:\n');
console.log('VAPID_PUBLIC_KEY=' + vapid.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapid.privateKey);
