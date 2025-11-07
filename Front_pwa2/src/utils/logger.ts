/**
 * Logger condicional para desarrollo y producción
 * 
 * En desarrollo: muestra todos los logs en consola
 * En producción: solo muestra errores críticos
 * 
 * @example
 * ```ts
 * import { logger } from '@/utils/logger'
 * 
 * logger.debug('Debug info') // Solo en desarrollo
 * logger.info('Info message') // Solo en desarrollo
 * logger.warn('Warning') // Solo en desarrollo
 * logger.error('Error message') // Siempre visible
 * ```
 */

const isDevelopment = process.env.NODE_ENV === 'development'

interface Logger {
  debug: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, error?: unknown, ...args: unknown[]) => void
}

/**
 * Logger condicional que solo muestra logs en desarrollo
 */
export const logger: Logger = {
  /**
   * Log de debug - solo en desarrollo
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  /**
   * Log de información - solo en desarrollo
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  /**
   * Log de advertencia - solo en desarrollo
   */
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  /**
   * Log de error - siempre visible (crítico)
   */
  error: (message: string, error?: unknown, ...args: unknown[]) => {
    if (error) {
      console.error(`[ERROR] ${message}`, error, ...args)
    } else {
      console.error(`[ERROR] ${message}`, ...args)
    }
  },
}

