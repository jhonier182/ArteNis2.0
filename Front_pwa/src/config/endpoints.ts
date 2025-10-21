// Endpoints de la API
import { API_CONFIG } from './constants';

// Base URL de la API
const BASE_URL = API_CONFIG.BASE_URL;

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,
  REFRESH: `${BASE_URL}/api/auth/refresh`,
  ME: `${BASE_URL}/api/auth/me`,
  PROFILE: `${BASE_URL}/api/auth/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/api/auth/change-password`,
  FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,
  VERIFY_EMAIL: `${BASE_URL}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${BASE_URL}/api/auth/resend-verification`,
  DELETE_ACCOUNT: `${BASE_URL}/api/auth/account`,
  SESSIONS: `${BASE_URL}/api/auth/sessions`,
  LOGOUT_OTHERS: `${BASE_URL}/api/auth/logout-others`
} as const;

// Endpoints de usuarios
export const USER_ENDPOINTS = {
  GET_BY_ID: (id: string) => `${BASE_URL}/api/users/${id}`,
  GET_BY_USERNAME: (username: string) => `${BASE_URL}/api/users/username/${username}`,
  UPDATE_PROFILE: `${BASE_URL}/api/users/profile`,
  FOLLOW: (id: string) => `${BASE_URL}/api/users/${id}/follow`,
  UNFOLLOW: (id: string) => `${BASE_URL}/api/users/${id}/follow`,
  TOGGLE_FOLLOW: (id: string) => `${BASE_URL}/api/users/${id}/toggle-follow`,
  FOLLOWERS: (id: string) => `${BASE_URL}/api/users/${id}/followers`,
  FOLLOWING: (id: string) => `${BASE_URL}/api/users/${id}/following`,
  SEARCH: `${BASE_URL}/api/users/search`,
  SUGGESTED: `${BASE_URL}/api/users/suggested`,
  POPULAR: `${BASE_URL}/api/users/popular`,
  REPORT: (id: string) => `${BASE_URL}/api/users/${id}/report`,
  BLOCK: (id: string) => `${BASE_URL}/api/users/${id}/block`,
  UNBLOCK: (id: string) => `${BASE_URL}/api/users/${id}/block`,
  BLOCKED: `${BASE_URL}/api/users/blocked`,
  IS_FOLLOWING: (id: string) => `${BASE_URL}/api/users/${id}/is-following`,
  STATS: (id: string) => `${BASE_URL}/api/users/${id}/stats`
} as const;

// Endpoints de posts
export const POST_ENDPOINTS = {
  FEED: `${BASE_URL}/api/posts/feed`,
  FOLLOWING: `${BASE_URL}/api/posts/following`,
  GET_BY_ID: (id: string) => `${BASE_URL}/api/posts/${id}`,
  CREATE: `${BASE_URL}/api/posts`,
  UPDATE: (id: string) => `${BASE_URL}/api/posts/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/posts/${id}`,
  LIKE: (id: string) => `${BASE_URL}/api/posts/${id}/like`,
  LIKES_INFO: (id: string) => `${BASE_URL}/api/posts/${id}/likes`,
  SAVE: (id: string) => `${BASE_URL}/api/posts/${id}/save`,
  SAVED: `${BASE_URL}/api/posts/saved`,
  USER_POSTS: (id: string) => `${BASE_URL}/api/posts/user/${id}`,
  SEARCH: `${BASE_URL}/api/posts/search`,
  POPULAR: `${BASE_URL}/api/posts/popular`,
  BY_TAG: (tag: string) => `${BASE_URL}/api/posts/tag/${tag}`,
  POPULAR_TAGS: `${BASE_URL}/api/posts/tags/popular`
} as const;

// Endpoints de comentarios
export const COMMENT_ENDPOINTS = {
  GET_BY_POST: (postId: string) => `${BASE_URL}/api/posts/${postId}/comments`,
  CREATE: (postId: string) => `${BASE_URL}/api/posts/${postId}/comments`,
  UPDATE: (postId: string, commentId: string) => `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
  DELETE: (postId: string, commentId: string) => `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
  LIKE: (postId: string, commentId: string) => `${BASE_URL}/api/posts/${postId}/comments/${commentId}/like`
} as const;

