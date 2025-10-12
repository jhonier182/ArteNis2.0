// Middleware de métricas para integrar con Express
const { recordRequest, recordDatabaseQuery, recordEventLoopBlock, getMetrics, getHealthStatus } = require('../utils/metrics');

// Middleware para registrar requests
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const eventLoopStart = process.hrtime.bigint();
  
  // Establecer la request actual en el contexto global para el event loop monitor
  global.currentRequest = req;
  
  // También mantener un historial de requests recientes como backup
  if (!global.recentRequests) {
    global.recentRequests = [];
  }
  
  // Agregar request al historial (mantener solo las últimas 10)
  global.recentRequests.push({
    path: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    timestamp: Date.now()
  });
  
  if (global.recentRequests.length > 10) {
    global.recentRequests.shift();
  }
  
  // Interceptar el método json para registrar la respuesta
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Detectar bloqueo del event loop durante esta request
    const eventLoopDelta = process.hrtime.bigint() - eventLoopStart;
    const eventLoopDelay = Number(eventLoopDelta) / 1e6; // Convertir a ms
    
    if (eventLoopDelay > 10) {
      // Registrar bloqueo con contexto de la request
      recordEventLoopBlock(req, eventLoopDelay);
    }
    
    recordRequest(req, res, responseTime);
    
    // Mantener el contexto por más tiempo para el event loop monitor
    setTimeout(() => {
      global.currentRequest = null;
    }, 2000); // Limpiar después de 2 segundos
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware para registrar queries de base de datos
const databaseMetricsMiddleware = (sequelize) => {
  // Interceptar queries de Sequelize
  sequelize.addHook('beforeQuery', (options) => {
    options.startTime = Date.now();
  });
  
  sequelize.addHook('afterQuery', (options) => {
    const executionTime = Date.now() - options.startTime;
    recordDatabaseQuery(options.sql, executionTime, options.error);
  });
  
  return (req, res, next) => {
    next();
  };
};

// Endpoint para obtener métricas
const metricsEndpoint = (req, res) => {
  try {
    const metrics = getMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas',
      error: error.message
    });
  }
};

// Endpoint para obtener estado de salud
const healthEndpoint = (req, res) => {
  try {
    const health = getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      status: health.status,
      issues: health.issues,
      timestamp: new Date().toISOString(),
      uptime: health.metrics.uptime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Error verificando estado de salud',
      error: error.message
    });
  }
};

// Endpoint para obtener métricas de endpoints específicos
const endpointMetricsEndpoint = (req, res) => {
  try {
    const { endpoint } = req.params;
    const metrics = getMetrics();
    
    const endpointData = metrics.endpoints.find(ep => 
      ep.endpoint.includes(endpoint) || ep.endpoint === endpoint
    );
    
    if (!endpointData) {
      return res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado en métricas'
      });
    }
    
    res.json({
      success: true,
      data: endpointData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas del endpoint',
      error: error.message
    });
  }
};

