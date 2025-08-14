const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Post = sequelize.define('Post', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('image', 'video', 'reel'),
    allowNull: false,
    defaultValue: 'image'
  },
  mediaUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'media_url'
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_url'
  },
  cloudinaryPublicId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'cloudinary_public_id'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count'
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'comments_count'
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  isPremiumContent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium_content'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  // Estado de publicación
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'published'
  },
  allowComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'allow_comments'
  },
  // Información específica del tatuaje
  style: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Estilo del tatuaje (tradicional, realista, etc.)'
  },
  bodyPart: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'body_part',
    comment: 'Parte del cuerpo donde está el tatuaje'
  },
  size: {
    type: DataTypes.ENUM('pequeño', 'mediano', 'grande'),
    allowNull: true,
    comment: 'Tamaño del tatuaje'
  },
  isColorTattoo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_color_tattoo',
    comment: 'Si el tatuaje es a color o en negro'
  },
  timeToComplete: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'time_to_complete',
    comment: 'Tiempo en horas que tomó completar'
  },
  healingTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'healing_time',
    comment: 'Tiempo de sanación en días'
  },
  difficulty: {
    type: DataTypes.ENUM('fácil', 'intermedio', 'avanzado', 'experto'),
    allowNull: true,
    comment: 'Nivel de dificultad del tatuaje'
  },
  clientAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'client_age',
    comment: 'Edad del cliente (opcional)'
  },
  // Conteo de guardados
  savesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'saves_count'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  }
}, {
  tableName: 'posts',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['style'] },
    { fields: ['published_at'] },
    { fields: ['is_public', 'status', 'published_at'] },
    { fields: ['user_id', 'is_public', 'status'] },
    { fields: ['style', 'body_part'] }
  ],
  hooks: {
    beforeCreate: (post) => {
      if (!post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
  }
});

// Métodos de instancia
Post.prototype.incrementViews = async function() {
  await this.increment('viewsCount');
};

Post.prototype.incrementLikes = async function() {
  await this.increment('likesCount');
};

Post.prototype.decrementLikes = async function() {
  await this.decrement('likesCount');
};

Post.prototype.incrementComments = async function() {
  await this.increment('commentsCount');
};

Post.prototype.decrementComments = async function() {
  await this.decrement('commentsCount');
};

module.exports = Post;
