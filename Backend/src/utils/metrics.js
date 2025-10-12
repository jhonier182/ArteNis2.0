// Sistema de métricas y monitoreo en tiempo real para ArteNis
const { sequelize } = require('../config/db');
const logger = require('./logger');

// Métricas en memoria (OPTIMIZADO PARA REDUCIR MEMORIA)
const metrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    byEndpoint: new Map(),
    responseTimes: [], // Limitado a 100 elementos
    errors: [] // Limitado a 50 elementos
  },
  database: {
    queries: 0,
    slowQueries: 0,
    connections: 0,
    deadlocks: 0,
    errors: [] // Limitado a 20 elementos
  },
  cache: {
    hits: 0,
    misses: 0,
    size: 0,
    evictions: 0
  },
  system: {
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: Date.now(),
    lastHealthCheck: Date.now(),
    eventLoop: {
      delay: 0,
      utilization: 0,
      blockedCount: 0,
      blockedEvents: [] // Últimos 20 eventos que bloquearon el event loop
    }
  }
};

// Límites para evitar acumulación excesiva de memoria
const MEMORY_LIMITS = {
  responseTimes: 100, // Máximo 100 tiempos de respuesta
  requestErrors: 50,  // Máximo 50 errores de requests
  dbErrors: 20,       // Máximo 20 errores de DB
  endpointStats: 50   // Máximo 50 endpoints en estadísticas
};

// Monitoreo del Event Loop
let eventLoopStart = process.hrtime.bigint();
let eventLoopBlocked = false;

// Función para medir el delay del event loop
const measureEventLoopDelay = () => {
  const start = process.hrtime.bigint();
  
  setImmediate(() => {
    const delta = process.hrtime.bigint() - start;
    const nanosec = Number(delta);
    const millisec = nanosec / 1e6;
    
    metrics.system.eventLoop.delay = millisec;
    
    // Detectar bloqueos del event loop (> 10ms)
    if (millisec > 10) {
      metrics.system.eventLoop.blockedCount++;
      
      // Limitar eventos bloqueados en memoria
      if (metrics.system.eventLoop.blockedEvents.length >= 20) {
        metrics.system.eventLoop.blockedEvents.shift();
      }
      
      // Crear el evento de bloqueo con contexto inmediato
      const currentRequest = global.currentRequest;
      let requestContext = {
        url: 'unknown',
        method: 'unknown',
        userId: 'unknown'
      };
      
      // Intentar obtener contexto de la request actual
      if (currentRequest) {
        requestContext = {
          url: currentRequest.path,
          method: currentRequest.method,
          userId: currentRequest.user?.id || 'anonymous'
        };
      } else if (global.recentRequests && global.recentRequests.length > 0) {
        // Usar la request más reciente como backup
        const recentRequest = global.recentRequests[global.recentRequests.length - 1];
        requestContext = {
          url: recentRequest.path,
          method: recentRequest.method,
          userId: recentRequest.userId
        };
      }
      
      const blockedEvent = {
        delay: millisec,
        timestamp: Date.now(),
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage(),
        url: requestContext.url,
        method: requestContext.method,
        userId: requestContext.userId
      };
      
      metrics.system.eventLoop.blockedEvents.push(blockedEvent);
      
      // Log del bloqueo para el dashboard
      logger.warn(`Event loop bloqueado detectado`, {
        eventLoopDelay: `${millisec.toFixed(2)}ms`,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        url: blockedEvent.url,
        method: blockedEvent.method
      });
    }
    
    // Programar la siguiente medición
    setTimeout(measureEventLoopDelay, 100);
  });
};

// Iniciar monitoreo del event loop
measureEventLoopDelay();

// Configuración de alertas
const ALERT_THRESHOLDS = {
  responseTime: 2000, // 2 segundos
  errorRate: 0.05, // 5%
  memoryUsage: 0.8, // 80%
  slowQueries: 10, // 10 queries lentas por minuto
  deadlocks: 5 // 5 deadlocks por hora
};

