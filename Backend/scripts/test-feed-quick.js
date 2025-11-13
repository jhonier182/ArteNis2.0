/**
 * Script de prueba rápida del sistema de feed
 * Verifica que los módulos se carguen correctamente sin errores
 * 
 * Ejecutar con: node scripts/test-feed-quick.js
 */

console.log('🧪 Prueba rápida del sistema de feed...\n');

let errors = 0;
let success = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    success++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    errors++;
  }
}

// Test 1: Cargar featureFlag
test('Cargar featureFlag.js', () => {
  const featureFlag = require('../src/middlewares/featureFlag');
  if (!featureFlag.checkFeatureFlag) throw new Error('checkFeatureFlag no exportado');
  if (!featureFlag.checkCursorFeedEnabled) throw new Error('checkCursorFeedEnabled no exportado');
  if (!featureFlag.isFeatureEnabled) throw new Error('isFeatureEnabled no exportado');
});

// Test 2: Cargar rateLimiter
test('Cargar rateLimiter.js', () => {
  const rateLimiter = require('../src/middlewares/rateLimiter');
  if (!rateLimiter.feedRateLimiter) throw new Error('feedRateLimiter no exportado');
  if (!rateLimiter.publicFeedRateLimiter) throw new Error('publicFeedRateLimiter no exportado');
});

// Test 3: Cargar feedValidation
test('Cargar feedValidation.js', () => {
  const validation = require('../src/middlewares/feedValidation');
  if (!validation.validateFeed) throw new Error('validateFeed no exportado');
  if (!validation.validatePublicPosts) throw new Error('validatePublicPosts no exportado');
  if (!validation.MAX_LIMIT) throw new Error('MAX_LIMIT no exportado');
  if (!validation.DEFAULT_LIMIT) throw new Error('DEFAULT_LIMIT no exportado');
});

// Test 4: Cargar cursorHelper
test('Cargar cursorHelper.js', () => {
  const cursorHelper = require('../src/utils/cursorHelper');
  if (!cursorHelper.decodeCursor) throw new Error('decodeCursor no exportado');
  if (!cursorHelper.generateCursorFromPost) throw new Error('generateCursorFromPost no exportado');
  if (!cursorHelper.encodeCursor) throw new Error('encodeCursor no exportado');
});

// Test 5: Verificar PostService tiene métodos
test('PostService tiene métodos getFeed y getPublicPosts', () => {
  const PostService = require('../src/services/postService');
  if (typeof PostService.getFeed !== 'function') throw new Error('getFeed no es una función');
  if (typeof PostService.getPublicPosts !== 'function') throw new Error('getPublicPosts no es una función');
});

// Test 6: Verificar PostController tiene métodos
test('PostController tiene métodos getFeed y getPublicPosts', () => {
  const PostController = require('../src/controllers/postController');
  if (typeof PostController.getFeed !== 'function') throw new Error('getFeed no es una función');
  if (typeof PostController.getPublicPosts !== 'function') throw new Error('getPublicPosts no es una función');
});

// Test 7: Probar cursorHelper
test('cursorHelper funciona correctamente', () => {
  const { encodeCursor, decodeCursor, generateCursorFromPost } = require('../src/utils/cursorHelper');
  
  const testDate = new Date('2025-01-15T10:00:00Z');
  const testId = 'test-id-123';
  
  const cursor = encodeCursor(testDate, testId);
  if (!cursor) throw new Error('encodeCursor retornó null');
  
  const decoded = decodeCursor(cursor);
  if (!decoded) throw new Error('decodeCursor retornó null');
  if (decoded.id !== testId) throw new Error('ID no coincide después de decodificar');
  
  const postCursor = generateCursorFromPost({ id: testId, createdAt: testDate });
  if (!postCursor) throw new Error('generateCursorFromPost retornó null');
});

// Test 8: Verificar feature flag helper
test('isFeatureEnabled funciona', () => {
  const { isFeatureEnabled } = require('../src/middlewares/featureFlag');
  
  // Test con flag habilitado
  process.env.TEST_FLAG = 'true';
  if (!isFeatureEnabled('TEST_FLAG')) throw new Error('Flag habilitado no detectado');
  
  // Test con flag deshabilitado
  process.env.TEST_FLAG = 'false';
  if (isFeatureEnabled('TEST_FLAG')) throw new Error('Flag deshabilitado no detectado');
  
  delete process.env.TEST_FLAG;
});

// Test 9: Verificar constantes de validación
test('Constantes de validación correctas', () => {
  const { MAX_LIMIT, DEFAULT_LIMIT, MIN_LIMIT } = require('../src/middlewares/feedValidation');
  
  if (MAX_LIMIT !== 50) throw new Error(`MAX_LIMIT debe ser 50, es ${MAX_LIMIT}`);
  if (DEFAULT_LIMIT !== 20) throw new Error(`DEFAULT_LIMIT debe ser 20, es ${DEFAULT_LIMIT}`);
  if (MIN_LIMIT !== 1) throw new Error(`MIN_LIMIT debe ser 1, es ${MIN_LIMIT}`);
});

// Resumen
console.log('\n═══════════════════════════════════════');
console.log('           RESUMEN DE PRUEBAS');
console.log('═══════════════════════════════════════\n');
console.log(`✅ Exitosos: ${success}`);
console.log(`❌ Errores: ${errors}\n`);

if (errors === 0) {
  console.log('🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.\n');
  process.exit(0);
} else {
  console.log('⚠️  Hay errores que deben corregirse.\n');
  process.exit(1);
}

