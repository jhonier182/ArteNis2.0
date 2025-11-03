// Configuración de optimización de rendimiento para ArteNis
const { sequelize } = require('./db');
const logger = require('../utils/logger');

// Función para optimizar conexiones de base de datos
const optimizeDatabaseConnections = async () => {
  try {
    logger.info('🔧 Optimizando conexiones de base de datos...');
    
    // Configurar parámetros de conexión optimizados
    await sequelize.query(`
      SET SESSION wait_timeout = 28800;
      SET SESSION interactive_timeout = 28800;
      SET SESSION net_read_timeout = 30;
      SET SESSION net_write_timeout = 60;
      SET SESSION max_allowed_packet = 16777216;
    `);
    
    logger.info('✅ Conexiones de base de datos optimizadas');
  } catch (error) {
    logger.warn('⚠️ No se pudieron optimizar las conexiones:', error.message);
  }
};

// Función para limpiar datos antiguos
const cleanupOldData = async () => {
  try {
    logger.info('🧹 Limpiando datos antiguos...');
    
    // Limpiar tokens de refresco expirados (más de 30 días)
    await sequelize.query(`
      DELETE FROM refresh_tokens 
      WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Limpiar logs de sesión antiguos (más de 7 días)
    await sequelize.query(`
      DELETE FROM user_sessions 
      WHERE last_activity < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    logger.info('✅ Limpieza completada');
  } catch (error) {
    logger.warn('⚠️ Error en limpieza de datos:', error.message);
  }
};

// Ejecutar limpieza cada hora
setInterval(cleanupOldData, 60 * 60 * 1000);

module.exports = {
  optimizeDatabaseConnections,
  cleanupOldData
};
