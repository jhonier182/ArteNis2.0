const winston = require('winston');

// Configuración del logger optimizada para rendimiento
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'info', // Mostrar errores en producción para Railway
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json() // Usar JSON para mejor rendimiento
  ),
  defaultMeta: { 
    service: 'artenis-backend',
    pid: process.pid,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Escribir logs de error a error.log con rotación
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Escribir todos los logs a combined.log con rotación
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  // Configuraciones de rendimiento
  exitOnError: false, // No salir en errores de logging
  silent: process.env.NODE_ENV === 'test' // Silenciar en tests
});

// Log también a la consola (necesario para Railway y debugging)
// En producción también mostramos errores en consola para debugging
logger.add(new winston.transports.Console({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'info', // Solo errores en producción
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

// Buffer para logs asíncronos
const logBuffer = [];
const bufferSize = 100;
const flushInterval = 5000; // 5 segundos

// Función para flush asíncrono del buffer
const flushLogBuffer = () => {
  if (logBuffer.length === 0) return;
  
  const logsToFlush = [...logBuffer];
  logBuffer.length = 0;
  
  // Procesar logs en el siguiente tick del event loop
  setImmediate(() => {
    logsToFlush.forEach(({ level, message, meta }) => {
      try {
        logger[level](message, meta);
      } catch (error) {
        console.error('Error en logging:', error);
      }
    });
  });
};

// Flush periódico del buffer
setInterval(flushLogBuffer, flushInterval);

// Función optimizada de logging asíncrono
const asyncLogger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'production') {
      // En producción, usar buffer asíncrono
      logBuffer.push({ level: 'info', message, meta });
      if (logBuffer.length >= bufferSize) {
        flushLogBuffer();
      }
    } else {
      // En desarrollo, logging inmediato
      logger.info(message, meta);
    }
  },
  
  error: (message, meta = {}) => {
    // Errores siempre se procesan inmediatamente
    logger.error(message, meta);
  },
  
  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'production') {
      logBuffer.push({ level: 'warn', message, meta });
      if (logBuffer.length >= bufferSize) {
        flushLogBuffer();
      }
    } else {
      logger.warn(message, meta);
    }
  },
  
  debug: (message, meta = {}) => {
    // Debug solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, meta);
    }
  },
  
  // Función para forzar flush del buffer
  flush: () => {
    flushLogBuffer();
  }
};

module.exports = asyncLogger;
