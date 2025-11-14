/**
 * Script de verificación del sistema de feed
 * Ejecutar con: node scripts/verify.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema de feed...\n');

let errors = [];
let warnings = [];
let success = [];

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function logSuccess(msg) {
  console.log(`${colors.green}✅${colors.reset} ${msg}`);
  success.push(msg);
}

function logError(msg) {
  console.log(`${colors.red}❌${colors.reset} ${msg}`);
  errors.push(msg);
}

function logWarning(msg) {
  console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`);
  warnings.push(msg);
}

function logInfo(msg) {
  console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`);
}

// Verificar que los archivos existan
const requiredFiles = [
  'src/middlewares/featureFlag.js',
  'src/middlewares/rateLimiter.js',
  'src/middlewares/feedValidation.js',
  'src/controllers/postController.js',
  'src/routes/postRoutes.js',
  'src/services/postService.js',
  'tests/feed.test.js',
  'tests/postController.test.js',
  'tests/setup.js',
  'tests/mocks/posts.mock.js',
  'jest.config.js',
  'docs/API_FEED.md'
];

logInfo('Verificando archivos requeridos...\n');

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    logSuccess(`Archivo existe: ${file}`);
  } else {
    logError(`Archivo faltante: ${file}`);
  }
});

// Verificar sintaxis de archivos JavaScript
logInfo('\nVerificando sintaxis de archivos JavaScript...\n');

const jsFiles = [
  'src/middlewares/featureFlag.js',
  'src/middlewares/rateLimiter.js',
  'src/middlewares/feedValidation.js'
];

jsFiles.forEach(file => {
  try {
    const filePath = path.join(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf8');
    // Intentar parsear como módulo
    new Function('module', 'exports', 'require', content);
    logSuccess(`Sintaxis válida: ${file}`);
  } catch (error) {
    logError(`Error de sintaxis en ${file}: ${error.message}`);
  }
});

// Verificar que los módulos exporten correctamente
logInfo('\nVerificando exports de módulos...\n');

try {
  const featureFlag = require('../src/middlewares/featureFlag');
  if (featureFlag.checkFeatureFlag && featureFlag.checkCursorFeedEnabled && featureFlag.isFeatureEnabled) {
    logSuccess('featureFlag.js exporta correctamente');
  } else {
    logError('featureFlag.js no exporta todas las funciones requeridas');
  }
} catch (error) {
  logError(`Error cargando featureFlag.js: ${error.message}`);
}

try {
  const rateLimiter = require('../src/middlewares/rateLimiter');
  if (rateLimiter.feedRateLimiter && rateLimiter.publicFeedRateLimiter) {
    logSuccess('rateLimiter.js exporta correctamente');
  } else {
    logError('rateLimiter.js no exporta todos los limiters requeridos');
  }
} catch (error) {
  logError(`Error cargando rateLimiter.js: ${error.message}`);
}

try {
  const feedValidation = require('../src/middlewares/feedValidation');
  if (feedValidation.validateFeed && feedValidation.validatePublicPosts) {
    logSuccess('feedValidation.js exporta correctamente');
  } else {
    logError('feedValidation.js no exporta todas las validaciones requeridas');
  }
} catch (error) {
  logError(`Error cargando feedValidation.js: ${error.message}`);
}

// Verificar package.json
logInfo('\nVerificando package.json...\n');

try {
  const packageJson = require('../package.json');
  
  if (packageJson.scripts.test) {
    logSuccess('Script de test configurado');
  } else {
    logWarning('Script de test no encontrado en package.json');
  }
  
  if (packageJson.devDependencies.jest) {
    logSuccess('Jest está en devDependencies');
  } else {
    logWarning('Jest no está en devDependencies');
  }
  
  if (packageJson.devDependencies.supertest) {
    logSuccess('Supertest está en devDependencies');
  } else {
    logWarning('Supertest no está en devDependencies');
  }
} catch (error) {
  logError(`Error leyendo package.json: ${error.message}`);
}

// Verificar estructura de tests
logInfo('\nVerificando estructura de tests...\n');

const testFiles = [
  'tests/feed.test.js',
  'tests/postController.test.js',
  'tests/setup.js',
  'tests/mocks/posts.mock.js'
];

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // setup.js es especial, solo necesita configuración
    if (file === 'tests/setup.js') {
      if (content.includes('jest.mock') || content.includes('process.env') || content.length > 50) {
        logSuccess(`Test válido: ${file}`);
      } else {
        logWarning(`Test puede estar vacío: ${file}`);
      }
    } else if (content.includes('describe') || content.includes('module.exports') || content.includes('jest')) {
      logSuccess(`Test válido: ${file}`);
    } else {
      logWarning(`Test puede estar vacío: ${file}`);
    }
  }
});

// Verificar documentación
logInfo('\nVerificando documentación...\n');

const docFiles = [
  { path: 'docs/API_FEED.md', base: 'Backend' },
  { path: 'FEED_IMPLEMENTATION_CHECKLIST.md', base: 'root' },
  { path: 'IMPLEMENTATION_SUMMARY.md', base: 'root' },
  { path: 'CHANGELOG.md', base: 'root' },
  { path: 'PRODUCTION_READY.md', base: 'root' },
  { path: 'README_FEED.md', base: 'Backend' }
];

docFiles.forEach(({ path: file, base }) => {
  const filePath = base === 'root' 
    ? path.join(__dirname, '..', '..', file)
    : path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    logSuccess(`Documentación existe: ${file}`);
  } else {
    logWarning(`Documentación faltante: ${file}`);
  }
});

// Verificar .env.example
logInfo('\nVerificando configuración...\n');
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExamplePath)) {
  logSuccess('.env.example existe en Backend');
} else {
  // Verificar en raíz
  const rootEnvPath = path.join(__dirname, '..', '..', '.env.example');
  if (fs.existsSync(rootEnvPath)) {
    logSuccess('.env.example existe en raíz del proyecto');
  } else {
    logWarning('.env.example no encontrado (recomendado crear)');
  }
}

// Resumen final
console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}           RESUMEN DE VERIFICACIÓN${colors.reset}`);
console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.green}✅ Exitosos: ${success.length}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Advertencias: ${warnings.length}${colors.reset}`);
console.log(`${colors.red}❌ Errores: ${errors.length}${colors.reset}\n`);

if (errors.length === 0) {
  console.log(`${colors.green}🎉 ¡Todo está correcto! El sistema está listo.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}⚠️  Hay errores que deben corregirse antes de continuar.${colors.reset}\n`);
  process.exit(1);
}

