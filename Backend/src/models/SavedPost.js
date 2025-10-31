const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SavedPost = sequelize.define('SavedPost', {
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
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  }
}, {
  tableName: 'saved_posts',
  indexes: [
    {
      fields: ['user_id', 'post_id'],
      unique: true
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['post_id']
    }
  ]
});

module.exports = SavedPost;