// Función para registrar métricas de requests (OPTIMIZADA PARA MEMORIA)
const recordRequest = (req, res, responseTime) => {
  metrics.requests.total++;
  
  if (res.statusCode >= 200 && res.statusCode < 400) {
    metrics.requests.successful++;
  } else {
    metrics.requests.failed++;
    
    // OPTIMIZACIÓN: Limitar errores en memoria
    if (metrics.requests.errors.length >= MEMORY_LIMITS.requestErrors) {
      metrics.requests.errors.shift(); // Eliminar el más antiguo
    }
    
    metrics.requests.errors.push({
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      timestamp: Date.now(),
      userId: req.user?.id || 'anonymous'
    });
  }
  
  // Registrar por endpoint
  const endpoint = `${req.method} ${req.path}`;
  if (!metrics.requests.byEndpoint.has(endpoint)) {
    metrics.requests.byEndpoint.set(endpoint, {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
      maxResponseTime: 0
    });
  }
  
  const endpointMetrics = metrics.requests.byEndpoint.get(endpoint);
  endpointMetrics.total++;
  if (res.statusCode >= 200 && res.statusCode < 400) {
    endpointMetrics.successful++;
  } else {
    endpointMetrics.failed++;
  }
  
  // Actualizar tiempos de respuesta
  endpointMetrics.avgResponseTime = 
    (endpointMetrics.avgResponseTime * (endpointMetrics.total - 1) + responseTime) / endpointMetrics.total;
  endpointMetrics.maxResponseTime = Math.max(endpointMetrics.maxResponseTime, responseTime);
  
  // OPTIMIZACIÓN: Reducir límite de responseTimes de 1000 a 100
  metrics.requests.responseTimes.push(responseTime);
  if (metrics.requests.responseTimes.length > MEMORY_LIMITS.responseTimes) {
    metrics.requests.responseTimes.shift();
  }
  
  // OPTIMIZACIÓN: Limitar endpoints en memoria (mantener solo los más activos)
  if (metrics.requests.byEndpoint.size > MEMORY_LIMITS.endpointStats) {
    const entries = Array.from(metrics.requests.byEndpoint.entries());
    entries.sort((a, b) => b[1].total - a[1].total); // Ordenar por total de requests
    metrics.requests.byEndpoint.clear();
    entries.slice(0, MEMORY_LIMITS.endpointStats).forEach(([key, value]) => {
      metrics.requests.byEndpoint.set(key, value);
    });
  }
  
  // Verificar alertas
  checkAlerts(req, res, responseTime);
};

// Función para registrar métricas de base de datos (OPTIMIZADA PARA MEMORIA)
const recordDatabaseQuery = (query, executionTime, error = null) => {
  metrics.database.queries++;
  
  if (executionTime > 1000) { // Queries lentas (> 1 segundo)
    metrics.database.slowQueries++;
    logger.warn(`🐌 Query lenta detectada: ${executionTime}ms - ${query.substring(0, 100)}...`);
  }
  
  if (error) {
    // OPTIMIZACIÓN: Limitar errores de DB en memoria
    if (metrics.database.errors.length >= MEMORY_LIMITS.dbErrors) {
      metrics.database.errors.shift(); // Eliminar el más antiguo
    }
    
    metrics.database.errors.push({
      query: query.substring(0, 200),
      error: error.message,
      timestamp: Date.now()
    });
    
    if (error.message.includes('Deadlock')) {
      metrics.database.deadlocks++;
      logger.error(`🚨 Deadlock detectado en query: ${query.substring(0, 100)}...`);
    }
  }
};

// Función para registrar métricas de caché
const recordCacheOperation = (operation, hit = false) => {
  if (operation === 'hit') {
    metrics.cache.hits++;
  } else if (operation === 'miss') {
    metrics.cache.misses++;
  } else if (operation === 'eviction') {
    metrics.cache.evictions++;
  }
};

// Función para registrar bloqueos del event loop con contexto
const recordEventLoopBlock = (req, delay) => {
  // Incrementar contador de bloqueos
  metrics.system.eventLoop.blockedCount++;
  
  // Limitar eventos bloqueados en memoria
  if (metrics.system.eventLoop.blockedEvents.length >= 20) {
    metrics.system.eventLoop.blockedEvents.shift();
  }
  
  // Crear evento de bloqueo con contexto completo
  const blockedEvent = {
    delay: delay,
    timestamp: Date.now(),
    memoryUsage: process.memoryUsage().heapUsed,
    cpuUsage: process.cpuUsage(),
    url: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous'
  };
  
  metrics.system.eventLoop.blockedEvents.push(blockedEvent);
  
  // Log del bloqueo para el dashboard
  logger.warn(`Event loop bloqueado detectado`, {
    eventLoopDelay: `${delay.toFixed(2)}ms`,
    memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    url: blockedEvent.url,
    method: blockedEvent.method
  });
};

