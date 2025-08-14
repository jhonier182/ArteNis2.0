const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  tokenHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'token_hash'
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'user_agent'
  },
  ip: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'revoked_at'
  }
}, {
  tableName: 'refresh_tokens',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = RefreshToken;


