// Constantes globales de la aplicación

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'ArteNis 2.0',
  VERSION: '2.0.0',
  DESCRIPTION: 'Red social para artistas, creadores y amantes del arte',
  AUTHOR: 'ArteNis Team',
  SUPPORT_EMAIL: 'support@artenis.com',
  WEBSITE: 'https://artenis.com'
} as const;

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.2:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// Configuración de imágenes
export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  THUMBNAIL_SIZE: 300,
  DOMAINS: ['192.168.1.2', '192.168.1.3', 'localhost']
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  INFINITE_SCROLL_THRESHOLD: 200
} as const;

// Configuración de cache
export const CACHE_CONFIG = {
  USER_CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  POSTS_CACHE_TTL: 2 * 60 * 1000, // 2 minutos
  SEARCH_CACHE_TTL: 10 * 60 * 1000, // 10 minutos
  MAX_CACHE_SIZE: 50 * 1024 * 1024 // 50MB
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 3000,
  MAX_NOTIFICATIONS: 5,
  SOUND_ENABLED: true,
  VIBRATION_PATTERN: [200, 100, 200]
} as const;

// Configuración de validación
export const VALIDATION_CONFIG = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  POST: {
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    MAX_IMAGES: 10,
    MAX_TAGS: 20,
    TAG_MAX_LENGTH: 30
  }
} as const;

// Configuración de rutas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  USER_PROFILE: '/user/[id]',
  POST: '/post/[id]',
  CREATE: '/create',
  EDIT_POST: '/create/edit',
  SEARCH: '/search',
  COLLECTIONS: '/collections',
  SETTINGS: '/settings',
  OFFLINE: '/offline',
  APPOINTMENTS: '/appointments/book'
} as const;

// Configuración de temas
export const THEME_CONFIG = {
  DEFAULT_THEME: 'system',
  THEMES: ['light', 'dark', 'system'],
  STORAGE_KEY: 'theme'
} as const;

// Configuración de PWA
export const PWA_CONFIG = {
  CACHE_NAME: 'artenis-v1.0.0',
  STATIC_CACHE: 'artenis-static-v1.0.0',
  DYNAMIC_CACHE: 'artenis-dynamic-v1.0.0',
  OFFLINE_PAGE: '/offline',
  INSTALL_PROMPT_DELAY: 10000 // 10 segundos
} as const;

// Configuración de errores
export const ERROR_CONFIG = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  TIMEOUT_ERROR: 'Tiempo de espera agotado. Intenta nuevamente.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  UNAUTHORIZED_ERROR: 'Sesión expirada. Inicia sesión nuevamente.',
  FORBIDDEN_ERROR: 'No tienes permisos para esta acción.',
  NOT_FOUND_ERROR: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Datos inválidos. Revisa la información.',
  UNKNOWN_ERROR: 'Error desconocido. Intenta nuevamente.'
} as const;

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// Configuración de breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
} as const;

// Configuración de z-index
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;

// Configuración de storage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  CACHE: 'cache'
} as const;

// Configuración de eventos
export const EVENTS = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  POST_CREATED: 'post:created',
  POST_LIKED: 'post:liked',
  POST_COMMENTED: 'post:commented',
  USER_FOLLOWED: 'user:followed',
  NOTIFICATION_RECEIVED: 'notification:received',
  THEME_CHANGED: 'theme:changed',
  OFFLINE: 'app:offline',
  ONLINE: 'app:online'
} as const;

// Configuración de tipos de usuario
export const USER_TYPES = {
  ARTIST: 'artist',
  COLLECTOR: 'collector',
  GALLERY: 'gallery',
  ADMIN: 'admin'
} as const;

// Configuración de tipos de post
export const POST_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  TEXT: 'text',
  MIXED: 'mixed'
} as const;

// Configuración de tipos de notificación
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  SYSTEM: 'system'
} as const;

// Configuración de estados de carga
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Configuración de filtros de posts
export const POST_FILTERS = {
  SORT_BY: {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    MOST_LIKED: 'mostLiked',
    MOST_COMMENTED: 'mostCommented',
    MOST_VIEWED: 'mostViewed'
  },
  USER_TYPE: {
    ALL: 'all',
    ARTIST: 'artist',
    COLLECTOR: 'collector',
    GALLERY: 'gallery'
  }
} as const;

export default {
  APP_CONFIG,
  API_CONFIG,
  IMAGE_CONFIG,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  NOTIFICATION_CONFIG,
  VALIDATION_CONFIG,
  ROUTES,
  THEME_CONFIG,
  PWA_CONFIG,
  ERROR_CONFIG,
  ANIMATION_CONFIG,
  BREAKPOINTS,
  Z_INDEX,
  STORAGE_KEYS,
  EVENTS,
  USER_TYPES,
  POST_TYPES,
  NOTIFICATION_TYPES,
  LOADING_STATES,
  POST_FILTERS
};
