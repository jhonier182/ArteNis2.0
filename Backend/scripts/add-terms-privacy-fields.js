/**
 * Script de migración para agregar campos de términos y privacidad
 * Ejecutar: node scripts/add-terms-privacy-fields.js
 */

require('dotenv').config();
const { sequelize } = require('../src/config/db');
const logger = require('../src/utils/logger');

async function migrateTermsPrivacyFields() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a la base de datos establecida');

    // Verificar si las columnas ya existen
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('terms_accepted_at', 'privacy_accepted_at')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    const needsTerms = !existingColumns.includes('terms_accepted_at');
    const needsPrivacy = !existingColumns.includes('privacy_accepted_at');

    if (!needsTerms && !needsPrivacy) {
      logger.info('✅ Los campos ya existen en la tabla users');
      return;
    }

    // Agregar columnas si no existen
    if (needsTerms) {
      logger.info('📝 Agregando columna terms_accepted_at...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN terms_accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        AFTER last_login_at
      `);
      logger.info('✅ Columna terms_accepted_at agregada');
    }

    if (needsPrivacy) {
      logger.info('📝 Agregando columna privacy_accepted_at...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN privacy_accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        AFTER terms_accepted_at
      `);
      logger.info('✅ Columna privacy_accepted_at agregada');
    }

    // Actualizar usuarios existentes sin fecha de aceptación (si aplica)
    // Nota: Como usamos DEFAULT CURRENT_TIMESTAMP, los usuarios existentes ya tendrán una fecha
    logger.info('✅ Migración completada exitosamente');
    
  } catch (error) {
    logger.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateTermsPrivacyFields()
    .then(() => {
      logger.info('✨ Script de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Error fatal en migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateTermsPrivacyFields };

