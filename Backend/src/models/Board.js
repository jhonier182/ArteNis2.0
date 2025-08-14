const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Board = sequelize.define('Board', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [2, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cover_image',
    validate: {
      isUrl: {
        msg: 'La imagen de portada debe ser una URL válida'
      }
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_pinned'
  },
  style: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'traditional', 
      'realistic', 
      'minimalist', 
      'geometric', 
      'watercolor', 
      'blackwork', 
      'dotwork', 
      'tribal', 
      'japanese', 
      'other'
    ),
    allowNull: true
  },
  postsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'posts_count',
    validate: {
      min: 0
    }
  },
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'followers_count',
    validate: {
      min: 0
    }
  },
  collaboratorsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'collaborators_count',
    validate: {
      min: 0
    }
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Los tags deben ser un array');
        }
        if (value.length > 20) {
          throw new Error('Máximo 20 tags permitidos');
        }
      }
    }
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      allowCollaborators: false,
      allowComments: true,
      allowDownloads: false,
      emailNotifications: true
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'boards',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['style']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['is_pinned']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'sort_order']
    }
  ]
});

// Métodos de instancia
Board.prototype.incrementPosts = async function() {
  await this.increment('postsCount');
};

Board.prototype.decrementPosts = async function() {
  await this.decrement('postsCount');
};

Board.prototype.incrementFollowers = async function() {
  await this.increment('followersCount');
};

Board.prototype.decrementFollowers = async function() {
  await this.decrement('followersCount');
};

Board.prototype.incrementCollaborators = async function() {
  await this.increment('collaboratorsCount');
};

Board.prototype.decrementCollaborators = async function() {
  await this.decrement('collaboratorsCount');
};

// Métodos estáticos
Board.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: {
      userId,
      ...options.where
    },
    order: [['isPinned', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    ...options
  });
};

Board.findPublic = function(options = {}) {
  return this.findAll({
    where: {
      isPublic: true,
      ...options.where
    },
    ...options
  });
};

Board.findByCategory = function(category, options = {}) {
  return this.findAll({
    where: {
      category,
      isPublic: true,
      ...options.where
    },
    ...options
  });
};

module.exports = Board;
