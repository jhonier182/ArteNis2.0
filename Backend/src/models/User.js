const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: {
        msg: 'El nombre de usuario solo puede contener letras y números'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'La contraseña debe tener al menos 6 caracteres'
      }
    }
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name',
    validate: {
      len: [2, 255]
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  cloudinaryPublicId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cloudinary_public_id'
  },
  userType: {
    type: DataTypes.ENUM('user', 'artist', 'admin'),
    allowNull: false,
    defaultValue: 'user',
    field: 'user_type'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  premiumExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'premium_expires_at'
  },
  // Información de ubicación detallada
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Colombia'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'followers_count'
  },
  followingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'following_count'
  },
  postsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'posts_count'
  },
  
  // Campos específicos para artistas
  specialties: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Especialidades del artista (estilos de tatuaje)'
  },
  portfolioImages: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'portfolio_images',
    comment: 'URLs de imágenes del portafolio'
  },
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'price_per_hour',
    comment: 'Precio por hora en COP'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    },
    comment: 'Calificación promedio del artista'
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'reviews_count',
    comment: 'Número de reseñas recibidas'
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Años de experiencia'
  },
  businessHours: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'business_hours',
    comment: 'Horarios de atención'
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'social_links',
    comment: 'Enlaces a redes sociales'
  },
  studioName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'studio_name',
    comment: 'Nombre del estudio de tatuajes'
  },
  studioAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'studio_address',
    comment: 'Dirección del estudio'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['username'], unique: true },
    { fields: ['user_type'] },
    { fields: ['latitude', 'longitude'] },
    { fields: ['user_type', 'is_active', 'rating'] },
    { fields: ['user_type', 'city'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Métodos de instancia
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const user = { ...this.get() };
  delete user.password;
  return user;
};

User.prototype.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  await this.save({ fields: ['lastLoginAt'] });
};

User.prototype.isPremiumActive = function() {
  if (!this.isPremium) return false;
  if (!this.premiumExpiresAt) return true;
  return new Date() < this.premiumExpiresAt;
};

// Métodos estáticos
User.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
};

module.exports = User;
