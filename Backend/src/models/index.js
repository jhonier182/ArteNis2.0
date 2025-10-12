// Importar todos los modelos
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');
const Board = require('./Board');
const BoardPost = require('./BoardPost');
const BoardCollaborator = require('./BoardCollaborator');
const BoardFollow = require('./BoardFollow');
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

  User.hasMany(Board, {
    foreignKey: 'userId',
    as: 'boards',
    onDelete: 'CASCADE'
  });

  User.hasMany(BoardCollaborator, {
    foreignKey: 'userId',
    as: 'collaborations',
    onDelete: 'CASCADE'
  });

  User.hasMany(BoardFollow, {
    foreignKey: 'userId',
    as: 'boardFollows',
    onDelete: 'CASCADE'
  });

  User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Follow (seguir usuarios)
  User.hasMany(Follow, {
    foreignKey: 'followerId',
    as: 'following',
    onDelete: 'CASCADE'
  });

  User.hasMany(Follow, {
    foreignKey: 'followingId',
    as: 'followers',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Post
  Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author',
    onDelete: 'CASCADE'
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

  Post.hasMany(BoardPost, {
    foreignKey: 'postId',
    as: 'boardPosts',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Comment
  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author',
    onDelete: 'CASCADE'
  });

  Comment.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Like
  Like.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });

  Like.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Follow
  Follow.belongsTo(User, {
    foreignKey: 'followerId',
    as: 'follower',
    onDelete: 'CASCADE'
  });

  Follow.belongsTo(User, {
    foreignKey: 'followingId',
    as: 'following',
    onDelete: 'CASCADE'
  });

  // Asociaciones de Board
  Board.belongsTo(User, {
    foreignKey: 'userId',
    as: 'owner',
    onDelete: 'CASCADE'
  });

  Board.hasMany(BoardPost, {
    foreignKey: 'boardId',
    as: 'posts',
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

  // Asociaciones de BoardPost
  BoardPost.belongsTo(Board, {
    foreignKey: 'boardId',
    as: 'board',
    onDelete: 'CASCADE'
  });

  BoardPost.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
    onDelete: 'CASCADE'
  });

  BoardPost.belongsTo(User, {
    foreignKey: 'addedBy',
    as: 'addedByUser',
    onDelete: 'CASCADE'
  });

  // Asociaciones de BoardCollaborator
  BoardCollaborator.belongsTo(Board, {
    foreignKey: 'boardId',
    as: 'board',
    onDelete: 'CASCADE'
  });

  BoardCollaborator.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });

  // Asociaciones de BoardFollow
  BoardFollow.belongsTo(Board, {
    foreignKey: 'boardId',
    as: 'board',
    onDelete: 'CASCADE'
  });

  BoardFollow.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });

  // Asociaciones de RefreshToken
  RefreshToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

// Exportar modelos y función de configuración
module.exports = {
  User,
  Post,
  Comment,
  Like,
  Follow,
  Board,
  BoardPost,
  BoardCollaborator,
  BoardFollow,
  RefreshToken,
  setupAssociations
};