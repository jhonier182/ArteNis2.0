const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('email_verification', 'password_reset'),
    allowNull: false,
    defaultValue: 'email_verification'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'used_at'
  }
}, {
  tableName: 'tokens',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['token'], unique: true },
    { fields: ['type'] },
    { fields: ['expires_at'] }
  ]
});

// Métodos de instancia
Token.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

Token.prototype.isUsed = function() {
  return this.usedAt !== null;
};

Token.prototype.markAsUsed = async function() {
  this.usedAt = new Date();
  await this.save({ fields: ['usedAt'] });
};

// Métodos estáticos
Token.findValidToken = function(tokenValue, type) {
  const User = require('./User');
  return this.findOne({
    where: {
      token: tokenValue,
      type,
      usedAt: null
    },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'email', 'username']
    }]
  });
};

Token.cleanExpiredTokens = async function() {
  await this.destroy({
    where: {
      expiresAt: {
        [sequelize.Sequelize.Op.lt]: new Date()
      }
    }
  });
};

module.exports = Token;
