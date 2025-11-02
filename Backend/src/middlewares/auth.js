const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Middleware para verificar JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    logger.info(`🔐 Token decodificado - ID del token: ${decoded.id}`);
    
    // ✅ Validar que el usuario existe y está activo en la base de datos
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'userType', 'isActive', 'isPremium']
    });
    
    if (!user) {
      logger.error(`❌ Usuario no encontrado en DB - Token ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // VALIDACIÓN CRÍTICA: Asegurar que el ID del token coincide con el ID del usuario de la DB
    if (decoded.id !== user.id) {
      logger.error(`❌ INCONSISTENCIA CRÍTICA - Token ID (${decoded.id}) != Usuario DB ID (${user.id})`);
      return res.status(401).json({
        success: false,
        message: 'Token inválido - inconsistencia detectada'
      });
    }
    
    if (!user.isActive) {
      logger.warn(`⚠️ Usuario inactivo intentando acceder - ID: ${user.id}`);
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }
    
    // ✅ Usar datos del usuario de la DB, no solo del token
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.userType,
      isPremium: typeof user.isPremiumActive === 'function' ? user.isPremiumActive() : (user.isPremium || false)
    };
    
    logger.info(`✅ Usuario autenticado correctamente - ID: ${req.user.id}, Username: ${req.user.username}`);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    logger.error('Error en verifyToken', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const verifyRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware opcional (no requiere token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continúa sin usuario
    next();
  }
};

module.exports = {
  verifyToken,
  verifyRole,
  optionalAuth
};
