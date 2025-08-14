const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quote = sequelize.define('Quote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'client_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  artistId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'artist_id',
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
    },
    comment: 'Post de referencia si existe'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [5, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000]
    }
  },
  tattooStyle: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tattoo_style'
  },
  bodyPart: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'body_part'
  },
  size: {
    type: DataTypes.ENUM('pequeño', 'mediano', 'grande', 'extra_grande'),
    allowNull: false
  },
  isColor: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_color'
  },
  referenceImages: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'reference_images',
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Las imágenes de referencia deben ser un array');
        }
        if (value.length > 10) {
          throw new Error('Máximo 10 imágenes de referencia');
        }
      }
    }
  },
  preferredDates: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'preferred_dates',
    comment: 'Fechas preferidas del cliente'
  },
  urgency: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
    allowNull: false,
    defaultValue: 'media'
  },
  budget: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Rango de presupuesto del cliente {min, max, currency}'
  },
  
  // Respuesta del artista
  status: {
    type: DataTypes.ENUM(
      'pending',      // Pendiente de respuesta
      'reviewing',    // En revisión por el artista
      'quoted',       // Cotización enviada
      'accepted',     // Aceptada por el cliente
      'rejected',     // Rechazada por el cliente
      'counter_offer', // Contraoferta del cliente
      'expired',      // Expirada
      'cancelled'     // Cancelada
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  artistResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'artist_response'
  },
  estimatedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'estimated_price',
    comment: 'Precio estimado en COP'
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    field: 'estimated_hours'
  },
  estimatedSessions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_sessions',
    defaultValue: 1
  },
  
  // Detalles adicionales de la cotización
  includesConsultation: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'includes_consultation'
  },
  includesDesign: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'includes_design'
  },
  includesRetouches: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'includes_retouches'
  },
  
  // Fechas importantes
  quotedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'quoted_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'accepted_at'
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'rejected_at'
  },
  
  // Notas internas
  artistNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'artist_notes',
    comment: 'Notas privadas del artista'
  },
  clientNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'client_notes',
    comment: 'Notas adicionales del cliente'
  },
  
  // Metadata
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Prioridad para el artista (0=normal, 1=alta, 2=urgente)'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
    comment: 'Si la cotización puede ser vista por otros'
  }
}, {
  tableName: 'quotes',
  indexes: [
    {
      fields: ['client_id']
    },
    {
      fields: ['artist_id']
    },
    {
      fields: ['post_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['urgency']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['artist_id', 'status']
    },
    {
      fields: ['client_id', 'status']
    },
    {
      fields: ['status', 'expires_at']
    }
  ],
  hooks: {
    beforeCreate: (quote) => {
      // Si no hay fecha de expiración, establecer 7 días por defecto
      if (!quote.expiresAt) {
        quote.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
    },
    beforeUpdate: (quote) => {
      // Actualizar fechas según el cambio de estado
      if (quote.changed('status')) {
        const now = new Date();
        switch (quote.status) {
          case 'quoted':
            quote.quotedAt = now;
            break;
          case 'accepted':
            quote.acceptedAt = now;
            break;
          case 'rejected':
            quote.rejectedAt = now;
            break;
        }
      }
    }
  }
});

// Métodos de instancia
Quote.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

Quote.prototype.canBeAccepted = function() {
  return ['quoted', 'counter_offer'].includes(this.status) && !this.isExpired();
};

Quote.prototype.canBeRejected = function() {
  return ['quoted', 'counter_offer'].includes(this.status) && !this.isExpired();
};

Quote.prototype.expire = async function() {
  if (this.status === 'quoted' && this.isExpired()) {
    await this.update({ status: 'expired' });
  }
};

// Métodos estáticos
Quote.findByArtist = function(artistId, options = {}) {
  return this.findAll({
    where: {
      artistId,
      ...options.where
    },
    order: [
      ['priority', 'DESC'],
      ['createdAt', 'DESC']
    ],
    ...options
  });
};

Quote.findByClient = function(clientId, options = {}) {
  return this.findAll({
    where: {
      clientId,
      ...options.where
    },
    order: [['createdAt', 'DESC']],
    ...options
  });
};

Quote.findPending = function(artistId, options = {}) {
  return this.findAll({
    where: {
      artistId,
      status: ['pending', 'reviewing'],
      ...options.where
    },
    order: [
      ['priority', 'DESC'],
      ['createdAt', 'ASC']
    ],
    ...options
  });
};

Quote.findExpired = function(options = {}) {
  return this.findAll({
    where: {
      status: 'quoted',
      expiresAt: {
        [require('sequelize').Op.lt]: new Date()
      },
      ...options.where
    },
    ...options
  });
};

module.exports = Quote;