// Función para verificar alertas
const checkAlerts = (req, res, responseTime) => {
  const now = Date.now();
  
  // Alerta de tiempo de respuesta
  if (responseTime > ALERT_THRESHOLDS.responseTime) {
    logger.warn(`⚠️ Respuesta lenta: ${responseTime}ms en ${req.method} ${req.path}`);
  }
  
  // Alerta de tasa de errores
  const errorRate = metrics.requests.failed / metrics.requests.total;
  if (errorRate > ALERT_THRESHOLDS.errorRate && metrics.requests.total > 100) {
    logger.error(`🚨 Alta tasa de errores: ${(errorRate * 100).toFixed(2)}%`);
  }
  
  // Alerta de queries lentas
  const slowQueriesPerMinute = metrics.database.slowQueries / ((now - metrics.system.uptime) / 60000);
  if (slowQueriesPerMinute > ALERT_THRESHOLDS.slowQueries) {
    logger.warn(`🐌 Muchas queries lentas: ${slowQueriesPerMinute.toFixed(2)} por minuto`);
  }
  
  // Alerta de deadlocks
  const deadlocksPerHour = metrics.database.deadlocks / ((now - metrics.system.uptime) / 3600000);
  if (deadlocksPerHour > ALERT_THRESHOLDS.deadlocks) {
    logger.error(`🚨 Muchos deadlocks: ${deadlocksPerHour.toFixed(2)} por hora`);
  }
};

// Función para limpiar memoria periódicamente (NUEVA OPTIMIZACIÓN)
const cleanupMemory = () => {
  // Limpiar arrays que pueden crecer indefinidamente
  if (metrics.requests.responseTimes.length > MEMORY_LIMITS.responseTimes) {
    metrics.requests.responseTimes = metrics.requests.responseTimes.slice(-MEMORY_LIMITS.responseTimes);
  }
  
  if (metrics.requests.errors.length > MEMORY_LIMITS.requestErrors) {
    metrics.requests.errors = metrics.requests.errors.slice(-MEMORY_LIMITS.requestErrors);
  }
  
  if (metrics.database.errors.length > MEMORY_LIMITS.dbErrors) {
    metrics.database.errors = metrics.database.errors.slice(-MEMORY_LIMITS.dbErrors);
  }
  
  // Limpiar endpoints menos activos
  if (metrics.requests.byEndpoint.size > MEMORY_LIMITS.endpointStats) {
    const entries = Array.from(metrics.requests.byEndpoint.entries());
    entries.sort((a, b) => b[1].total - a[1].total);
    metrics.requests.byEndpoint.clear();
    entries.slice(0, MEMORY_LIMITS.endpointStats).forEach(([key, value]) => {
      metrics.requests.byEndpoint.set(key, value);
    });
  }
  
  // Forzar garbage collection si está disponible
  if (global.gc) {
    global.gc();
  }
  

};

// Ejecutar limpieza cada 5 minutos
setInterval(cleanupMemory, 5 * 60 * 1000);

// Función para obtener métricas actuales
const getMetrics = () => {
  const now = Date.now();
  const uptime = now - metrics.system.uptime;
  
  // Calcular estadísticas de tiempo de respuesta
  const responseTimes = metrics.requests.responseTimes;
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  const p95ResponseTime = responseTimes.length > 0
    ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)]
    : 0;
  
  // Calcular tasa de éxito
  const successRate = metrics.requests.total > 0 
    ? (metrics.requests.successful / metrics.requests.total) * 100 
    : 100;
  
  // Calcular tasa de hit de caché
  const cacheHitRate = (metrics.cache.hits + metrics.cache.misses) > 0
    ? (metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100
    : 0;
  
  return {
    timestamp: now,
    uptime: Math.floor(uptime / 1000), // en segundos
    requests: {
      total: metrics.requests.total,
      successful: metrics.requests.successful,
      failed: metrics.requests.failed,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      requestsPerMinute: Math.round((metrics.requests.total / (uptime / 60000)) * 100) / 100
    },
    database: {
      totalQueries: metrics.database.queries,
      slowQueries: metrics.database.slowQueries,
      deadlocks: metrics.database.deadlocks,
      queriesPerMinute: Math.round((metrics.database.queries / (uptime / 60000)) * 100) / 100,
      slowQueryRate: metrics.database.queries > 0 
        ? Math.round((metrics.database.slowQueries / metrics.database.queries) * 10000) / 100
        : 0
    },
    cache: {
      hits: metrics.cache.hits,
      misses: metrics.cache.misses,
      evictions: metrics.cache.evictions,
      hitRate: Math.round(cacheHitRate * 100) / 100,
      size: metrics.cache.size
    },
    system: {
      memoryUsage: process.memoryUsage(),
      memoryUsagePercent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      cpuUsage: process.cpuUsage(),
      uptime: Math.floor(process.uptime()),
      eventLoop: {
        delay: Math.round(metrics.system.eventLoop.delay * 100) / 100,
        blockedCount: metrics.system.eventLoop.blockedCount,
        blockedEvents: metrics.system.eventLoop.blockedEvents.slice(-10) // Últimos 10 eventos
      }
    },
    endpoints: Array.from(metrics.requests.byEndpoint.entries()).map(([endpoint, data]) => ({
      endpoint,
      ...data,
      successRate: Math.round((data.successful / data.total) * 10000) / 100
    })),
    // NUEVO: Errores recientes para el dashboard
    recentErrors: {
      requests: metrics.requests.errors.slice(-10), // Últimos 10 errores de requests
      database: metrics.database.errors.slice(-5), // Últimos 5 errores de DB
      totalRequestErrors: metrics.requests.errors.length,
      totalDatabaseErrors: metrics.database.errors.length
    }
  };
};

