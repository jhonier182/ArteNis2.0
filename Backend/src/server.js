require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const logger = require('./utils/logger');
const { startCluster } = require('./config/cluster');

// Definir constantes globales
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Variables de entorno críticas requeridas
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length) {
  logger.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  logger.error('💡 Configura las variables de entorno en el archivo .env');
  process.exit(1);
}

// Selección de modo clustering (preferencia explícita o producción)
const useClustering = process.env.USE_CLUSTERING === 'true' || process.env.NODE_ENV === 'production';

// Manejo elegante del cierre del servidor (graceful shutdown)
const gracefulShutdown = (server, signal) => {
  server.close(async () => {
    try {
      await closeDB();
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error cerrando la base de datos:', error);
      process.exit(1);
    }
  });
  setTimeout(() => {
    logger.error('❌ Forzando cierre del servidor...');
    process.exit(1);
  }, 10000);
};

// Manejo global de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  logger.error('🚨 Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'development') {
    console.error('Promise:', promise);
  }
});
process.on('uncaughtException', (err) => {
  logger.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

// Función principal para inicializar el servidor
const startServer = async () => {
  try {
    await connectDB();

    // Importar y lanzar optimizaciones de base de datos en paralelo solo si existen
    try {
      const dbOpt = require('./config/dbOptimization');
      const perfOpt = require('./config/performanceOptimization');
      
      await Promise.allSettled([
        dbOpt.createOptimizedIndexes?.(),
        dbOpt.analyzeSlowQueries?.(),
        dbOpt.optimizeMySQLConfig?.(),
        dbOpt.createMaterializedViews?.(),
        perfOpt.optimizeDatabaseConnections?.()
      ]);
    } catch (optErr) {
      // Optimizaciones fallidas - continuar sin ellas
    }

    const server = app.listen(PORT, HOST, () => {
      // Servidor iniciado silenciosamente
    });

    // Registrar graceful shutdown solo una vez por proceso (evita fugas)
    ['SIGTERM', 'SIGINT'].forEach(signal =>
      process.once(signal, () => gracefulShutdown(server, signal))
    );
  } catch (error) {
    logger.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar con o sin clustering según corresponda
useClustering ? startCluster() : startServer();