// Dashboard simple de métricas (HTML)
const metricsDashboard = (req, res) => {
  const metrics = getMetrics();
  const health = getHealthStatus();
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArteNis - Dashboard de Métricas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-healthy { color: #28a745; }
        .status-degraded { color: #ffc107; }
        .status-error { color: #dc3545; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .refresh-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ArteNis - Dashboard de Métricas</h1>
        
        <div class="card">
            <h2>📊 Estado del Sistema</h2>
            <p class="status-${health.status}">
                Estado: <strong>${health.status.toUpperCase()}</strong>
                ${health.issues.length > 0 ? `<br>Problemas: ${health.issues.join(', ')}` : ''}
            </p>
            <button class="refresh-btn" onclick="location.reload()">🔄 Actualizar</button>
        </div>
        
        <div class="card">
            <h2>📈 Métricas de Requests</h2>
            <div class="metric">
                <div class="metric-value">${metrics.requests.total}</div>
                <div class="metric-label">Total Requests</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.requests.successRate}%</div>
                <div class="metric-label">Tasa de Éxito</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.requests.avgResponseTime}ms</div>
                <div class="metric-label">Tiempo Promedio</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.requests.requestsPerMinute}</div>
                <div class="metric-label">Requests/min</div>
            </div>
        </div>
        
        <div class="card">
            <h2>🗄️ Métricas de Base de Datos</h2>
            <div class="metric">
                <div class="metric-value">${metrics.database.totalQueries}</div>
                <div class="metric-label">Total Queries</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.database.slowQueries}</div>
                <div class="metric-label">Queries Lentas</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.database.deadlocks}</div>
                <div class="metric-label">Deadlocks</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.database.queriesPerMinute}</div>
                <div class="metric-label">Queries/min</div>
            </div>
        </div>
        
        <div class="card">
            <h2>💾 Métricas de Caché</h2>
            <div class="metric">
                <div class="metric-value">${metrics.cache.hitRate}%</div>
                <div class="metric-label">Hit Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.cache.hits}</div>
                <div class="metric-label">Hits</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.cache.misses}</div>
                <div class="metric-label">Misses</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.cache.evictions}</div>
                <div class="metric-label">Evictions</div>
            </div>
        </div>
        
        <div class="card">
            <h2>🔗 Endpoints Más Usados</h2>
            <table>
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Requests</th>
                        <th>Éxito</th>
                        <th>Tiempo Promedio</th>
                        <th>Tiempo Máximo</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.endpoints.slice(0, 10).map(ep => `
                        <tr>
                            <td>${ep.endpoint}</td>
                            <td>${ep.total}</td>
                            <td>${ep.successRate}%</td>
                            <td>${Math.round(ep.avgResponseTime)}ms</td>
                            <td>${Math.round(ep.maxResponseTime)}ms</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h2>💻 Sistema</h2>
            <p><strong>Uptime:</strong> ${Math.floor(metrics.uptime / 3600)} horas</p>
            <p><strong>Memoria:</strong> ${Math.round(metrics.system.memoryUsage.heapUsed / 1024 / 1024)} MB</p>
            <p><strong>Última actualización:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="card">
            <h2>🚨 Errores Recientes</h2>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <h3>📡 Errores de Requests (${metrics.recentErrors.totalRequestErrors} total)</h3>
                    ${metrics.recentErrors.requests.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Endpoint</th>
                                    <th>Método</th>
                                    <th>Status</th>
                                    <th>Usuario</th>
                                    <th>Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.recentErrors.requests.map(error => `
                                    <tr>
                                        <td>${error.endpoint}</td>
                                        <td>${error.method}</td>
                                        <td style="color: #dc3545;">${error.statusCode}</td>
                                        <td>${error.userId}</td>
                                        <td>${new Date(error.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color: #28a745;">✅ No hay errores de requests recientes</p>'}
                </div>
                
                <div style="flex: 1;">
                    <h3>🗄️ Errores de Base de Datos (${metrics.recentErrors.totalDatabaseErrors} total)</h3>
                    ${metrics.recentErrors.database.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Query</th>
                                    <th>Error</th>
                                    <th>Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.recentErrors.database.map(error => `
                                    <tr>
                                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${error.query}">
                                            ${error.query.substring(0, 50)}...
                                        </td>
                                        <td style="color: #dc3545;">${error.error}</td>
                                        <td>${new Date(error.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color: #28a745;">✅ No hay errores de base de datos recientes</p>'}
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>🔄 Event Loop Monitor</h2>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <h3>📊 Estado del Event Loop</h3>
                    <div class="metric">
                        <div class="metric-value" style="color: ${metrics.system.eventLoop.delay > 10 ? '#dc3545' : '#28a745'}">
                            ${metrics.system.eventLoop.delay}ms
                        </div>
                        <div class="metric-label">Delay Actual</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${metrics.system.eventLoop.blockedCount}</div>
                        <div class="metric-label">Bloqueos Totales</div>
                    </div>
                    <p style="margin-top: 10px;">
                        <strong>Estado:</strong> 
                        <span style="color: ${metrics.system.eventLoop.delay > 10 ? '#dc3545' : '#28a745'}">
                            ${metrics.system.eventLoop.delay > 10 ? '🔴 BLOQUEADO' : '🟢 SALUDABLE'}
                        </span>
                    </p>
                </div>
                
                <div style="flex: 2;">
                    <h3>🚨 Últimos Bloqueos del Event Loop</h3>
                    ${metrics.system.eventLoop.blockedEvents.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Endpoint</th>
                                    <th>Método</th>
                                    <th>Delay</th>
                                    <th>Memoria</th>
                                    <th>Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.system.eventLoop.blockedEvents.map(event => `
                                    <tr>
                                        <td>${event.url || 'N/A'}</td>
                                        <td>${event.method || 'N/A'}</td>
                                        <td style="color: #dc3545;">${event.delay.toFixed(2)}ms</td>
                                        <td>${Math.round(event.memoryUsage / 1024 / 1024)}MB</td>
                                        <td>${new Date(event.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color: #28a745;">✅ No hay bloqueos del event loop recientes</p>'}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-refresh cada 30 segundos
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;
  
  res.send(html);
};

module.exports = {
  metricsMiddleware,
  databaseMetricsMiddleware,
  metricsEndpoint,
  healthEndpoint,
  endpointMetricsEndpoint,
  metricsDashboard
};
