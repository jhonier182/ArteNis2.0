const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const themeColor = '#dc2626'; // Color rojo del tema
const backgroundColor = '#ffffff';

// Función para crear un ícono con diseño simple
async function createIcon(size, filename) {
  const halfSize = size / 2;
  
  // Crear un SVG simple con un diseño tipo logo
  // Basado en el logo de Sparkles de Inkedin
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${themeColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size * 0.2}"/>
      <circle cx="${halfSize}" cy="${halfSize}" r="${size * 0.35}" fill="url(#grad)"/>
      <path d="M ${halfSize} ${size * 0.3} L ${halfSize + size * 0.15} ${halfSize + size * 0.1} L ${halfSize - size * 0.05} ${halfSize + size * 0.15} L ${halfSize + size * 0.05} ${halfSize + size * 0.15} L ${halfSize - size * 0.15} ${halfSize + size * 0.1} Z" 
            fill="white" opacity="0.9"/>
      <circle cx="${halfSize - size * 0.2}" cy="${halfSize - size * 0.15}" r="${size * 0.04}" fill="white"/>
      <circle cx="${halfSize + size * 0.2}" cy="${halfSize - size * 0.15}" r="${size * 0.04}" fill="white"/>
      <circle cx="${halfSize}" cy="${halfSize + size * 0.2}" r="${size * 0.04}" fill="white"/>
    </svg>
  `;

  // Convertir SVG a PNG
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, filename));

  console.log(`✅ Generado: ${filename} (${size}x${size})`);
}

async function generateIcons() {
  console.log('🎨 Generando íconos para PWA...\n');

  try {
    // Asegurar que el directorio public existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generar ícono 192x192
    await createIcon(192, 'icon-192x192.png');

    // Generar ícono 512x512
    await createIcon(512, 'icon-512x512.png');

    console.log('\n✨ ¡Íconos generados exitosamente!');
    console.log('📁 Ubicación: public/');
    console.log('\n💡 Puedes reemplazar estos íconos con tus propios diseños más adelante.');
  } catch (error) {
    console.error('❌ Error al generar íconos:', error.message);
    process.exit(1);
  }
}

generateIcons();

