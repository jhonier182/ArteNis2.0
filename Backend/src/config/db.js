const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

// Validar variables de entorno críticas
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes para la base de datos:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('💡 Configura estas variables en tu archivo .env');
  process.exit(1);
}

// Configuración de la base de datos
const useSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '', // Password puede estar vacío en desarrollo
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false, // Desactivado para mantener terminal limpia
  pool: {
    max: 20,      // Aumentado para mejor concurrencia
    min: 5,       // Mínimo de conexiones activas
    acquire: 60000, // Aumentado a 60s para evitar timeouts
    idle: 30000,   // Aumentado a 30s para mantener conexiones
    evict: 1000,   // Verificar conexiones cada segundo
    handleDisconnects: true // Reconectar automáticamente
  },    
  timezone: '-05:00', // Zona horaria de Colombia
  define: {
    timestamps: true,     // Agregar createdAt y updatedAt automáticamente
    underscored: true,    // Usar snake_case para nombres de columnas
    freezeTableName: true // No pluralizar nombres de tablas
  },
  dialectOptions: {
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true,
    // Configuración SSL/TLS para conectar según la configuración del servidor
    ...(useSsl 
      ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false } }
      : {}
    ),
    // Optimizaciones de conexión
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // Configuraciones de rendimiento
    multipleStatements: false,
    dateStrings: false,
    debug: false
  },
  retry: {
    max: 5, // Aumentado a 5 reintentos
    timeout: 30000, // Timeout de 30s para reintentos
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  },
  // Configuraciones adicionales de rendimiento
  benchmark: false,
  // isolationLevel: 'REPEATABLE_READ', // Comentado para evitar errores de sintaxis SQL
  transactionType: 'IMMEDIATE', // Transacciones más rápidas
  hooks: {
    beforeConnect: (config) => {
      // Configurar conexión antes de conectar
      config.timezone = '-05:00';
    },
    afterConnect: (connection) => {
      // Optimizaciones después de conectar
      connection.query('SET SESSION sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"');
      connection.query('SET SESSION innodb_lock_wait_timeout = 50');
      connection.query('SET SESSION lock_wait_timeout = 50');
    }
  }
});

// Asegura que la base de datos exista antes de autenticar Sequelize
const ensureDatabaseExists = async () => {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME;

  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
};

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    // Crear la base de datos si no existe
    await ensureDatabaseExists();

    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    
    // Sincronizar modelos
    if (process.env.NODE_ENV === 'development') { // Usar force: false para evitar recrear índices
      await sequelize.sync({ force: false, alter: false }); 
      console.log('✅ Modelos sincronizados');
      
      // Crear índices adicionales para mejorar rendimiento y evitar deadlocks
      try {
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS idx_likes_user_post_type 
          ON likes (user_id, post_id, type);
        `);
        console.log('✅ Índices adicionales creados/verificados');
      } catch (indexError) {
        // Los índices ya existen o hay un error menor
        console.log('ℹ️ Índices ya existen o no se pudieron crear');
      }
    } else {
      await sequelize.sync(); 
      console.log('✅ Modelos sincronizados');
    }
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    process.exit(1);
  }
};

// Función para cerrar la conexión
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('❌ Error cerrando la conexión:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB
};