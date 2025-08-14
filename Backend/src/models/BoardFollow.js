const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BoardFollow = sequelize.define('BoardFollow', {
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
  boardId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'board_id',
    references: {
      model: 'boards',
      key: 'id'
    }
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notifications_enabled'
  }
}, {
  tableName: 'board_follows',
  indexes: [
    {
      fields: ['user_id', 'board_id'],
      unique: true
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['board_id']
    }
  ]
});

// Métodos estáticos
BoardFollow.isFollowing = async function(userId, boardId) {
  const follow = await this.findOne({
    where: { userId, boardId }
  });
  return !!follow;
};

BoardFollow.getFollowedBoards = function(userId, options = {}) {
  return this.findAll({
    where: {
      userId,
      ...options.where
    },
    ...options
  });
};

module.exports = BoardFollow;
