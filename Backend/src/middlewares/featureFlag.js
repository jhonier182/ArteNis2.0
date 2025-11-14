const logger = require('../utils/logger');

/**
 * Middleware para verificar feature flags
 * 
 * @param {string} flagName - Nombre de la variable de entorno del feature flag
 * @param {string} errorCode - Código de error a retornar si está deshabilitado
 * @param {string} errorMessage - Mensaje de error personalizado
 */
const checkFeatureFlag = (flagName, errorCode = 'FEATURE_DISABLED', errorMessage = null) => {
  return (req, res, next) => {
    const flagValue = process.env[flagName];
    const isEnabled = flagValue !== 'false' && flagValue !== '0' && flagValue !== '';
    
    if (!isEnabled) {
      const traceId = req.id || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      logger.warn(`[FeatureFlag] ${flagName} deshabilitado`, {
        traceId,
        flagName,
        flagValue,
        userId: req.user?.id || 'anon',
        path: req.path,
        method: req.method
      });
      
      return res.status(503).json({
        success: false,
        message: errorMessage || `La funcionalidad está temporalmente deshabilitada`,
        error: errorCode,
        traceId
      });
    }
    
    next();
  };
};

/**
 * Feature flag específico para el feed con cursor
 */
const checkCursorFeedEnabled = checkFeatureFlag(
  'ENABLE_CURSOR_FEED',
  'FEED_DISABLED',
  'El feed está temporalmente deshabilitado'
);

/**
 * Helper para verificar feature flags en código
 */
const isFeatureEnabled = (flagName) => {
  const flagValue = process.env[flagName];
  return flagValue !== 'false' && flagValue !== '0' && flagValue !== '';
};

module.exports = {
  checkFeatureFlag,
  checkCursorFeedEnabled,
  isFeatureEnabled
};

