const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Like = sequelize.define('Like', {
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
    allowNull: true,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'comment_id',
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'love', 'wow', 'fire'),
    allowNull: false,
    defaultValue: 'like'
  }
}, {
  tableName: 'likes',
  indexes: [
    {
      fields: ['user_id', 'post_id'],
      unique: true,
      where: {
        post_id: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['user_id', 'comment_id'],
      unique: true,
      where: {
        comment_id: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    }
  ],
  validate: {
    eitherPostOrComment() {
      if ((!this.postId && !this.commentId) || (this.postId && this.commentId)) {
        throw new Error('El like debe ser para un post o un comentario, pero no ambos');
      }
    }
  }
});

// Métodos estáticos
Like.exists = function(userId, postId = null, commentId = null) {
  const where = { userId };
  if (postId) where.postId = postId;
  if (commentId) where.commentId = commentId;
  
  return this.findOne({ where });
};

module.exports = Like;
