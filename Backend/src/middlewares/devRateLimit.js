const rateLimit = require('express-rate-limit');

// Rate limiter permisivo para desarrollo
const devRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por IP en desarrollo
  message: {
    success: false,
    message: 'Rate limit alcanzado (desarrollo)',
    retryAfter: '1 minuto',
    currentLimit: '1000 requests/15min'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // En desarrollo, ser más permisivo
  handler: (req, res) => {
    console.log(`⚠️ Rate limit alcanzado para IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Rate limit alcanzado (desarrollo)',
      retryAfter: '1 minuto',
      currentLimit: '1000 requests/15min en desarrollo',
      tip: 'En desarrollo, este límite es alto para permitir testing'
    });
  }
});

// Rate limiter estricto para rutas críticas (login, registro)
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Solo 10 intentos de login/registro por 15 minutos
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit estricto alcanzado para IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de autenticación',
      retryAfter: '15 minutos',
      currentLimit: '10 intentos/15min'
    });
  }
});

module.exports = {
  devRateLimit,
  strictRateLimit
};
