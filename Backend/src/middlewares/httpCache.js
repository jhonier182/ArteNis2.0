// Middleware de optimización de caché HTTP
const cache = require('memory-cache');

// Alternativa nativa (comentada) - descomenta si prefieres no usar memory-cache
/*
const cache = {
  _cache: new Map(),
  _timers: new Map(),
  
  put(key, value, duration) {
    // Limpiar timer existente
    if (this._timers.has(key)) {
      clearTimeout(this._timers.get(key));
    }
    
    // Guardar valor
    this._cache.set(key, value);
    
    // Configurar expiración
    const timer = setTimeout(() => {
      this._cache.delete(key);
      this._timers.delete(key);
    }, duration);
    
    this._timers.set(key, timer);
  },
  
  get(key) {
    return this._cache.get(key);
  },
  
  del(key) {
    if (this._timers.has(key)) {
      clearTimeout(this._timers.get(key));
      this._timers.delete(key);
    }
    return this._cache.delete(key);
  },
  
  keys() {
    return Array.from(this._cache.keys());
  },
  
  memsize() {
    return { size: this._cache.size };
  }
};
*/

// Configuración de caché por tipo de endpoint
const CACHE_CONFIG = {
  // Posts y feeds - caché corto
  '/api/posts/feed': 300000, // 5 minutos
  '/api/posts/popular': 300000, // 5 minutos
  
  // Búsquedas - caché medio
  '/api/search/users': 120000, // 2 minutos
  '/api/search/global': 120000, // 2 minutos
  
  // Perfiles de usuario - caché largo
  '/api/profile/me': 600000, // 10 minutos (perfil del usuario autenticado)
  '/api/profile': 600000, // 10 minutos (perfiles de usuario)
  
  // Estadísticas generales - caché muy largo
  '/api/stats/general': 1800000, // 30 minutos
};

// Función para generar clave de caché
const generateCacheKey = (req) => {
  const baseUrl = req.baseUrl + req.path;
  const queryString = JSON.stringify(req.query);
  const userId = req.user?.id || 'anonymous';
  
  return `${baseUrl}:${userId}:${queryString}`;
};

// Middleware de caché HTTP
const httpCacheMiddleware = (duration = 300000) => {
  return (req, res, next) => {
    // Solo aplicar caché a métodos GET
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheKey = generateCacheKey(req);
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      // Agregar headers de caché
      res.set({
        'X-Cache': 'HIT',
        'X-Cache-Key': cacheKey,
        'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}`
      });
      
      return res.json(cachedResponse);
    }
    
    // Interceptar la respuesta para guardarla en caché
    const originalJson = res.json;
    res.json = function(data) {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.put(cacheKey, data, duration);
        
        // Agregar headers de caché
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}`
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Middleware inteligente que determina la duración del caché
const smartCacheMiddleware = (req, res, next) => {
  const path = req.baseUrl + req.path;
  
  // Buscar configuración específica para esta ruta
  let duration = 300000; // 5 minutos por defecto
  
  for (const [pattern, cacheDuration] of Object.entries(CACHE_CONFIG)) {
    if (path.includes(pattern)) {
      duration = cacheDuration;
      break;
    }
  }
  
  // Ajustar duración según el usuario
  if (req.user) {
    // Usuarios autenticados pueden tener caché más corto para datos personalizados
    if (path.includes('/feed') || path.includes('/user/')) {
      duration = Math.min(duration, 120000); // Máximo 2 minutos
    }
  } else {
    // Usuarios anónimos pueden tener caché más largo
    duration = Math.min(duration * 2, 1800000); // Máximo 30 minutos
  }
  
  return httpCacheMiddleware(duration)(req, res, next);
};

// Función para invalidar caché específico
const invalidateHttpCache = (pattern) => {
  const keys = cache.keys();
  let invalidatedCount = 0;
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
      invalidatedCount++;
    }
  });
  
  return invalidatedCount;
};

// Función para limpiar caché expirado
const cleanExpiredCache = () => {
  const keys = cache.keys();
  let cleanedCount = 0;
  
  keys.forEach(key => {
    const value = cache.get(key);
    if (!value) {
      cleanedCount++;
    }
  });
  
  return cleanedCount;
};

// Limpiar caché cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// Middleware para estadísticas de caché
const cacheStatsMiddleware = (req, res, next) => {
  const stats = {
    hits: cache.hits || 0,
    misses: cache.misses || 0,
    keys: cache.keys().length,
    size: JSON.stringify(cache.memsize()).length
  };
  
  res.set('X-Cache-Stats', JSON.stringify(stats));
  next();
};

module.exports = {
  httpCacheMiddleware,
  smartCacheMiddleware,
  invalidateHttpCache,
  cleanExpiredCache,
  cacheStatsMiddleware,
  CACHE_CONFIG
};
