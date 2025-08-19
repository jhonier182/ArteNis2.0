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
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,      // Máximo 10 conexiones simultáneas
    min: 0,       // Mínimo 0 conexiones
    acquire: 30000, // Tiempo máximo para obtener conexión (30s)
    idle: 10000   // Tiempo máximo que una conexión puede estar inactiva (10s)
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
    )
  },
  retry: {
    max: 3 // Reintentar conexión hasta 3 veces
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
    
    // Sincronizar modelos
    if (process.env.NODE_ENV === 'development') {
      // Usar force: false para evitar recrear índices
      await sequelize.sync({ force: false, alter: false });
    } else {
      await sequelize.sync();
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
  } catch (error) {
    console.error('❌ Error cerrando la conexión:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB
};