// Función para obtener métricas de salud del sistema
const getHealthStatus = () => {
  const currentMetrics = getMetrics();
  const issues = [];
  
  // Verificar tiempo de respuesta promedio
  if (currentMetrics.requests.avgResponseTime > ALERT_THRESHOLDS.responseTime) {
    issues.push(`Tiempo de respuesta alto: ${currentMetrics.requests.avgResponseTime}ms`);
  }
  
  // Verificar tasa de éxito
  if (currentMetrics.requests.successRate < 95) {
    issues.push(`Tasa de éxito baja: ${currentMetrics.requests.successRate}%`);
  }
  
  // Verificar tasa de queries lentas
  if (currentMetrics.database.slowQueryRate > 5) {
    issues.push(`Muchas queries lentas: ${currentMetrics.database.slowQueryRate}%`);
  }
  
  // Verificar deadlocks
  if (currentMetrics.database.deadlocks > 0) {
    issues.push(`Deadlocks detectados: ${currentMetrics.database.deadlocks}`);
  }
  
  // Verificar uso de memoria (OPTIMIZADO)
  const memoryUsagePercent = currentMetrics.system.memoryUsagePercent;
  if (memoryUsagePercent > ALERT_THRESHOLDS.memoryUsage * 100) {
    issues.push(`Alto uso de memoria: ${memoryUsagePercent}%`);
  }
  
  return {
    status: issues.length === 0 ? 'healthy' : 'degraded',
    issues,
    timestamp: Date.now(),
    metrics: currentMetrics
  };
};

// Función para limpiar métricas antiguas
const cleanupMetrics = () => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  // Limpiar errores antiguos
  metrics.requests.errors = metrics.requests.errors.filter(error => error.timestamp > oneHourAgo);
  metrics.database.errors = metrics.database.errors.filter(error => error.timestamp > oneHourAgo);
  
  // Limpiar endpoints con pocas requests
  for (const [endpoint, data] of metrics.requests.byEndpoint.entries()) {
    if (data.total < 5) {
      metrics.requests.byEndpoint.delete(endpoint);
    }
  }
  
  logger.info('🧹 Métricas limpiadas');
};

// Limpiar métricas cada hora
setInterval(cleanupMetrics, 60 * 60 * 1000);

// Función para exportar métricas a archivo
const exportMetrics = async () => {
  try {
    const metricsData = getMetrics();
    const fs = require('fs');
    const path = require('path');
    
    const exportPath = path.join(__dirname, '../../logs/metrics.json');
    await fs.promises.writeFile(exportPath, JSON.stringify(metricsData, null, 2));
    
    logger.info('📊 Métricas exportadas a logs/metrics.json');
  } catch (error) {
    logger.error('❌ Error exportando métricas:', error);
  }
};

// Exportar métricas cada 5 minutos
setInterval(exportMetrics, 5 * 60 * 1000);

module.exports = {
  recordRequest,
  recordDatabaseQuery,
  recordCacheOperation,
  recordEventLoopBlock,
  getMetrics,
  getHealthStatus,
  cleanupMetrics,
  exportMetrics,
  metrics
};
