const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BoardPost = sequelize.define('BoardPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  addedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'added_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'board_posts',
  indexes: [
    {
      fields: ['board_id', 'post_id'],
      unique: true
    },
    {
      fields: ['board_id']
    },
    {
      fields: ['post_id']
    },
    {
      fields: ['added_by']
    },
    {
      fields: ['board_id', 'sort_order']
    }
  ]
});

module.exports = BoardPost;
