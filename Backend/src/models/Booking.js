const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
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
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  style: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bodyPart: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'body_part'
  },
  size: {
    type: DataTypes.ENUM('small', 'medium', 'large', 'xl'),
    allowNull: false,
    defaultValue: 'medium'
  },
  estimatedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'estimated_price'
  },
  finalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'final_price'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_date'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'quoted',
      'accepted',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'rejected'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'deposit_amount'
  },
  depositPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'deposit_paid'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'completed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status'
  },
  clientNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'client_notes'
  },
  artistNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'artist_notes'
  }
}, {
  tableName: 'bookings',
  indexes: [
    { fields: ['client_id'] },
    { fields: ['artist_id'] },
    { fields: ['status'] },
    { fields: ['scheduled_date'] }
  ]
});

// Métodos de instancia
Booking.prototype.canBeModified = function() {
  return ['pending', 'quoted', 'accepted'].includes(this.status);
};

Booking.prototype.canBeCancelled = function() {
  return ['pending', 'quoted', 'accepted', 'confirmed'].includes(this.status);
};

module.exports = Booking;
