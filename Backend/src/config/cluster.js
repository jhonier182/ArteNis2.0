// Configuración de clustering para Node.js
const cluster = require('cluster');
const os = require('os');
const logger = require('../utils/logger');

// Configuración de clustering
const clusterConfig = {
  // Número de workers basado en CPU cores
  numCPUs: process.env.NODE_ENV === 'production' 
    ? Math.max(2, os.cpus().length) // Mínimo 2 workers en producción
    : 1, // Solo 1 worker en desarrollo
  
  // Configuración de respawn
  respawnDelay: 5000, // 5 segundos entre respawns
  maxRespawns: 10, // Máximo 10 respawns por worker
  
  // Configuración de graceful shutdown
  gracefulShutdownTimeout: 10000, // 10 segundos para shutdown graceful
};

// Contador de respawns por worker
const workerRespawns = new Map();

// Función para crear un worker
const createWorker = () => {
  const worker = cluster.fork();
  
  logger.info(`Worker ${worker.process.pid} iniciado`);
  
  // Manejar muerte del worker
  worker.on('exit', (code, signal) => {
    const respawnCount = workerRespawns.get(worker.process.pid) || 0;
    
    if (signal) {
      logger.warn(`Worker ${worker.process.pid} terminado por señal: ${signal}`);
    } else if (code !== 0) {
      logger.error(`Worker ${worker.process.pid} terminado con código: ${code}`);
    } else {
      logger.info(`Worker ${worker.process.pid} terminado normalmente`);
    }
    
    // Respawn si no hemos excedido el límite
    if (respawnCount < clusterConfig.maxRespawns) {
      setTimeout(() => {
        const newWorker = createWorker();
        workerRespawns.set(newWorker.process.pid, respawnCount + 1);
        logger.info(`Worker respawned (intento ${respawnCount + 1}/${clusterConfig.maxRespawns})`);
      }, clusterConfig.respawnDelay);
    } else {
      logger.error(`Worker ${worker.process.pid} excedió el límite de respawns`);
    }
  });
  
  // Manejar errores del worker
  worker.on('error', (error) => {
    logger.error(`Error en worker ${worker.process.pid}:`, error);
  });
  
  return worker;
};

// Función para iniciar el cluster
const startCluster = () => {
  if (cluster.isMaster) {
    logger.info(`Master ${process.pid} iniciado`);
    logger.info(`Iniciando ${clusterConfig.numCPUs} workers...`);
    
    // Crear workers
    for (let i = 0; i < clusterConfig.numCPUs; i++) {
      const worker = createWorker();
      workerRespawns.set(worker.process.pid, 0);
    }
    
    // Manejar señales de terminación
    process.on('SIGTERM', () => {
      logger.info('SIGTERM recibido, cerrando workers...');
      gracefulShutdown();
    });
    
    process.on('SIGINT', () => {
      logger.info('SIGINT recibido, cerrando workers...');
      gracefulShutdown();
    });
    
    // Manejar errores no capturados del master
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception en master:', error);
      gracefulShutdown();
    });
    
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection en master:', error);
    });
    
    // Monitoreo de workers
    setInterval(() => {
      const workers = Object.keys(cluster.workers);
      logger.info(`Workers activos: ${workers.length}/${clusterConfig.numCPUs}`);
      
      // Verificar si algún worker está colgado
      workers.forEach(workerId => {
        const worker = cluster.workers[workerId];
        if (worker && worker.isDead()) {
          logger.warn(`Worker ${workerId} está muerto, será respawned`);
        }
      });
    }, 30000); // Cada 30 segundos
    
  } else {
    // Código del worker
    logger.info(`Worker ${process.pid} iniciado`);
    
    // Manejar errores del worker
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception en worker ${process.pid}:`, error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (error) => {
      logger.error(`Unhandled Rejection en worker ${process.pid}:`, error);
    });
    
    // Manejar señales de terminación del worker
    process.on('SIGTERM', () => {
      logger.info(`Worker ${process.pid} recibió SIGTERM, cerrando gracefully...`);
      process.exit(0);
    });
    
    process.on('SIGINT', () => {
      logger.info(`Worker ${process.pid} recibió SIGINT, cerrando gracefully...`);
      process.exit(0);
    });
  }
};

// Función para shutdown graceful
const gracefulShutdown = () => {
  const workers = Object.keys(cluster.workers);
  
  if (workers.length === 0) {
    logger.info('No hay workers activos, cerrando master');
    process.exit(0);
    return;
  }
  
  logger.info(`Cerrando ${workers.length} workers...`);
  
  // Enviar señal de terminación a todos los workers
  workers.forEach(workerId => {
    const worker = cluster.workers[workerId];
    if (worker) {
      worker.kill('SIGTERM');
    }
  });
  
  // Forzar cierre después del timeout
  setTimeout(() => {
    logger.warn('Timeout alcanzado, forzando cierre de workers');
    workers.forEach(workerId => {
      const worker = cluster.workers[workerId];
      if (worker) {
        worker.kill('SIGKILL');
      }
    });
    process.exit(1);
  }, clusterConfig.gracefulShutdownTimeout);
};

// Función para obtener estadísticas del cluster
const getClusterStats = () => {
  if (!cluster.isMaster) {
    return { error: 'Solo disponible en master' };
  }
  
  const workers = Object.keys(cluster.workers);
  const stats = {
    master: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    workers: workers.map(workerId => {
      const worker = cluster.workers[workerId];
      return {
        id: workerId,
        pid: worker.process.pid,
        uptime: process.uptime(),
        respawns: workerRespawns.get(worker.process.pid) || 0,
        isDead: worker.isDead()
      };
    }),
    config: clusterConfig
  };
  
  return stats;
};

// Función para reiniciar workers
const restartWorkers = () => {
  if (!cluster.isMaster) {
    return { error: 'Solo disponible en master' };
  }
  
  logger.info('Reiniciando todos los workers...');
  
  const workers = Object.keys(cluster.workers);
  workers.forEach(workerId => {
    const worker = cluster.workers[workerId];
    if (worker) {
      worker.kill('SIGTERM');
    }
  });
  
  return { message: 'Workers reiniciados' };
};

module.exports = {
  startCluster,
  getClusterStats,
  restartWorkers,
  clusterConfig
};
