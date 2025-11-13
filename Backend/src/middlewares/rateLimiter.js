const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Configuración desde variables de entorno
const FEED_AUTH_LIMIT = parseInt(process.env.RATE_LIMIT_FEED_AUTH) || 60;
const FEED_PUBLIC_LIMIT = parseInt(process.env.RATE_LIMIT_FEED_PUBLIC) || 30;

/**
 * Rate limiter para feed autenticado
 * Configurable mediante RATE_LIMIT_FEED_AUTH (default: 60 req/min)
 */
const feedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: FEED_AUTH_LIMIT,
  message: {
    success: false,
    message: 'Demasiadas solicitudes al feed. Intenta de nuevo en un minuto.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true, // Retornar rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Usar userId si está autenticado, sino IP
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // En desarrollo, permitir más requests
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    logger.warn('Rate limit excedido para feed', {
      userId: req.user?.id || 'anon',
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes al feed. Intenta de nuevo en un minuto.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

/**
 * Rate limiter para feed público (explorar)
 * Configurable mediante RATE_LIMIT_FEED_PUBLIC (default: 30 req/min)
 */
const publicFeedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: FEED_PUBLIC_LIMIT,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar IP para feed público
    return req.ip;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    logger.warn('Rate limit excedido para feed público', {
      ip: req.ip,
      path: req.path,
      userId: req.user?.id || 'anon'
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
});

module.exports = {
  feedRateLimiter,
  publicFeedRateLimiter
};

