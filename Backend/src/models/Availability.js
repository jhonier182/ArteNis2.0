const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  
  // Tipo de disponibilidad
  type: {
    type: DataTypes.ENUM(
      'regular',        // Horario regular semanal
      'specific_date',  // Fecha específica
      'blocked',        // Bloqueo de tiempo
      'vacation'        // Vacaciones
    ),
    allowNull: false,
    defaultValue: 'regular'
  },
  
  // Para horarios regulares
  dayOfWeek: {
    type: DataTypes.ENUM(
      'monday', 'tuesday', 'wednesday', 'thursday', 
      'friday', 'saturday', 'sunday'
    ),
    allowNull: true,
    field: 'day_of_week',
    comment: 'Para horarios regulares semanales'
  },
  
  // Para fechas específicas
  specificDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'specific_date'
  },
  
  // Horarios
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'end_time'
  },
  
  // Para bloqueos y vacaciones
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  
  // Estado
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_available'
  },
  
  // Configuración
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    field: 'slot_duration',
    comment: 'Duración de cada slot en minutos'
  },
  bufferTime: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    field: 'buffer_time',
    comment: 'Tiempo de buffer entre citas en minutos'
  },
  maxAdvanceBooking: {
    type: DataTypes.INTEGER,
    defaultValue: 90,
    field: 'max_advance_booking',
    comment: 'Días máximos de anticipación para reservar'
  },
  minAdvanceBooking: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'min_advance_booking',
    comment: 'Días mínimos de anticipación para reservar'
  },
  
  // Notas
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Título para bloqueos o eventos especiales'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre la disponibilidad'
  },
  
  // Recurrencia
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_recurring'
  },
  recurringPattern: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'recurring_pattern',
    comment: 'Patrón de recurrencia para eventos'
  },
  
  // Control de activo/inactivo
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'availability',
  indexes: [
    {
      fields: ['artist_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['day_of_week']
    },
    {
      fields: ['specific_date']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['is_available']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['artist_id', 'type', 'is_active']
    },
    {
      fields: ['artist_id', 'specific_date']
    },
    {
      fields: ['artist_id', 'day_of_week', 'is_active']
    }
  ],
  validate: {
    // Validaciones personalizadas
    timeRangeValid() {
      if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        throw new Error('La hora de inicio debe ser anterior a la hora de fin');
      }
    },
    dateRangeValid() {
      if (this.startDate && this.endDate && this.startDate > this.endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    },
    typeRequirements() {
      if (this.type === 'regular' && !this.dayOfWeek) {
        throw new Error('Los horarios regulares requieren especificar el día de la semana');
      }
      if (this.type === 'specific_date' && !this.specificDate) {
        throw new Error('Las fechas específicas requieren especificar la fecha');
      }
      if ((this.type === 'blocked' || this.type === 'vacation') && (!this.startDate || !this.endDate)) {
        throw new Error('Los bloqueos y vacaciones requieren fecha de inicio y fin');
      }
    }
  }
});

// Métodos de instancia
Availability.prototype.isWithinRange = function(date) {
  if (this.type === 'specific_date') {
    return this.specificDate === date;
  }
  
  if (this.type === 'blocked' || this.type === 'vacation') {
    return date >= this.startDate && date <= this.endDate;
  }
  
  return false;
};

Availability.prototype.getTimeSlots = function(date) {
  if (!this.isAvailable || !this.startTime || !this.endTime) {
    return [];
  }
  
  const slots = [];
  const startTime = new Date(`${date} ${this.startTime}`);
  const endTime = new Date(`${date} ${this.endTime}`);
  const slotDuration = this.slotDuration * 60 * 1000; // Convert to milliseconds
  const bufferTime = this.bufferTime * 60 * 1000;
  
  let currentTime = startTime;
  
  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration);
    if (slotEnd <= endTime) {
      slots.push({
        start: currentTime.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5),
        duration: this.slotDuration
      });
    }
    currentTime = new Date(currentTime.getTime() + slotDuration + bufferTime);
  }
  
  return slots;
};

// Métodos estáticos
Availability.getRegularSchedule = function(artistId, options = {}) {
  return this.findAll({
    where: {
      artistId,
      type: 'regular',
      isActive: true,
      ...options.where
    },
    order: [
      [sequelize.fn('FIELD', sequelize.col('day_of_week'), 
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')],
      ['start_time', 'ASC']
    ],
    ...options
  });
};

Availability.getAvailabilityForDate = function(artistId, date, options = {}) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  return this.findAll({
    where: {
      artistId,
      isActive: true,
      [require('sequelize').Op.or]: [
        {
          type: 'regular',
          dayOfWeek: dayOfWeek,
          isAvailable: true
        },
        {
          type: 'specific_date',
          specificDate: date
        },
        {
          type: ['blocked', 'vacation'],
          startDate: { [require('sequelize').Op.lte]: date },
          endDate: { [require('sequelize').Op.gte]: date }
        }
      ],
      ...options.where
    },
    order: [['start_time', 'ASC']],
    ...options
  });
};

Availability.getBlockedDates = function(artistId, startDate, endDate, options = {}) {
  return this.findAll({
    where: {
      artistId,
      type: ['blocked', 'vacation'],
      isActive: true,
      [require('sequelize').Op.or]: [
        {
          startDate: { [require('sequelize').Op.between]: [startDate, endDate] }
        },
        {
          endDate: { [require('sequelize').Op.between]: [startDate, endDate] }
        },
        {
          startDate: { [require('sequelize').Op.lte]: startDate },
          endDate: { [require('sequelize').Op.gte]: endDate }
        }
      ],
      ...options.where
    },
    ...options
  });
};

Availability.isArtistAvailable = async function(artistId, date, startTime, duration) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  // Verificar si hay disponibilidad regular para ese día
  const regularAvailability = await this.findOne({
    where: {
      artistId,
      type: 'regular',
      dayOfWeek: dayOfWeek,
      isAvailable: true,
      isActive: true
    }
  });
  
  if (!regularAvailability) return false;
  
  // Verificar si la hora está dentro del rango disponible
  if (startTime < regularAvailability.startTime || startTime > regularAvailability.endTime) {
    return false;
  }
  
  // Verificar si no hay bloqueos para esa fecha
  const blocks = await this.findAll({
    where: {
      artistId,
      type: ['blocked', 'vacation'],
      isActive: true,
      startDate: { [require('sequelize').Op.lte]: date },
      endDate: { [require('sequelize').Op.gte]: date }
    }
  });
  
  return blocks.length === 0;
};

module.exports = Availability;
