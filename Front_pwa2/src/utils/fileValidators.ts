/**
 * Utilidades para validación de archivos
 * 
 * Centraliza toda la lógica de validación de archivos para evitar duplicación
 * y mantener consistencia en toda la aplicación.
 * 
 * @example
 * ```ts
 * import { validateImageFile, validatePostFile } from '@/utils/fileValidators'
 * 
 * try {
 *   validateImageFile(file)
 *   // Archivo válido, proceder
 * } catch (error) {
 *   // Manejar error
 * }
 * ```
 */

import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_POST_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  ERROR_INVALID_FILE_TYPE,
  ERROR_FILE_TOO_LARGE,
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
} from './constants'

// ============================================
// Interfaces
// ============================================

export interface ValidationResult {
  /** Si la validación fue exitosa */
  valid: boolean
  /** Mensaje de error si la validación falló */
  error?: string
}

// ============================================
// Helpers Internos
// ============================================

/**
 * Verifica si un archivo es una imagen basándose en su tipo MIME
 */
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || IMAGE_MIME_TYPES.includes(file.type as any)
}

/**
 * Verifica si un archivo es un video basándose en su tipo MIME
 */
function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || VIDEO_MIME_TYPES.includes(file.type as any)
}

/**
 * Formatea bytes a MB para mensajes de error
 */
function formatBytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(0)
}

// ============================================
// Validadores Públicos
// ============================================

/**
 * Valida un archivo de imagen (para avatares)
 * 
 * @param file - Archivo a validar
 * @returns Resultado de la validación
 * 
 * @example
 * ```ts
 * const result = validateImageFile(file)
 * if (!result.valid) {
 *   alert(result.error)
 *   return
 * }
 * ```
 */
export function validateImageFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No se seleccionó ningún archivo',
    }
  }

  if (!isImageFile(file)) {
    return {
      valid: false,
      error: 'Solo se permiten imágenes',
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío',
    }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: ERROR_FILE_TOO_LARGE,
    }
  }

  return { valid: true }
}

/**
 * Valida un archivo para publicación (imagen o video)
 * 
 * @param file - Archivo a validar
 * @returns Resultado de la validación con información del tipo
 * 
 * @example
 * ```ts
 * const result = validatePostFile(file)
 * if (!result.valid) {
 *   setError(result.error)
 *   return
 * }
 * ```
 */
export function validatePostFile(file: File | null | undefined): ValidationResult & { isVideo?: boolean } {
  if (!file) {
    return {
      valid: false,
      error: 'No se seleccionó ningún archivo',
    }
  }

  const isImage = isImageFile(file!)
  const isVideo = isVideoFile(file!)

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: ERROR_INVALID_FILE_TYPE,
    }
  }

  if (file!.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío',
    }
  }

  // Validar tamaño según el tipo
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_POST_IMAGE_SIZE_BYTES
  if (file!.size > maxSize) {
    const maxSizeMB = formatBytesToMB(maxSize)
    return {
      valid: false,
      error: `El archivo no puede superar ${maxSizeMB}MB`,
    }
  }

  return {
    valid: true,
    isVideo,
  }
}

/**
 * Valida un archivo de video
 * 
 * @param file - Archivo a validar
 * @returns Resultado de la validación
 */
export function validateVideoFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No se seleccionó ningún archivo',
    }
  }

  if (!isVideoFile(file)) {
    return {
      valid: false,
      error: 'Solo se permiten videos',
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío',
    }
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    const maxSizeMB = formatBytesToMB(MAX_VIDEO_SIZE_BYTES)
    return {
      valid: false,
      error: `El video no puede superar ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Obtiene el tipo de archivo (image o video)
 * 
 * @param file - Archivo a analizar
 * @returns 'image' | 'video' | null
 */
export function getFileType(file: File | null | undefined): 'image' | 'video' | null {
  if (!file) return null
  
  if (isImageFile(file)) return 'image'
  if (isVideoFile(file)) return 'video'
  
  return null
}

/**
 * Valida que un archivo no esté vacío
 * 
 * @param file - Archivo a validar
 * @returns Resultado de la validación
 */
export function validateFileNotEmpty(file: File | null | undefined): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No se seleccionó ningún archivo',
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío',
    }
  }

  return { valid: true }
}

