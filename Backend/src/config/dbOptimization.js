// Configuración de índices para optimización de base de datos
const { sequelize } = require('./db');

// Función para crear índices optimizados
const createOptimizedIndexes = async () => {
  try {
    console.log('🔧 Creando índices optimizados...');
    
    // Índices para la tabla de posts
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at 
      ON posts (user_id, created_at DESC);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at 
      ON posts (created_at DESC);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_likes_count 
      ON posts (likes_count DESC);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_board_id 
      ON posts (board_id);
    `);
    
    // Índices para la tabla de likes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_likes_user_post 
      ON likes (user_id, post_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_likes_post_id 
      ON likes (post_id);
    `);
    
    // Índices para la tabla de comentarios
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at 
      ON comments (post_id, created_at DESC);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_user_id 
      ON comments (user_id);
    `);
    
    // Índices para la tabla de usuarios
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username 
      ON users (username);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users (email);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at 
      ON users (created_at DESC);
    `);
    
    // Índices para la tabla de follows
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_follows_follower_id 
      ON follows (follower_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_follows_following_id 
      ON follows (following_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_follows_follower_following 
      ON follows (follower_id, following_id);
    `);
    
    // Índices para la tabla de availability
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_availability_artist_id_type 
      ON availability (artist_id, type);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_availability_artist_id_day 
      ON availability (artist_id, day_of_week);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_availability_artist_id_active 
      ON availability (artist_id, is_active);
    `);
    
    // Índices para la tabla de bookings
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_artist_id_date 
      ON bookings (artist_id, appointment_date);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id 
      ON bookings (user_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_status 
      ON bookings (status);
    `);
    
    // Índices para búsquedas de texto completo
    await sequelize.query(`
      CREATE FULLTEXT INDEX IF NOT EXISTS idx_posts_content_fulltext 
      ON posts (content);
    `);
    
    await sequelize.query(`
      CREATE FULLTEXT INDEX IF NOT EXISTS idx_users_bio_fulltext 
      ON users (bio);
    `);
    
    console.log('✅ Índices optimizados creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
    // No lanzar error para no interrumpir el inicio del servidor
  }
};

// Función para analizar y optimizar consultas lentas
const analyzeSlowQueries = async () => {
  try {
    console.log('📊 Analizando consultas lentas...');
    
    // Habilitar logging de consultas lentas
    await sequelize.query(`
      SET GLOBAL slow_query_log = 'ON';
      SET GLOBAL long_query_time = 1;
      SET GLOBAL log_queries_not_using_indexes = 'ON';
    `);
    
    console.log('✅ Análisis de consultas lentas habilitado');
    
  } catch (error) {
    console.log('⚠️ No se pudo habilitar análisis de consultas lentas:', error.message);
  }
};

// Función para optimizar configuración de MySQL
const optimizeMySQLConfig = async () => {
  try {
    console.log('⚙️ Optimizando configuración de MySQL...');
    
    // Configuraciones de rendimiento
    await sequelize.query(`
      SET SESSION innodb_buffer_pool_size = 128M;
      SET SESSION innodb_log_file_size = 64M;
      SET SESSION innodb_flush_log_at_trx_commit = 2;
      SET SESSION innodb_flush_method = O_DIRECT;
      SET SESSION query_cache_size = 32M;
      SET SESSION query_cache_type = ON;
      SET SESSION tmp_table_size = 64M;
      SET SESSION max_heap_table_size = 64M;
      SET SESSION sort_buffer_size = 2M;
      SET SESSION read_buffer_size = 1M;
      SET SESSION read_rnd_buffer_size = 1M;
      SET SESSION join_buffer_size = 2M;
    `);
    
    console.log('✅ Configuración de MySQL optimizada');
    
  } catch (error) {
    console.log('⚠️ No se pudo optimizar configuración de MySQL:', error.message);
  }
};

// Función para crear vistas materializadas para consultas frecuentes
const createMaterializedViews = async () => {
  try {
    console.log('📋 Creando vistas materializadas...');
    
    // Vista para posts populares
    await sequelize.query(`
      CREATE OR REPLACE VIEW popular_posts AS
      SELECT 
        p.*,
        u.username,
        u.profile_image,
        COUNT(l.id) as total_likes,
        COUNT(c.id) as total_comments
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY p.id
      ORDER BY total_likes DESC, p.created_at DESC
      LIMIT 100;
    `);
    
    // Vista para estadísticas de usuarios
    await sequelize.query(`
      CREATE OR REPLACE VIEW user_stats AS
      SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT p.id) as posts_count,
        COUNT(DISTINCT f1.following_id) as following_count,
        COUNT(DISTINCT f2.follower_id) as followers_count,
        COUNT(DISTINCT l.id) as total_likes_received
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN follows f1 ON u.id = f1.follower_id
      LEFT JOIN follows f2 ON u.id = f2.following_id
      LEFT JOIN likes l ON p.id = l.post_id
      GROUP BY u.id;
    `);
    
    console.log('✅ Vistas materializadas creadas');
    
  } catch (error) {
    console.log('⚠️ No se pudieron crear vistas materializadas:', error.message);
  }
};

module.exports = {
  createOptimizedIndexes,
  analyzeSlowQueries,
  optimizeMySQLConfig,
  createMaterializedViews
};
