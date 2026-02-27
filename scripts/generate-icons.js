const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '..', 'favicon.svg');
const iconsDir = path.join(__dirname, '..', 'icons');
const svg = fs.readFileSync(svgPath);

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

Promise.all([
  sharp(svg).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png')),
  sharp(svg).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png')),
])
  .then(() => console.log('Iconos PWA generados: icon-192.png, icon-512.png'))
  .catch((err) => {
    console.error('Error generando iconos:', err);
    process.exit(1);
  });
