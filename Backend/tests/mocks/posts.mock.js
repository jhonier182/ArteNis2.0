/**
 * Mocks de datos para tests
 */

const mockPost = (overrides = {}) => ({
  id: overrides.id || 'post-123',
  userId: overrides.userId || 'user-456',
  mediaUrl: overrides.mediaUrl || 'https://example.com/image.jpg',
  thumbnailUrl: overrides.thumbnailUrl || null,
  type: overrides.type || 'image',
  description: overrides.description || 'Test post description',
  title: overrides.title || 'Test Post',
  likesCount: overrides.likesCount || 10,
  commentsCount: overrides.commentsCount || 5,
  viewsCount: overrides.viewsCount || 100,
  isPublic: overrides.isPublic !== undefined ? overrides.isPublic : true,
  status: overrides.status || 'published',
  createdAt: overrides.createdAt || new Date('2025-01-15T10:00:00Z'),
  updatedAt: overrides.updatedAt || new Date('2025-01-15T10:00:00Z'),
  toJSON: function() {
    return {
      ...this,
      author: this.author || {
        id: this.userId,
        username: 'testuser',
        fullName: 'Test User',
        avatar: null,
        isVerified: false,
        userType: 'user'
      }
    };
  }
});

const mockUser = (overrides = {}) => ({
  id: overrides.id || 'user-456',
  username: overrides.username || 'testuser',
  fullName: overrides.fullName || 'Test User',
  avatar: overrides.avatar || null,
  isVerified: overrides.isVerified || false,
  userType: overrides.userType || 'user'
});

const mockFollow = (overrides = {}) => ({
  id: overrides.id || 'follow-123',
  followerId: overrides.followerId || 'user-123',
  followingId: overrides.followingId || 'user-456'
});

const mockLike = (overrides = {}) => ({
  id: overrides.id || 'like-123',
  userId: overrides.userId || 'user-123',
  postId: overrides.postId || 'post-123',
  type: overrides.type || 'like'
});

const generateMockPosts = (count, options = {}) => {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(Date.now() - i * 1000 * 60); // 1 minuto entre cada post
    return mockPost({
      id: `post-${i + 1}`,
      createdAt,
      ...options
    });
  });
};

module.exports = {
  mockPost,
  mockUser,
  mockFollow,
  mockLike,
  generateMockPosts
};

