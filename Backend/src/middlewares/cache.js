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
      // OPTIMIZACIÓN: Crear clave de cache más eficiente sin JSON.stringify
      const queryString = Object.keys(req.query)
        .sort()
        .map(k => `${k}=${req.query[k]}`)
        .join('&');
      const cacheKey = `posts:${key}:${queryString}`;
      
      // Intentar obtener del cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {

        return res.status(200).json(cachedData);
      }
      
      // Si no está en cache, interceptar la respuesta
      const originalSend = res.json;
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode === 200 && data.success) {

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

        return res.status(200).json(cachedData);
      }
      
      const originalSend = res.json;
      res.json = function(data) {
        if (res.statusCode === 200 && data.success) {

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

  };
}

module.exports = CacheMiddleware;
