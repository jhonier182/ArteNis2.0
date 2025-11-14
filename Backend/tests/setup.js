/**
 * Configuración global para tests
 */

// Mock de logger para evitar logs durante tests
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.ENABLE_CURSOR_FEED = 'true';
process.env.RATE_LIMIT_FEED_AUTH = '60';
process.env.RATE_LIMIT_FEED_PUBLIC = '30';

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

