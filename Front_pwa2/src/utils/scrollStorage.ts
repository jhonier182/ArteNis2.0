/**
 * Sistema de almacenamiento mejorado para restauración de scroll
 * 
 * Guarda metadata adicional (timestamp, postIds, routePath) para validación
 * y restauración más robusta del scroll.
 */

export type ScrollSnapshot = {
  scrollY: number
  ts: number
  routePath: string
  postIds?: string[] // snapshot de IDs de posts visibles para validación
  lastVisitedPostId?: string
}

const KEY_PREFIX = 'app_scroll_'

/**
 * Guarda un snapshot completo del scroll con metadata
 */
export const saveScroll = (identifier: string, snapshot: ScrollSnapshot): void => {
  try {
    sessionStorage.setItem(KEY_PREFIX + identifier, JSON.stringify(snapshot))
  } catch (e) {
    // Silenciar errores de storage (puede estar lleno o deshabilitado)
  }
}

/**
 * Obtiene el snapshot de scroll guardado
 */
export const getScroll = (identifier: string): ScrollSnapshot | null => {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + identifier)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

/**
 * Limpia el snapshot de scroll guardado
 */
export const clearScroll = (identifier: string): void => {
  try {
    sessionStorage.removeItem(KEY_PREFIX + identifier)
  } catch (e) {
    // Silenciar errores
  }
}

/**
 * Guarda el flag de primera carga
 */
export const setFirstLoadFlag = (identifier: string, val: boolean): void => {
  try {
    sessionStorage.setItem(`isFirstLoad_${identifier}`, JSON.stringify(val))
  } catch (e) {
    // Silenciar errores
  }
}

/**
 * Obtiene el flag de primera carga
 */
export const getFirstLoadFlag = (identifier: string): boolean => {
  try {
    const stored = sessionStorage.getItem(`isFirstLoad_${identifier}`)
    return stored ? JSON.parse(stored) : true
  } catch (e) {
    return true // Por defecto es primera carga si hay error
  }
}

