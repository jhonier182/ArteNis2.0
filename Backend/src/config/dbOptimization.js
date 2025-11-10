// Configuración de índices para optimización de base de datos
const { sequelize } = require('./db');
const logger = require('../utils/logger');

// Función para crear índices optimizados adicionales (que no están en los modelos)
const createOptimizedIndexes = async () => {
  try {
    // Lista de índices adicionales útiles (evitando duplicados con modelos y db.js)
    const indexes = [
      // Índices compuestos útiles para consultas de feed y búsquedas
      { 
        name: 'idx_posts_created_at_desc', 
        table: 'posts',
        query: 'CREATE INDEX idx_posts_created_at_desc ON posts (created_at DESC)' 
      },
      { 
        name: 'idx_comments_created_at_desc', 
        table: 'comments',
        query: 'CREATE INDEX idx_comments_created_at_desc ON comments (post_id, created_at DESC)' 
      }
    ];
    
    // Crear índices uno por uno con verificación correcta
    for (const index of indexes) {
      try {
        // Verificar si el índice ya existe usando el nombre correcto de la tabla
        const [results] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.statistics 
          WHERE table_schema = DATABASE() 
          AND table_name = '${index.table}' 
          AND index_name = '${index.name}'
        `);
        
        if (results[0]?.count === 0) {
          await sequelize.query(index.query);
          logger.debug(`Índice creado: ${index.name}`);
        }
      } catch (indexError) {
        // Error al crear índice (probablemente ya existe o hay otro problema)
        // No loguear para evitar ruido en logs
      }
    }
    
    // Crear índices FULLTEXT para búsquedas de texto (si la tabla tiene esas columnas)
    try {
      await sequelize.query(`
        CREATE FULLTEXT INDEX idx_posts_description_fulltext 
        ON posts (description)
      `);
      logger.debug('Índice FULLTEXT creado en posts.description');
    } catch (error) {
      // Ignorar si ya existe o si la columna no soporta FULLTEXT
    }
    
  } catch (error) {
    logger.error('Error creando índices adicionales', { error: error.message });
    // No lanzar error para no interrumpir el inicio del servidor
  }
};

module.exports = {
  createOptimizedIndexes
};

