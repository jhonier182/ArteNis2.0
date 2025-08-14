const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [1, 1000],
        msg: 'El comentario debe tener entre 1 y 1000 caracteres'
      }
    }
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count'
  },
  repliesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'replies_count'
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_edited'
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'edited_at'
  }
}, {
  tableName: 'comments',
  indexes: [
    { fields: ['post_id'] },
    { fields: ['user_id'] },
    { fields: ['parent_id'] }
  ],
  hooks: {
    beforeUpdate: (comment) => {
      if (comment.changed('content')) {
        comment.isEdited = true;
        comment.editedAt = new Date();
      }
    }
  }
});

// Métodos de instancia
Comment.prototype.incrementLikes = async function() {
  await this.increment('likesCount');
};

Comment.prototype.decrementLikes = async function() {
  await this.decrement('likesCount');
};

Comment.prototype.incrementReplies = async function() {
  await this.increment('repliesCount');
};

Comment.prototype.decrementReplies = async function() {
  await this.decrement('repliesCount');
};

module.exports = Comment;
