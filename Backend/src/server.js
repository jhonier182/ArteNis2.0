require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Función principal para inicializar el servidor
const startServer = async () => {
  try {
    // Iniciando ArteNis Backend...
    
    // Conectar a la base de datos
    await connectDB();
    
    // Iniciar servidor
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Servidor ArteNis iniciado en http://${HOST}:${PORT}`);
      console.log(`🌐 Accesible desde: http://localhost:${PORT}`);
      if (HOST === '0.0.0.0') {
        console.log(`📱 Accesible desde la red local en el puerto ${PORT}`);
      }
    });

    // Manejo elegante del cierre del servidor
    const gracefulShutdown = (signal) => {
      logger.info(`🔄 Señal ${signal} recibida. Cerrando servidor...`);
      
      server.close(async () => {
        logger.info('✅ Servidor HTTP cerrado');
        
        try {
          await closeDB();
          logger.info('✅ Base de datos desconectada');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error cerrando la base de datos:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('❌ Forzando cierre del servidor...');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
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

  } catch (error) {
    logger.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Verificar variables de entorno críticas
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error('❌ Variables de entorno faltantes:');
  missingVars.forEach(varName => {
    logger.error(`   - ${varName}`);
  });
  logger.error('💡 Configura las variables de entorno en el archivo .env');
  process.exit(1);
}

// Iniciar el servidor
startServer();