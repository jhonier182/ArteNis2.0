// Importar todos los modelos
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');
const Booking = require('./Booking');
const Board = require('./Board');
const BoardPost = require('./BoardPost');
const BoardCollaborator = require('./BoardCollaborator');
const BoardFollow = require('./BoardFollow');
const Quote = require('./Quote');
const Appointment = require('./Appointment');
const Availability = require('./Availability');
const RefreshToken = require('./RefreshToken');

// Establecer asociaciones entre modelos
const setupAssociations = () => {
  // Asociaciones de User
  User.hasMany(Post, {
    foreignKey: 'userId',
    as: 'posts',
    onDelete: 'CASCADE'
  });

  User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comments',
    onDelete: 'CASCADE'
  });

  User.hasMany(Like, {
    foreignKey: 'userId',
    as: 'likes',
    onDelete: 'CASCADE'
  });

  User.hasMany(Booking, {
    foreignKey: 'clientId',
    as: 'clientBookings',
    onDelete: 'CASCADE'
  });

  User.hasMany(Booking, {
    foreignKey: 'artistId',
    as: 'artistBookings',
    onDelete: 'CASCADE'
  });

  User.hasMany(Board, {
    foreignKey: 'userId',
    as: 'boards',
    onDelete: 'CASCADE'
  });

  User.hasMany(BoardCollaborator, {
    foreignKey: 'userId',
    as: 'boardCollaborations',
    onDelete: 'CASCADE'
  });

  User.hasMany(BoardFollow, {
    foreignKey: 'userId',
    as: 'boardFollows',
    onDelete: 'CASCADE'
  });

  User.hasMany(Quote, {
    foreignKey: 'clientId',
    as: 'sentQuotes',
    onDelete: 'CASCADE'
  });

  User.hasMany(Quote, {
    foreignKey: 'artistId',
    as: 'receivedQuotes',
    onDelete: 'CASCADE'
  });

  User.hasMany(Appointment, {
    foreignKey: 'clientId',
    as: 'clientAppointments',
    onDelete: 'CASCADE'
  });

  User.hasMany(Appointment, {
    foreignKey: 'artistId',
    as: 'artistAppointments',
    onDelete: 'CASCADE'
  });

  User.hasMany(Availability, {
    foreignKey: 'artistId',
    as: 'availability',
    onDelete: 'CASCADE'
  });

  // Relaciones de seguimiento
  User.belongsToMany(User, {
    through: Follow,
    as: 'followers',
    foreignKey: 'followingId',
    otherKey: 'followerId'
  });

  User.belongsToMany(User, {
    through: Follow,
    as: 'following',
    foreignKey: 'followerId',
    otherKey: 'followingId'
  });

  // Asociaciones de Post
  Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author'
  });

  Post.hasMany(Comment, {
    foreignKey: 'postId',
    as: 'comments',
    onDelete: 'CASCADE'
  });

  Post.hasMany(Like, {
    foreignKey: 'postId',
    as: 'likes',
    onDelete: 'CASCADE'
  });

  Post.hasMany(Booking, {
    foreignKey: 'postId',
    as: 'bookings',
    onDelete: 'SET NULL'
  });

  // Asociaciones de Comment
  Comment.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post'
  });

  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author'
  });

  Comment.belongsTo(Comment, {
    foreignKey: 'parentId',
    as: 'parent'
  });

  Comment.hasMany(Comment, {
    foreignKey: 'parentId',
    as: 'replies',
    onDelete: 'CASCADE'
  });

  Comment.hasMany(Like, {
    foreignKey: 'commentId',
    as: 'likes',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Like
  Like.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  Like.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post'
  });

  Like.belongsTo(Comment, {
    foreignKey: 'commentId',
    as: 'comment'
  });

  // Asociaciones de Follow
  Follow.belongsTo(User, {
    foreignKey: 'followerId',
    as: 'follower'
  });

  Follow.belongsTo(User, {
    foreignKey: 'followingId',
    as: 'following'
  });

  // Asociaciones de Booking
  Booking.belongsTo(User, {
    foreignKey: 'clientId',
    as: 'client'
  });

  Booking.belongsTo(User, {
    foreignKey: 'artistId',
    as: 'artist'
  });

  Booking.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'referencePost'
  });

  // Asociaciones de Board
  Board.belongsTo(User, {
    foreignKey: 'userId',
    as: 'owner'
  });

  Board.hasMany(BoardPost, {
    foreignKey: 'boardId',
    as: 'boardPosts',
    onDelete: 'CASCADE'
  });

  Board.hasMany(BoardCollaborator, {
    foreignKey: 'boardId',
    as: 'collaborators',
    onDelete: 'CASCADE'
  });

  Board.hasMany(BoardFollow, {
    foreignKey: 'boardId',
    as: 'followers',
    onDelete: 'CASCADE'
  });

  // Relación many-to-many para posts en tableros
  Post.belongsToMany(Board, {
    through: BoardPost,
    as: 'boards',
    foreignKey: 'postId',
    otherKey: 'boardId'
  });

  Board.belongsToMany(Post, {
    through: BoardPost,
    as: 'posts',
    foreignKey: 'boardId',
    otherKey: 'postId'
  });

  // Asociaciones de BoardPost
  BoardPost.belongsTo(Board, {
    foreignKey: 'boardId',
    as: 'board'
  });

  BoardPost.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post'
  });

  BoardPost.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'addedByUser'
  });

  // Asociaciones de BoardCollaborator
  BoardCollaborator.belongsTo(Board, {
    foreignKey: 'boardId',
    as: 'board'
  });

  BoardCollaborator.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  BoardCollaborator.belongsTo(User, {
    foreignKey: 'invitedBy',
    as: 'inviter'
  });

  // Asociaciones de BoardFollow
  BoardFollow.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  BoardFollow.belongsTo(Board, {
    foreignKey: 'boardId',
    as: 'board'
  });

  // Asociaciones de Quote
  Quote.belongsTo(User, {
    foreignKey: 'clientId',
    as: 'client'
  });

  Quote.belongsTo(User, {
    foreignKey: 'artistId',
    as: 'artist'
  });

  Quote.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'referencePost'
  });

  Quote.hasOne(Appointment, {
    foreignKey: 'quoteId',
    as: 'appointment',
    onDelete: 'SET NULL'
  });

  // Asociaciones de Appointment
  Appointment.belongsTo(User, {
    foreignKey: 'clientId',
    as: 'client'
  });

  Appointment.belongsTo(User, {
    foreignKey: 'artistId',
    as: 'artist'
  });

  Appointment.belongsTo(Quote, {
    foreignKey: 'quoteId',
    as: 'quote'
  });

  Appointment.belongsTo(User, {
    foreignKey: 'cancelledBy',
    as: 'cancelledByUser'
  });

  Appointment.belongsTo(Appointment, {
    foreignKey: 'rescheduledFrom',
    as: 'originalAppointment'
  });

  Appointment.hasMany(Appointment, {
    foreignKey: 'rescheduledFrom',
    as: 'rescheduledAppointments',
    onDelete: 'SET NULL'
  });

  // Asociaciones de Availability
  Availability.belongsTo(User, {
    foreignKey: 'artistId',
    as: 'artist'
  });

  // Refresh tokens
  RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });

  console.log('✅ Asociaciones de modelos establecidas correctamente');
};

module.exports = {
  User,
  Post,
  Comment,
  Like,
  Follow,
  Booking,
  Board,
  BoardPost,
  BoardCollaborator,
  BoardFollow,
  Quote,
  Appointment,
  Availability,
  RefreshToken,
  setupAssociations
};
