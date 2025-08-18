const { Post } = require('../models');

// Middleware para trackear visualizaciones de posts
const trackPostView = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id || null;

    if (postId && userId) {
      // Incrementar visualización de forma asíncrona (no bloquear la respuesta)
      setImmediate(async () => {
        try {
          const post = await Post.findByPk(postId);
          if (post && post.userId !== userId) {
            // Solo incrementar si el usuario NO es el creador del post
            await post.incrementViews();
          }
        } catch (error) {
          console.error('Error tracking post view:', error);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error in view tracking middleware:', error);
    next(); // No fallar si hay error en tracking
  }
};

// Middleware para trackear visualizaciones del feed
const trackFeedViews = async (req, res, next) => {
  try {
    const { postIds } = req.body; // Array de IDs de posts vistos
    const userId = req.user?.id || null;

    if (postIds && Array.isArray(postIds) && postIds.length > 0 && userId) {
      // Incrementar visualizaciones de forma asíncrona
      setImmediate(async () => {
        try {
          for (const postId of postIds) {
            const post = await Post.findByPk(postId);
            if (post && post.userId !== userId) {
              // Solo incrementar si el usuario NO es el creador del post
              await post.incrementViews();
            }
          }
        } catch (error) {
          console.error('Error tracking feed views:', error);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error in feed view tracking middleware:', error);
    next();
  }
};

module.exports = {
  trackPostView,
  trackFeedViews
};
