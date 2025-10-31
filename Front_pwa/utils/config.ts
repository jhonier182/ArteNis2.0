/**
 * Configuración centralizada de variables de entorno
 * Este archivo centraliza todas las variables de entorno para facilitar su gestión
 */

// ===========================================
// CONFIGURACIÓN DE API
// ===========================================
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  ENDPOINTS: {
    AUTH: '/api/auth',
    POSTS: '/api/posts',
    BOARDS: '/api/boards',
    SEARCH: '/api/search',
    FOLLOW: '/api/follow',
    PROFILE: '/api/profile',
  }
} as const;

// ===========================================
// CONFIGURACIÓN DE APLICACIÓN
// ===========================================
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'ArteNis',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Plataforma de arte digital',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
} as const;

// ===========================================
// CONFIGURACIÓN DE IMÁGENES
// ===========================================
export const IMAGE_CONFIG = {
  DOMAINS: process.env.NEXT_PUBLIC_IMAGE_DOMAINS?.split(',') || [
    'localhost',
    '127.0.0.1',
    '192.168.1.2'
  ],
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
} as const;

// ===========================================
// CONFIGURACIÓN DE AUTENTICACIÓN
// ===========================================
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: parseInt(process.env.NEXT_PUBLIC_TOKEN_EXPIRY || '3600', 10),
  STORAGE_KEYS: {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER_PROFILE: 'userProfile',
  }
} as const;

// ===========================================
// CONFIGURACIÓN DE PWA
// ===========================================
export const PWA_CONFIG = {
  ENABLE_CACHE: process.env.NEXT_PUBLIC_ENABLE_CACHE === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
} as const;

// ===========================================
// CONFIGURACIÓN DE ANALYTICS
// ===========================================
export const ANALYTICS_CONFIG = {
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  ENABLED: !!process.env.NEXT_PUBLIC_GA_ID,
} as const;

// ===========================================
// CONFIGURACIÓN DE ENTORNO
// ===========================================
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// ===========================================
// CONFIGURACIÓN COMPLETA
// ===========================================
export const CONFIG = {
  API: API_CONFIG,
  APP: APP_CONFIG,
  IMAGE: IMAGE_CONFIG,
  AUTH: AUTH_CONFIG,
  PWA: PWA_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  ENV: ENV_CONFIG,
} as const;

// ===========================================
// UTILIDADES DE CONFIGURACIÓN
// ===========================================
export const getApiUrl = (endpoint: string = '') => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${API_CONFIG.BASE_URL}${path}`;
};

export const isDebugMode = () => {
  return APP_CONFIG.DEBUG;
};


export default CONFIG;
