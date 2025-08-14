const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BoardCollaborator = sequelize.define('BoardCollaborator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  boardId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'board_id',
    references: {
      model: 'boards',
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
  invitedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'invited_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('collaborator', 'moderator'),
    allowNull: false,
    defaultValue: 'collaborator'
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      canAddPosts: true,
      canRemovePosts: false,
      canEditBoard: false,
      canInviteOthers: false,
      canModerate: false
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'accepted_at'
  },
  invitationMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'invitation_message'
  }
}, {
  tableName: 'board_collaborators',
  indexes: [
    {
      fields: ['board_id', 'user_id'],
      unique: true
    },
    {
      fields: ['board_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['invited_by']
    },
    {
      fields: ['status']
    }
  ]
});

// Métodos de instancia
BoardCollaborator.prototype.accept = async function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  await this.save();
};

BoardCollaborator.prototype.decline = async function() {
  this.status = 'declined';
  await this.save();
};

// Métodos estáticos
BoardCollaborator.findByBoard = function(boardId, options = {}) {
  return this.findAll({
    where: {
      boardId,
      status: 'accepted',
      ...options.where
    },
    ...options
  });
};

BoardCollaborator.findPendingInvitations = function(userId, options = {}) {
  return this.findAll({
    where: {
      userId,
      status: 'pending',
      ...options.where
    },
    ...options
  });
};

module.exports = BoardCollaborator;
