// Configuración de índices para optimización de base de datos
const { sequelize } = require('./db');
const logger = require('../utils/logger');

// Función para crear índices optimizados
const createOptimizedIndexes = async () => {
  try {
    
    // Lista de índices a crear con verificación previa
    const indexes = [
      // Índices para la tabla de posts
      { name: 'idx_posts_user_id_created_at', query: 'CREATE INDEX idx_posts_user_id_created_at ON posts (user_id, created_at DESC)' },
      { name: 'idx_posts_created_at', query: 'CREATE INDEX idx_posts_created_at ON posts (created_at DESC)' },
      { name: 'idx_posts_likes_count', query: 'CREATE INDEX idx_posts_likes_count ON posts (likes_count DESC)' },
      { name: 'idx_posts_board_id', query: 'CREATE INDEX idx_posts_board_id ON posts (board_id)' },
      
      // Índices para la tabla de likes
      { name: 'idx_likes_user_post', query: 'CREATE INDEX idx_likes_user_post ON likes (user_id, post_id)' },
      { name: 'idx_likes_post_id', query: 'CREATE INDEX idx_likes_post_id ON likes (post_id)' },
      
      // Índices para la tabla de comentarios
      { name: 'idx_comments_post_id_created_at', query: 'CREATE INDEX idx_comments_post_id_created_at ON comments (post_id, created_at DESC)' },
      { name: 'idx_comments_user_id', query: 'CREATE INDEX idx_comments_user_id ON comments (user_id)' },
      
      // Índices para la tabla de usuarios
      { name: 'idx_users_username', query: 'CREATE INDEX idx_users_username ON users (username)' },
      { name: 'idx_users_email', query: 'CREATE INDEX idx_users_email ON users (email)' },
      { name: 'idx_users_created_at', query: 'CREATE INDEX idx_users_created_at ON users (created_at DESC)' },
      
      // Índices para la tabla de follows
      { name: 'idx_follows_follower_id', query: 'CREATE INDEX idx_follows_follower_id ON follows (follower_id)' },
      { name: 'idx_follows_following_id', query: 'CREATE INDEX idx_follows_following_id ON follows (following_id)' },
      { name: 'idx_follows_follower_following', query: 'CREATE INDEX idx_follows_follower_following ON follows (follower_id, following_id)' },
      
      // Índices para la tabla de availability
      { name: 'idx_availability_artist_id_type', query: 'CREATE INDEX idx_availability_artist_id_type ON availability (artist_id, type)' },
      { name: 'idx_availability_artist_id_day', query: 'CREATE INDEX idx_availability_artist_id_day ON availability (artist_id, day_of_week)' },
      { name: 'idx_availability_artist_id_active', query: 'CREATE INDEX idx_availability_artist_id_active ON availability (artist_id, is_active)' },
      
      // Índices para la tabla de bookings
      { name: 'idx_bookings_artist_id_date', query: 'CREATE INDEX idx_bookings_artist_id_date ON bookings (artist_id, appointment_date)' },
      { name: 'idx_bookings_user_id', query: 'CREATE INDEX idx_bookings_user_id ON bookings (user_id)' },
      { name: 'idx_bookings_status', query: 'CREATE INDEX idx_bookings_status ON bookings (status)' }
    ];
    
    // Crear índices uno por uno con verificación
    for (const index of indexes) {
      try {
        // Verificar si el índice ya existe
        const [results] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.statistics 
          WHERE table_schema = DATABASE() 
          AND table_name = '${index.name.split('_')[1]}' 
          AND index_name = '${index.name}'
        `);
        
        if (results[0].count === 0) {
          await sequelize.query(index.query);

        } else {

        }
      } catch (indexError) {

      }
    }
    
    // Crear índices de texto completo por separado
    try {
      await sequelize.query('CREATE FULLTEXT INDEX idx_posts_content_fulltext ON posts (content)');

    } catch (error) {

    }
    
    try {
      await sequelize.query('CREATE FULLTEXT INDEX idx_users_bio_fulltext ON users (bio)');

    } catch (error) {

    }
    

    
  } catch (error) {
    logger.error('Error creando índices', { error: error.message, stack: error.stack });
    // No lanzar error para no interrumpir el inicio del servidor
  }
};

// Función para analizar y optimizar consultas lentas
const analyzeSlowQueries = async () => {
  try {

    
    // Habilitar logging de consultas lentas (comando por comando)
    try {
      await sequelize.query("SET GLOBAL slow_query_log = 'ON'");

    } catch (error) {

    }
    
    try {
      await sequelize.query('SET GLOBAL long_query_time = 1');

    } catch (error) {

    }
    
    try {
      await sequelize.query("SET GLOBAL log_queries_not_using_indexes = 'ON'");

    } catch (error) {

    }
    
  } catch (error) {

  }
};

// Función para optimizar configuración de MySQL
const optimizeMySQLConfig = async () => {
  try {

    
    // Configuraciones de sesión que SÍ funcionan
    const sessionConfigs = [
      { name: 'Tmp table size', query: 'SET SESSION tmp_table_size = 67108864' }, // 64MB en bytes
      { name: 'Max heap table size', query: 'SET SESSION max_heap_table_size = 67108864' }, // 64MB en bytes
      { name: 'Sort buffer size', query: 'SET SESSION sort_buffer_size = 2097152' }, // 2MB en bytes
      { name: 'Read buffer size', query: 'SET SESSION read_buffer_size = 1048576' }, // 1MB en bytes
      { name: 'Read rnd buffer size', query: 'SET SESSION read_rnd_buffer_size = 1048576' }, // 1MB en bytes
      { name: 'Join buffer size', query: 'SET SESSION join_buffer_size = 2097152' }, // 2MB en bytes
      { name: 'Lock wait timeout', query: 'SET SESSION innodb_lock_wait_timeout = 50' },
      { name: 'Lock wait timeout general', query: 'SET SESSION lock_wait_timeout = 50' },
      { name: 'Wait timeout', query: 'SET SESSION wait_timeout = 28800' },
      { name: 'Interactive timeout', query: 'SET SESSION interactive_timeout = 28800' },
      { name: 'Net read timeout', query: 'SET SESSION net_read_timeout = 30' },
      { name: 'Net write timeout', query: 'SET SESSION net_write_timeout = 60' },
      { name: 'Max allowed packet', query: 'SET SESSION max_allowed_packet = 16777216' }
    ];
    
    // Configuraciones GLOBAL que requieren permisos especiales
    const globalConfigs = [
      { name: 'Buffer pool size', query: 'SET GLOBAL innodb_buffer_pool_size = 134217728' }, // 128MB en bytes
      { name: 'Flush log at commit', query: 'SET GLOBAL innodb_flush_log_at_trx_commit = 2' },
      { name: 'Slow query log', query: "SET GLOBAL slow_query_log = 'ON'" },
      { name: 'Long query time', query: 'SET GLOBAL long_query_time = 1' },
      { name: 'Log queries not using indexes', query: "SET GLOBAL log_queries_not_using_indexes = 'ON'" }
    ];
    
    // Aplicar configuraciones de sesión

    for (const config of sessionConfigs) {
      try {
        await sequelize.query(config.query);

      } catch (error) {

      }
    }
    
    // Intentar configuraciones GLOBAL (requieren permisos especiales)

    for (const config of globalConfigs) {
      try {
        await sequelize.query(config.query);

      } catch (error) {


      }
    }
    
    // Configuraciones específicas por versión de MySQL
    try {
      // Verificar versión de MySQL
      const [versionResult] = await sequelize.query('SELECT VERSION() as version');
      const version = versionResult[0].version;

      
      // Configuraciones específicas para MySQL 8.0+
      if (version.includes('8.0')) {

        
        const mysql8Configs = [
          { name: 'Innodb buffer pool instances', query: 'SET SESSION innodb_buffer_pool_instances = 1' },
          { name: 'Innodb log buffer size', query: 'SET SESSION innodb_log_buffer_size = 16777216' }, // 16MB
          { name: 'Innodb flush neighbors', query: 'SET SESSION innodb_flush_neighbors = 0' },
          { name: 'Innodb io capacity', query: 'SET SESSION innodb_io_capacity = 200' },
          { name: 'Innodb io capacity max', query: 'SET SESSION innodb_io_capacity_max = 2000' }
        ];
        
        for (const config of mysql8Configs) {
          try {
            await sequelize.query(config.query);

          } catch (error) {

          }
        }
      }
    } catch (error) {

    }
    

    
  } catch (error) {

  }
};

// Función para crear vistas materializadas para consultas frecuentes
const createMaterializedViews = async () => {
  try {

    
    // Vista para posts populares
    try {
      await sequelize.query(`
        CREATE OR REPLACE VIEW popular_posts AS
        SELECT 
          p.*,
          u.username,
          u.avatar as profile_image,
          COUNT(l.id) as total_likes,
          COUNT(c.id) as total_comments
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY p.id
        ORDER BY total_likes DESC, p.created_at DESC
        LIMIT 100
      `);

    } catch (error) {

    }
    
    // Vista para estadísticas de usuarios
    try {
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
        GROUP BY u.id
      `);

    } catch (error) {

    }
    

    
  } catch (error) {

  }
};

module.exports = {
  createOptimizedIndexes,
  analyzeSlowQueries,
  optimizeMySQLConfig,
  createMaterializedViews
};
