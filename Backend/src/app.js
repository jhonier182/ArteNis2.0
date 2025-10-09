const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Middlewares locales
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { devRateLimit, strictRateLimit } = require('./middlewares/devRateLimit');
const logger = require('./utils/logger');
const { sequelize } = require('./config/db');

// Importar rutas
const postRoutes = require('./routes/postRoutes');
const boardRoutes = require('./routes/boardRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Importar modelos y establecer asociaciones
const { setupAssociations } = require('./models');

const app = express();

// Configuración de seguridad básica
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// Configuración de CORS - Permitir frontend PWA y desarrollo
const allowedOriginsProd = [
	'https://artenis.app', 
	'https://www.artenis.app'
];

// Obtener orígenes permitidos desde variables de entorno
const corsOrigins = process.env.CORS_ORIGINS ? 
	process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
	[];

const allowedOriginsDev = [
	'http://localhost:3000',
	'http://localhost:3001',
	'http://localhost:8081',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:3001',
	'http://127.0.0.1:8081',
	...corsOrigins, // Agregar orígenes desde variables de entorno
];

const corsOptions = {
	origin: (origin, callback) => {
		// Requests sin origen (Postman, apps nativas, PWA instalada) -> permitir
		if (!origin) return callback(null, true);

		if (process.env.NODE_ENV === 'production') {
			// En producción: permitir orígenes específicos
			if (allowedOriginsProd.includes(origin)) {
				return callback(null, true);
			}
			// También permitir cualquier origen HTTPS en producción (para PWA)
			if (origin.startsWith('https://')) {
				return callback(null, true);
			}
			return callback(new Error(`Not allowed by CORS: ${origin}`));
		}

		// Desarrollo: permitir localhost/127.0.0.1, Expo y redes LAN
		const isLocalhost = allowedOriginsDev.includes(origin);
		const isExpo = origin.startsWith('exp://') || origin.startsWith('expo://');
		const isLan = /^http:\/\/(192\.168|10\.0\.|172\.(1[6-9]|2\d|3[0-1]))\.[0-9]+\.[0-9]+(?::[0-9]+)?$/.test(origin);
		const isLocalFile = origin.startsWith('file://');

		if (isLocalhost || isExpo || isLan || isLocalFile) {
			return callback(null, true);
		}

		// En desarrollo, permitir cualquier origen HTTP/HTTPS
		console.log(`⚠️ CORS: Permitiendo origen en desarrollo: ${origin}`);
		return callback(null, true);
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
	allowedHeaders: [
		'Content-Type', 
		'Authorization', 
		'X-Requested-With',
		'Accept',
		'Origin',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers'
	],
	exposedHeaders: ['Content-Length', 'Content-Range'],
	optionsSuccessStatus: 204,
	maxAge: 86400, // 24 horas de caché para preflight
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting inteligente basado en el entorno
if (process.env.NODE_ENV === 'production') {
  // En producción: rate limiting estricto para todas las rutas
  const prodLimiter = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos'
    }
  });
  app.use(prodLimiter);
} else {
  // Rate limiting estricto solo para autenticación
  app.use('/api/auth/login', strictRateLimit);
  app.use('/api/auth/register', strictRateLimit);
  app.use('/api/auth/refresh', strictRateLimit);
  
  // Rate limiting permisivo para el resto de rutas
  app.use('/api', devRateLimit);
}

// Middleware de compresión
app.use(compression());

// Parseo de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Establecer asociaciones de modelos
setupAssociations();

// Health check
app.get('/health', async (req, res) => {
  try {
    // Intentar autenticar una conexión ligera
    try {
      await sequelize.authenticate();
    } catch (e) {
      return res.status(503).json({
        success: false,
        message: 'Servicio parcialmente disponible - Base de datos desconectada',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'disconnected',
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 3306,
          name: process.env.DB_NAME,
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'ArteNis API funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        name: process.env.DB_NAME,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en health check',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/follow', require('./routes/followRoutes'));
app.use('/api/posts', postRoutes);
app.use('/api/boards', boardRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a ArteNis API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      search: '/api/search',
      follow: '/api/follow',
      posts: '/api/posts',
      boards: '/api/boards',
      health: '/health'
    }
  });
});

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;