// Endpoints de boards/colecciones
export const BOARD_ENDPOINTS = {
  GET_ALL: `${BASE_URL}/api/boards`,
  GET_BY_ID: (id: string) => `${BASE_URL}/api/boards/${id}`,
  CREATE: `${BASE_URL}/api/boards`,
  UPDATE: (id: string) => `${BASE_URL}/api/boards/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/boards/${id}`,
  FOLLOW: (id: string) => `${BASE_URL}/api/boards/${id}/follow`,
  UNFOLLOW: (id: string) => `${BASE_URL}/api/boards/${id}/follow`,
  POSTS: (id: string) => `${BASE_URL}/api/boards/${id}/posts`,
  ADD_POST: (id: string) => `${BASE_URL}/api/boards/${id}/posts`,
  REMOVE_POST: (id: string, postId: string) => `${BASE_URL}/api/boards/${id}/posts/${postId}`,
  COLLABORATORS: (id: string) => `${BASE_URL}/api/boards/${id}/collaborators`,
  ADD_COLLABORATOR: (id: string) => `${BASE_URL}/api/boards/${id}/collaborators`,
  REMOVE_COLLABORATOR: (id: string, userId: string) => `${BASE_URL}/api/boards/${id}/collaborators/${userId}`
} as const;

// Endpoints de búsqueda
export const SEARCH_ENDPOINTS = {
  POSTS: `${BASE_URL}/api/search/posts`,
  USERS: `${BASE_URL}/api/search/users`,
  BOARDS: `${BASE_URL}/api/search/boards`,
  TAGS: `${BASE_URL}/api/search/tags`,
  GLOBAL: `${BASE_URL}/api/search/global`
} as const;

// Endpoints de notificaciones
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: `${BASE_URL}/api/notifications`,
  GET_BY_ID: (id: string) => `${BASE_URL}/api/notifications/${id}`,
  MARK_AS_READ: (id: string) => `${BASE_URL}/api/notifications/${id}/read`,
  MARK_ALL_READ: `${BASE_URL}/api/notifications/read-all`,
  DELETE: (id: string) => `${BASE_URL}/api/notifications/${id}`,
  DELETE_ALL: `${BASE_URL}/api/notifications`,
  SETTINGS: `${BASE_URL}/api/notifications/settings`,
  SUBSCRIBE: `${BASE_URL}/api/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/api/notifications/unsubscribe`
} as const;

// Endpoints de archivos/media
export const MEDIA_ENDPOINTS = {
  UPLOAD: `${BASE_URL}/api/media/upload`,
  UPLOAD_MULTIPLE: `${BASE_URL}/api/media/upload-multiple`,
  DELETE: (id: string) => `${BASE_URL}/api/media/${id}`,
  GET_BY_ID: (id: string) => `${BASE_URL}/api/media/${id}`,
  GET_BY_USER: `${BASE_URL}/api/media/user`
} as const;

// Endpoints de analytics
export const ANALYTICS_ENDPOINTS = {
  POST_ANALYTICS: (id: string) => `${BASE_URL}/api/analytics/posts/${id}`,
  USER_ANALYTICS: `${BASE_URL}/api/analytics/user`,
  GLOBAL_ANALYTICS: `${BASE_URL}/api/analytics/global`
} as const;

// Endpoints de configuración
export const SETTINGS_ENDPOINTS = {
  GET: `${BASE_URL}/api/settings`,
  UPDATE: `${BASE_URL}/api/settings`,
  PRIVACY: `${BASE_URL}/api/settings/privacy`,
  NOTIFICATIONS: `${BASE_URL}/api/settings/notifications`,
  APPEARANCE: `${BASE_URL}/api/settings/appearance`,
  SECURITY: `${BASE_URL}/api/settings/security`
} as const;

// Endpoints de salud del sistema
export const HEALTH_ENDPOINTS = {
  STATUS: `${BASE_URL}/api/health/status`,
  METRICS: `${BASE_URL}/api/health/metrics`,
  READY: `${BASE_URL}/api/health/ready`,
  LIVE: `${BASE_URL}/api/health/live`
} as const;

// Función helper para construir URLs con parámetros
export const buildUrl = (baseUrl: string, params?: Record<string, string | number | boolean>): string => {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
};

// Función helper para construir URLs con path parameters
export const buildPathUrl = (template: string, params: Record<string, string | number>): string => {
  let url = template;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`[${key}]`, String(value));
  });
  return url;
};

// Exportar todos los endpoints
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  POST: POST_ENDPOINTS,
  COMMENT: COMMENT_ENDPOINTS,
  BOARD: BOARD_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  MEDIA: MEDIA_ENDPOINTS,
  ANALYTICS: ANALYTICS_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  HEALTH: HEALTH_ENDPOINTS
} as const;

export default ENDPOINTS;
