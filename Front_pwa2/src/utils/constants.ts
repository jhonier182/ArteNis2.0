/**
 * Constantes centralizadas para evitar magic numbers y strings
 * 
 * Este archivo contiene todas las constantes reutilizables del proyecto
 * para mejorar mantenibilidad y evitar valores hardcodeados.
 */

// ============================================
// Timeouts y Delays (en milisegundos)
// ============================================

/** Delay corto para operaciones asíncronas (300ms) */
export const SHORT_DELAY_MS = 300

/** Delay medio para operaciones asíncronas (500ms) */
export const MEDIUM_DELAY_MS = 500

/** Delay largo para operaciones asíncronas (1000ms) */
export const LONG_DELAY_MS = 1000

/** Timeout para mensajes de éxito (3 segundos) */
export const SUCCESS_MESSAGE_TIMEOUT_MS = 3000

/** Delay para verificar nuevos posts después de creación */
export const CHECK_NEW_POST_DELAY_MS = 300

/** Delay para navegación después de crear post */
export const POST_CREATION_NAVIGATION_DELAY_MS = 500

/** Delay para procesamiento de backend después de crear post */
export const POST_CREATION_PROCESSING_DELAY_MS = 300

// ============================================
// Límites de Paginación
// ============================================

/** Límite por defecto de posts por página */
export const DEFAULT_POST_LIMIT = 10

/** Límite de posts guardados */
export const SAVED_POSTS_LIMIT = 100

/** Límite de posts de usuario en perfil */
export const USER_POSTS_LIMIT = 6

/** Límite de búsqueda por defecto */
export const DEFAULT_SEARCH_LIMIT = 20

/** Límite de posts de descubrimiento */
export const DISCOVER_POSTS_LIMIT = 50

/** Página por defecto para posts guardados */
export const SAVED_POSTS_PAGE = 1

// ============================================
// Extensiones de Archivos
// ============================================

/** Extensiones de video soportadas */
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'] as const

/** Extensiones de imagen soportadas */
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const

/** Tipo MIME para videos */
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'] as const

/** Tipo MIME para imágenes */
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const

// ============================================
// Límites de Tamaño de Archivos (en bytes)
// ============================================

/** Tamaño máximo de imagen (5MB) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

/** Tamaño máximo de imagen para creación de post (10MB) */
export const MAX_POST_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

/** Tamaño máximo de video (50MB) */
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024

// ============================================
// Rutas y URLs
// ============================================

/** Ruta de imagen de fondo por defecto */
export const DEFAULT_BACKGROUND_IMAGE = '/fondo.jpeg'

/** Formato de nombre de archivo de video descargado */
export const VIDEO_DOWNLOAD_FILENAME_FORMAT = 'video-{id}.mp4'

// ============================================
// Mensajes de Error Comunes
// ============================================

/** Mensaje de error cuando no se selecciona archivo */
export const ERROR_NO_FILE_SELECTED = 'Por favor selecciona una imagen o video'

/** Mensaje de error cuando el archivo es muy grande */
export const ERROR_FILE_TOO_LARGE = 'La imagen no puede superar 5MB'

/** Mensaje de error cuando el tipo de archivo no es válido */
export const ERROR_INVALID_FILE_TYPE = 'Solo se permiten imágenes o videos'

/** Mensaje de error al descargar video */
export const ERROR_DOWNLOAD_VIDEO = 'Error al descargar el video'

// ============================================
// Tipos de Post
// ============================================

/** Tipo de post: imagen */
export const POST_TYPE_IMAGE = 'image' as const

/** Tipo de post: video */
export const POST_TYPE_VIDEO = 'video' as const

/** Tipo de post: reel */
export const POST_TYPE_REEL = 'reel' as const

/** Tipos de post válidos */
export const VALID_POST_TYPES = [POST_TYPE_IMAGE, POST_TYPE_VIDEO, POST_TYPE_REEL] as const

// ============================================
// Configuración de Calidad de Imagen
// ============================================

/** Calidad de compresión JPEG (0.0 - 1.0) */
export const JPEG_QUALITY = 0.95

