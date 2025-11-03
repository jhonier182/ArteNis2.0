require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const logger = require('./utils/logger');

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
  logger.error('🚨 Unhandled Promise Rejection', { error: err.message, stack: err.stack, promise: promise?.toString() });
});
process.on('uncaughtException', (err) => {
  logger.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

// Función principal para inicializar el servidor
const startServer = async () => {
  try {
    await connectDB();

    // Importar y crear índices optimizados adicionales si existen
    try {
      const dbOpt = require('./config/dbOptimization');
      await dbOpt.createOptimizedIndexes?.();
    } catch (optErr) {
      // Optimizaciones fallidas - continuar sin ellas
    }

    // Crear servidor HTTP para Express y Socket.io
    const httpServer = http.createServer(app);
    
    // Configurar Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.CORS_ORIGINS?.split(',') || ['https://artenis.app']
          : [
              'http://localhost:3000',
              'http://localhost:3001',
              'http://localhost:3002',
              'http://localhost:8081',
              'http://127.0.0.1:3000',
              'http://127.0.0.1:3001',
              'http://192.168.1.2:3000',
              'http://192.168.1.2:3001',
              'http://192.168.1.2:3002',
            ],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Manejar conexiones Socket.io
    io.on('connection', (socket) => {
      const userId = socket.handshake.auth?.userId;
      
      if (userId) {
        // Unir al socket a la sala del usuario (para recibir sus eventos)
        socket.join(userId);
        logger.info(`Socket conectado - Usuario: ${userId}`);
        
        socket.on('disconnect', () => {
          logger.info(`Socket desconectado - Usuario: ${userId}`);
        });
      } else {
        logger.warn(' Socket conectado sin userId, desconectando...');
        socket.disconnect();
      }
    });

    // Exportar io para usar en otros módulos
    global.io = io;

    // Iniciar servidor HTTP (que incluye Express y Socket.io)
    httpServer.listen(PORT, HOST, () => {
      logger.info(`Servidor iniciado en ${HOST}:${PORT}`);
      logger.info(`Socket.io configurado y escuchando`);
    });

    // Registrar graceful shutdown solo una vez por proceso (evita fugas)
    ['SIGTERM', 'SIGINT'].forEach(signal =>
      process.once(signal, () => gracefulShutdown(httpServer, signal))
    );
  } catch (error) {
    logger.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
