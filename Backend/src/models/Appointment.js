const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appointment = sequelize.define('Appointment', {
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
  quoteId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'quote_id',
    references: {
      model: 'quotes',
      key: 'id'
    }
  },
  
  // Información básica de la cita
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [5, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(
      'consultation',    // Consulta
      'design_session',  // Sesión de diseño
      'tattoo_session',  // Sesión de tatuaje
      'retouch',        // Retoque
      'removal_consultation' // Consulta de remoción
    ),
    allowNull: false,
    defaultValue: 'tattoo_session'
  },
  
  // Fecha y hora
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'scheduled_date'
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'scheduled_time'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'estimated_duration',
    comment: 'Duración estimada en minutos'
  },
  actualStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_start_time'
  },
  actualEndTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'actual_end_time'
  },
  
  // Estado de la cita
  status: {
    type: DataTypes.ENUM(
      'scheduled',      // Programada
      'confirmed',      // Confirmada
      'in_progress',    // En progreso
      'completed',      // Completada
      'cancelled',      // Cancelada
      'no_show',        // No se presentó
      'rescheduled'     // Reprogramada
    ),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  
  // Información del tatuaje
  tattooDetails: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'tattoo_details',
    comment: 'Detalles específicos del tatuaje a realizar'
  },
  bodyPart: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'body_part'
  },
  size: {
    type: DataTypes.ENUM('pequeño', 'mediano', 'grande', 'extra_grande'),
    allowNull: true
  },
  isColor: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_color'
  },
  
  // Información de ubicación
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dirección del estudio o ubicación de la cita'
  },
  
  // Información financiera
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_price'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'deposit_amount'
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'remaining_amount'
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      'pending',        // Pendiente
      'deposit_paid',   // Depósito pagado
      'partially_paid', // Parcialmente pagado
      'paid',          // Pagado completamente
      'refunded'       // Reembolsado
    ),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status'
  },
  
  // Recordatorios y notificaciones
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'reminder_sent'
  },
  reminderSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reminder_sent_at'
  },
  
  // Notas y comentarios
  artistNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'artist_notes'
  },
  clientNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'client_notes'
  },
  privateNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'private_notes',
    comment: 'Notas privadas del artista'
  },
  
  // Preparación y aftercare
  preparationInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'preparation_instructions'
  },
  aftercareInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'aftercare_instructions'
  },
  
  // Fechas importantes
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'confirmed_at'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at'
  },
  cancelledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'cancelled_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  },
  rescheduledFrom: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'rescheduled_from',
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  
  // Metadata
  sessionNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'session_number',
    comment: 'Número de sesión si es un tatuaje de múltiples sesiones'
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'total_sessions'
  },
  isFollowUp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_follow_up'
  }
}, {
  tableName: 'appointments',
  indexes: [
    {
      fields: ['client_id']
    },
    {
      fields: ['artist_id']
    },
    {
      fields: ['quote_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['scheduled_time']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['artist_id', 'scheduled_date']
    },
    {
      fields: ['client_id', 'status']
    },
    {
      fields: ['artist_id', 'status']
    },
    {
      fields: ['scheduled_date', 'scheduled_time']
    },
    {
      fields: ['status', 'scheduled_date']
    }
  ],
  hooks: {
    beforeUpdate: (appointment) => {
      if (appointment.changed('status')) {
        const now = new Date();
        switch (appointment.status) {
          case 'confirmed':
            appointment.confirmedAt = now;
            break;
          case 'cancelled':
            appointment.cancelledAt = now;
            break;
        }
      }
      
      // Calcular monto restante
      if (appointment.changed('totalPrice') || appointment.changed('depositAmount')) {
        const total = parseFloat(appointment.totalPrice) || 0;
        const deposit = parseFloat(appointment.depositAmount) || 0;
        appointment.remainingAmount = total - deposit;
      }
    }
  }
});

// Métodos de instancia
Appointment.prototype.canBeCancelled = function() {
  return ['scheduled', 'confirmed'].includes(this.status);
};

Appointment.prototype.canBeRescheduled = function() {
  return ['scheduled', 'confirmed'].includes(this.status);
};

Appointment.prototype.isUpcoming = function() {
  const appointmentDateTime = new Date(`${this.scheduledDate} ${this.scheduledTime}`);
  return appointmentDateTime > new Date();
};

Appointment.prototype.isPast = function() {
  const appointmentDateTime = new Date(`${this.scheduledDate} ${this.scheduledTime}`);
  return appointmentDateTime < new Date();
};

Appointment.prototype.needsReminder = function() {
  if (this.reminderSent || !this.isUpcoming()) return false;
  
  const appointmentDateTime = new Date(`${this.scheduledDate} ${this.scheduledTime}`);
  const now = new Date();
  const timeDiff = appointmentDateTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  // Enviar recordatorio 24 horas antes
  return hoursUntilAppointment <= 24 && hoursUntilAppointment > 0;
};

Appointment.prototype.markReminderSent = async function() {
  await this.update({
    reminderSent: true,
    reminderSentAt: new Date()
  });
};

// Métodos estáticos
Appointment.findByArtist = function(artistId, options = {}) {
  return this.findAll({
    where: {
      artistId,
      ...options.where
    },
    order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']],
    ...options
  });
};

Appointment.findByClient = function(clientId, options = {}) {
  return this.findAll({
    where: {
      clientId,
      ...options.where
    },
    order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']],
    ...options
  });
};

Appointment.findUpcoming = function(artistId, options = {}) {
  const today = new Date().toISOString().split('T')[0];
  return this.findAll({
    where: {
      artistId,
      scheduledDate: {
        [require('sequelize').Op.gte]: today
      },
      status: ['scheduled', 'confirmed'],
      ...options.where
    },
    order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']],
    ...options
  });
};

Appointment.findByDateRange = function(artistId, startDate, endDate, options = {}) {
  return this.findAll({
    where: {
      artistId,
      scheduledDate: {
        [require('sequelize').Op.between]: [startDate, endDate]
      },
      ...options.where
    },
    order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']],
    ...options
  });
};

Appointment.findNeedingReminders = function(options = {}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  return this.findAll({
    where: {
      scheduledDate: tomorrowStr,
      status: ['scheduled', 'confirmed'],
      reminderSent: false,
      ...options.where
    },
    ...options
  });
};

module.exports = Appointment;
