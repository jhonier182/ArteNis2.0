// Configuración de optimización de rendimiento para ArteNis
const { sequelize } = require('./db');
const logger = require('../utils/logger');

// Configuración de caché en memoria para consultas frecuentes
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Función para limpiar caché expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
};

// Limpiar caché cada 2 minutos
setInterval(cleanExpiredCache, 2 * 60 * 1000);

// Función para obtener datos con caché
const getCachedData = async (key, fetchFunction, ttl = CACHE_TTL) => {
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
  
  return data;
};

// Función para invalidar caché
const invalidateCache = (pattern) => {
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
};

// Optimización de consultas de posts populares
const getPopularPosts = async (limit = 20) => {
  return getCachedData(`popular_posts_${limit}`, async () => {
    const [results] = await sequelize.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.likes_count,
        p.comments_count,
        p.views_count,
        p.created_at,
        u.username,
        u.avatar,
        u.user_type
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.is_public = true 
        AND p.status = 'published'
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY 
        (p.likes_count * 2 + p.comments_count + p.views_count * 0.1) DESC,
        p.created_at DESC
      LIMIT ?
    `, {
      replacements: [limit],
      type: sequelize.QueryTypes.SELECT
    });
    
    return results;
  }, 3 * 60 * 1000); // Cache por 3 minutos
};

// Optimización de consultas de usuarios populares
const getPopularUsers = async (limit = 10) => {
  return getCachedData(`popular_users_${limit}`, async () => {
    const [results] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.user_type,
        u.followers_count,
        u.posts_count,
        u.rating,
        COUNT(p.id) as recent_posts
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id 
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND p.is_public = true
      WHERE u.is_active = true
        AND u.user_type IN ('artist', 'user')
      GROUP BY u.id
      ORDER BY 
        u.followers_count DESC,
        u.rating DESC,
        recent_posts DESC
      LIMIT ?
    `, {
      replacements: [limit],
      type: sequelize.QueryTypes.SELECT
    });
    
    return results;
  }, 10 * 60 * 1000); // Cache por 10 minutos
};

// Optimización de estadísticas generales
const getGeneralStats = async () => {
  return getCachedData('general_stats', async () => {
    const [results] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM posts WHERE is_public = true AND status = 'published') as total_posts,
        (SELECT COUNT(*) FROM likes) as total_likes,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM users WHERE user_type = 'artist' AND is_active = true) as total_artists,
        (SELECT COUNT(*) FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND is_public = true) as posts_today
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    return results[0];
  }, 5 * 60 * 1000); // Cache por 5 minutos
};

// Optimización de búsqueda de usuarios
const searchUsers = async (query, limit = 20) => {
  const cacheKey = `search_users_${query}_${limit}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      const results = await sequelize.query(`
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.avatar,
          u.user_type,
          u.followers_count,
          u.posts_count,
          u.city,
          u.state,
          u.bio,
          u.is_verified
        FROM users u
        WHERE u.is_active = true
          AND (
            u.username LIKE ? 
            OR u.full_name LIKE ? 
            OR u.bio LIKE ?
          )
        ORDER BY 
          CASE 
            WHEN u.username LIKE ? THEN 1
            WHEN u.full_name LIKE ? THEN 2
            WHEN u.bio LIKE ? THEN 3
            ELSE 4
          END,
          u.followers_count DESC
        LIMIT ?
      `, {
        replacements: [
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          `${query}%`,
          `${query}%`,
          `%${query}%`,
          parseInt(limit)
        ],
        type: sequelize.QueryTypes.SELECT
      });
      
      return results;
    } catch (error) {
      logger.error('Error en búsqueda de usuarios:', error);
      // Si hay error, devolver array vacío en lugar de fallar
      return [];
    }
  }, 2 * 60 * 1000); // Cache por 2 minutos
};

// Optimización de feed de usuario
const getUserFeed = async (userId, limit = 20, offset = 0) => {
  const cacheKey = `user_feed_${userId}_${limit}_${offset}`;
  
  return getCachedData(cacheKey, async () => {
    const [results] = await sequelize.query(`
      SELECT DISTINCT
        p.id,
        p.content,
        p.image_url,
        p.likes_count,
        p.comments_count,
        p.views_count,
        p.created_at,
        u.username,
        u.avatar,
        u.user_type,
        CASE 
          WHEN f.follower_id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_following
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN follows f ON f.follower_id = ? AND f.following_id = p.user_id
      WHERE p.is_public = true 
        AND p.status = 'published'
        AND (
          f.follower_id IS NOT NULL 
          OR p.user_id = ?
        )
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, {
      replacements: [userId, userId, limit, offset],
      type: sequelize.QueryTypes.SELECT
    });
    
    return results;
  }, 1 * 60 * 1000); // Cache por 1 minuto
};

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
    
    // Limpiar caché de búsquedas antiguas
    const oldCacheKeys = [];
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (value.expiresAt < now - (24 * 60 * 60 * 1000)) { // Más de 24 horas
        oldCacheKeys.push(key);
      }
    }
    
    oldCacheKeys.forEach(key => memoryCache.delete(key));
    
    logger.info(`✅ Limpieza completada. ${oldCacheKeys.length} elementos de caché eliminados`);
  } catch (error) {
    logger.warn('⚠️ Error en limpieza de datos:', error.message);
  }
};

// Ejecutar limpieza cada hora
setInterval(cleanupOldData, 60 * 60 * 1000);

module.exports = {
  getCachedData,
  invalidateCache,
  getPopularPosts,
  getPopularUsers,
  getGeneralStats,
  searchUsers,
  getUserFeed,
  optimizeDatabaseConnections,
  cleanupOldData,
  memoryCache
};
