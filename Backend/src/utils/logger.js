const winston = require('winston');

// Configuración del logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  defaultMeta: { service: 'artenis-backend' },
  transports: [
    // Escribir logs de error a error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Escribir todos los logs a combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Si no estamos en producción, log también a la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Función simple de logging para desarrollo
const simpleLogger = {
  info: (message, meta = {}) => {
    // Solo log a archivo en desarrollo, no duplicar en consola
    logger.info(message, meta);
  },
  
  error: (message, meta = {}) => {
    console.error(`❌ ${message}`, meta);
    logger.error(message, meta);
  },
  
  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  ${message}`, meta);
    }
    logger.warn(message, meta);
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, meta);
    }
    logger.debug(message, meta);
  }
};

module.exports = simpleLogger;
