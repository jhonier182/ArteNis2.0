// Script para generar iconos placeholder
// Puedes reemplazar estos iconos después con tus propios diseños

const fs = require('fs');
const path = require('path');

console.log('📱 Para generar los iconos de tu PWA:');
console.log('');
console.log('1. Ve a: https://www.pwabuilder.com/imageGenerator');
console.log('2. Sube tu logo (mínimo 512x512px)');
console.log('3. Descarga el paquete de iconos');
console.log('4. Copia icon-192x192.png y icon-512x512.png a public/');
console.log('');
console.log('O usa el SVG en public/icon.svg como base');
console.log('');
console.log('Mientras tanto, la app usará iconos de respaldo.');

// Crear archivo de instrucciones
const instructions = `
# IMPORTANTE: Generar Iconos de PWA

Los iconos son necesarios para que la PWA se pueda instalar correctamente.

## Archivos necesarios en public/:
- icon-192x192.png
- icon-512x512.png

## Opciones para generarlos:

### Opción 1: PWA Builder (Recomendado)
1. https://www.pwabuilder.com/imageGenerator
2. Sube tu logo (512x512px mínimo)
3. Descarga y coloca en public/

### Opción 2: RealFaviconGenerator
1. https://realfavicongenerator.net/
2. Sube tu logo
3. Descarga los iconos PWA

### Opción 3: Convertir el SVG incluido
1. Usa https://cloudconvert.com/svg-to-png
2. Convierte public/icon.svg a 192x192 y 512x512
3. Guarda en public/
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'GENERATE_ICONS.txt'),
  instructions
);

console.log('✅ Instrucciones guardadas en public/GENERATE_ICONS.txt');

