const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  followerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'follower_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'following_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'follows',
  indexes: [
    {
      fields: ['follower_id', 'following_id'],
      unique: true
    }
  ],
  validate: {
    notSelfFollow() {
      if (this.followerId === this.followingId) {
        throw new Error('Un usuario no puede seguirse a sí mismo');
      }
    }
  }
});

// Métodos estáticos
Follow.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({
    where: {
      followerId,
      followingId
    }
  });
  return !!follow;
};

module.exports = Follow;
