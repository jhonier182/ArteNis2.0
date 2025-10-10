const NodeCache = require('node-cache');

// Configurar cache con TTL de 5 minutos
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 120, // Verificar cada 2 minutos
  useClones: false // Mejor rendimiento
});

class CacheMiddleware {
  // Cache para consultas de posts
  static cachePosts = (key, ttl = 300) => {
    return (req, res, next) => {
      const cacheKey = `posts:${key}:${JSON.stringify(req.query)}`;
      
      // Intentar obtener del cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit para ${cacheKey}`);
        return res.status(200).json(cachedData);
      }
      
      // Si no está en cache, interceptar la respuesta
      const originalSend = res.json;
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode === 200 && data.success) {
          console.log(`💾 Guardando en cache: ${cacheKey}`);
          cache.set(cacheKey, data, ttl);
        }
        return originalSend.call(this, data);
      };
      
      next();
    };
  };

  // Cache para datos de usuario
  static cacheUserData = (key, ttl = 600) => {
    return (req, res, next) => {
      if (!req.user) {
        return next();
      }
      
      const cacheKey = `user:${req.user.id}:${key}`;
      
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit para usuario ${req.user.id}`);
        return res.status(200).json(cachedData);
      }
      
      const originalSend = res.json;
      res.json = function(data) {
        if (res.statusCode === 200 && data.success) {
          console.log(`💾 Guardando datos de usuario en cache: ${cacheKey}`);
          cache.set(cacheKey, data, ttl);
        }
        return originalSend.call(this, data);
      };
      
      next();
    };
  };

  // Invalidar cache cuando se crean/actualizan posts
  static invalidatePostCache = (req, res, next) => {
    const originalSend = res.json;
    res.json = function(data) {
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Invalidar cache de posts
        const keys = cache.keys();
        const postKeys = keys.filter(key => key.startsWith('posts:'));
        cache.del(postKeys);
        console.log(`🗑️ Cache de posts invalidado (${postKeys.length} claves)`);
      }
      return originalSend.call(this, data);
    };
    next();
  };

  // Invalidar cache de usuario específico
  static invalidateUserCache = (userId) => {
    const keys = cache.keys();
    const userKeys = keys.filter(key => key.includes(`user:${userId}:`));
    cache.del(userKeys);
    console.log(`🗑️ Cache de usuario ${userId} invalidado (${userKeys.length} claves)`);
  };

  // Obtener estadísticas del cache
  static getCacheStats = () => {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      ksize: cache.getStats().ksize,
      vsize: cache.getStats().vsize
    };
  };

  // Limpiar todo el cache
  static clearCache = () => {
    cache.flushAll();
    console.log('🗑️ Cache completamente limpiado');
  };
}

module.exports = CacheMiddleware;
