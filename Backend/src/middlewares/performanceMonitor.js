// Middleware de monitoreo de rendimiento
const logger = require('../utils/logger');

// Métricas de rendimiento
const performanceMetrics = {
  requests: {
    total: 0,
    errors: 0,
    slowRequests: 0
  },
  responseTime: {
    min: Infinity,
    max: 0,
    avg: 0,
    total: 0
  },
  memory: {
    used: 0,
    total: 0,
    peak: 0
  },
  cpu: {
    usage: 0,
    load: []
  }
};

// Función para calcular estadísticas de rendimiento
const calculateStats = () => {
  const { requests, responseTime } = performanceMetrics;
  
  if (requests.total > 0) {
    responseTime.avg = responseTime.total / requests.total;
  }
  
  // Actualizar métricas de memoria
  const memUsage = process.memoryUsage();
  performanceMetrics.memory.used = Math.round(memUsage.heapUsed / 1024 / 1024);
  performanceMetrics.memory.total = Math.round(memUsage.heapTotal / 1024 / 1024);
  
  if (performanceMetrics.memory.used > performanceMetrics.memory.peak) {
    performanceMetrics.memory.peak = performanceMetrics.memory.used;
  }
  
  // Obtener uso de CPU
  const cpuUsage = process.cpuUsage();
  performanceMetrics.cpu.usage = Math.round((cpuUsage.user + cpuUsage.system) / 1000);
  
  return performanceMetrics;
};

// Middleware de monitoreo de rendimiento
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Interceptar el método end de la respuesta
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const endMemory = process.memoryUsage();
    
    // Actualizar métricas
    performanceMetrics.requests.total++;
    
    if (res.statusCode >= 400) {
      performanceMetrics.requests.errors++;
    }
    
    if (responseTime > 1000) { // Requests lentos > 1 segundo
      performanceMetrics.requests.slowRequests++;
    }
    
    // Actualizar estadísticas de tiempo de respuesta
    performanceMetrics.responseTime.min = Math.min(performanceMetrics.responseTime.min, responseTime);
    performanceMetrics.responseTime.max = Math.max(performanceMetrics.responseTime.max, responseTime);
    performanceMetrics.responseTime.total += responseTime;
    
    // Log de requests lentos
    if (responseTime > 2000) { // Requests muy lentos > 2 segundos
      logger.warn('Request lento detectado', {
        method: req.method,
        url: req.url,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        memoryDelta: Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024)
      });
    }
    
    // Log de errores
    if (res.statusCode >= 500) {
      logger.error('Error del servidor', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Llamar al método original
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Middleware para detectar bloqueos del hilo principal
const eventLoopMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  // Verificar el event loop después de un pequeño delay
  setImmediate(() => {
    const delta = process.hrtime(start);
    const nanosec = delta[0] * 1e9 + delta[1];
    const millisec = nanosec / 1e6;
    
    // Si el event loop está bloqueado por más de 10ms, es problemático
    if (millisec > 10) {
      logger.warn('Event loop bloqueado detectado', {
        method: req.method,
        url: req.url,
        eventLoopDelay: `${millisec.toFixed(2)}ms`,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      });
    }
  });
  
  next();
};

// Función para obtener métricas de rendimiento
const getPerformanceMetrics = () => {
  const stats = calculateStats();
  
  return {
    ...stats,
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    timestamp: new Date().toISOString()
  };
};

// Función para limpiar métricas (útil para tests)
const resetMetrics = () => {
  performanceMetrics.requests = { total: 0, errors: 0, slowRequests: 0 };
  performanceMetrics.responseTime = { min: Infinity, max: 0, avg: 0, total: 0 };
  performanceMetrics.memory.peak = 0;
};

// Función para detectar memory leaks
const detectMemoryLeaks = () => {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  
  // Si el uso de memoria es muy alto, alertar
  if (heapUsed > 500) { // Más de 500MB
    logger.warn('Uso alto de memoria detectado', {
      heapUsed: `${heapUsed}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    });
  }
};

// Monitoreo periódico de memoria
setInterval(detectMemoryLeaks, 30000); // Cada 30 segundos

// Función para generar reporte de rendimiento
const generatePerformanceReport = () => {
  const metrics = getPerformanceMetrics();
  
  const report = {
    summary: {
      totalRequests: metrics.requests.total,
      errorRate: metrics.requests.total > 0 ? 
        ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2) + '%' : '0%',
      slowRequestRate: metrics.requests.total > 0 ? 
        ((metrics.requests.slowRequests / metrics.requests.total) * 100).toFixed(2) + '%' : '0%',
      avgResponseTime: metrics.responseTime.avg.toFixed(2) + 'ms',
      memoryUsage: metrics.memory.used + 'MB',
      uptime: Math.round(metrics.uptime) + 's'
    },
    details: metrics
  };
  
  return report;
};

module.exports = {
  performanceMonitor,
  eventLoopMonitor,
  getPerformanceMetrics,
  resetMetrics,
  generatePerformanceReport
};
