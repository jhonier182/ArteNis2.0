/**
 * Sistema de caché persistente para posts del perfil
 * 
 * Este módulo mantiene los posts del perfil en memoria y sessionStorage
 * para evitar recargas innecesarias al navegar entre páginas.
 */

import { UserPost, Profile } from '@/features/profile/services/profileService'

interface CachedUserPosts {
  posts: UserPost[]
  nextCursor: string | null
  timestamp: number
  userId: string
}

interface ScrollPosition {
  scrollY: number
  timestamp: number
}

interface CachedProfile {
  profile: Profile
  timestamp: number
  userId: string
}

// Caché en memoria (más rápido)
const memoryCache = new Map<string, CachedUserPosts>()

// Duración del caché (5 minutos)
const CACHE_DURATION_MS = 5 * 60 * 1000

// Claves para sessionStorage
const getCacheKey = (userId: string) => `profile_posts_cache_${userId}`
const getScrollKey = (userId: string) => `profile_scroll_${userId}`
const getProfileCacheKey = (userId: string) => `profile_data_cache_${userId}`

// Caché de perfiles en memoria
const profileMemoryCache = new Map<string, CachedProfile>()

// Duración del caché de perfiles (5 minutos)
const PROFILE_CACHE_DURATION_MS = 5 * 60 * 1000

/**
 * Guardar posts en caché (memoria + sessionStorage)
 */
export function cacheUserPosts(userId: string, posts: UserPost[], nextCursor: string | null): void {
  const cacheData: CachedUserPosts = {
    posts,
    nextCursor,
    timestamp: Date.now(),
    userId
  }

  // Guardar en memoria
  memoryCache.set(userId, cacheData)

  // Guardar en sessionStorage (persiste durante la sesión)
  try {
    sessionStorage.setItem(getCacheKey(userId), JSON.stringify(cacheData))
  } catch (error) {
    console.warn('[profilePostsCache] Error guardando en sessionStorage:', error)
  }
}

/**
 * Obtener posts del caché
 */
export function getCachedUserPosts(userId: string): CachedUserPosts | null {
  // Primero intentar memoria (más rápido)
  const memoryData = memoryCache.get(userId)
  if (memoryData) {
    const age = Date.now() - memoryData.timestamp
    if (age < CACHE_DURATION_MS) {
      return memoryData
    } else {
      // Caché expirado, limpiar
      memoryCache.delete(userId)
    }
  }

  // Si no está en memoria, intentar sessionStorage
  try {
    const cached = sessionStorage.getItem(getCacheKey(userId))
    if (cached) {
      const cacheData: CachedUserPosts = JSON.parse(cached)
      const age = Date.now() - cacheData.timestamp

      if (age < CACHE_DURATION_MS && cacheData.userId === userId) {
        // Restaurar en memoria también
        memoryCache.set(userId, cacheData)
        return cacheData
      } else {
        // Caché expirado, limpiar
        sessionStorage.removeItem(getCacheKey(userId))
      }
    }
  } catch (error) {
    console.warn('[profilePostsCache] Error leyendo sessionStorage:', error)
  }

  return null
}

/**
 * Limpiar caché de un usuario específico (posts, perfil y scroll)
 */
export function clearUserPostsCache(userId: string): void {
  memoryCache.delete(userId)
  profileMemoryCache.delete(userId)
  try {
    sessionStorage.removeItem(getCacheKey(userId))
    sessionStorage.removeItem(getProfileCacheKey(userId))
    sessionStorage.removeItem(getScrollKey(userId))
  } catch (error) {
    console.warn('[profilePostsCache] Error limpiando caché:', error)
  }
}

/**
 * Limpiar todo el caché
 */
export function clearAllCache(): void {
  memoryCache.clear()
  profileMemoryCache.clear()
  try {
    // Limpiar todas las claves relacionadas
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (
        key.startsWith('profile_posts_cache_') || 
        key.startsWith('profile_scroll_') ||
        key.startsWith('profile_data_cache_')
      )) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  } catch (error) {
    console.warn('[profilePostsCache] Error limpiando todo el caché:', error)
  }
}

/**
 * Guardar posición de scroll
 */
export function saveScrollPosition(userId: string, scrollY: number): void {
  const scrollData: ScrollPosition = {
    scrollY,
    timestamp: Date.now()
  }

  try {
    sessionStorage.setItem(getScrollKey(userId), JSON.stringify(scrollData))
  } catch (error) {
    console.warn('[profilePostsCache] Error guardando scroll:', error)
  }
}

/**
 * Obtener posición de scroll guardada
 */
export function getScrollPosition(userId: string): number | null {
  try {
    const cached = sessionStorage.getItem(getScrollKey(userId))
    if (cached) {
      const scrollData: ScrollPosition = JSON.parse(cached)
      // El scroll es válido por 10 minutos
      const age = Date.now() - scrollData.timestamp
      if (age < 10 * 60 * 1000) {
        return scrollData.scrollY
      } else {
        sessionStorage.removeItem(getScrollKey(userId))
      }
    }
  } catch (error) {
    console.warn('[profilePostsCache] Error leyendo scroll:', error)
  }

  return null
}

/**
 * Limpiar posición de scroll
 */
export function clearScrollPosition(userId: string): void {
  try {
    sessionStorage.removeItem(getScrollKey(userId))
  } catch (error) {
    console.warn('[profilePostsCache] Error limpiando scroll:', error)
  }
}

/**
 * Guardar perfil en caché (memoria + sessionStorage)
 */
export function cacheUserProfile(userId: string, profile: Profile): void {
  const cacheData: CachedProfile = {
    profile,
    timestamp: Date.now(),
    userId
  }

  // Guardar en memoria
  profileMemoryCache.set(userId, cacheData)

  // Guardar en sessionStorage (persiste durante la sesión)
  try {
    sessionStorage.setItem(getProfileCacheKey(userId), JSON.stringify(cacheData))
  } catch (error) {
    console.warn('[profilePostsCache] Error guardando perfil en sessionStorage:', error)
  }
}

/**
 * Obtener perfil del caché
 */
export function getCachedUserProfile(userId: string): Profile | null {
  // Primero intentar memoria (más rápido)
  const memoryData = profileMemoryCache.get(userId)
  if (memoryData) {
    const age = Date.now() - memoryData.timestamp
    if (age < PROFILE_CACHE_DURATION_MS) {
      return memoryData.profile
    } else {
      // Caché expirado, limpiar
      profileMemoryCache.delete(userId)
    }
  }

  // Si no está en memoria, intentar sessionStorage
  try {
    const cached = sessionStorage.getItem(getProfileCacheKey(userId))
    if (cached) {
      const cacheData: CachedProfile = JSON.parse(cached)
      const age = Date.now() - cacheData.timestamp

      if (age < PROFILE_CACHE_DURATION_MS && cacheData.userId === userId) {
        // Restaurar en memoria también
        profileMemoryCache.set(userId, cacheData)
        return cacheData.profile
      } else {
        // Caché expirado, limpiar
        sessionStorage.removeItem(getProfileCacheKey(userId))
      }
    }
  } catch (error) {
    console.warn('[profilePostsCache] Error leyendo perfil de sessionStorage:', error)
  }

  return null
}

/**
 * Limpiar caché de perfil de un usuario específico
 */
export function clearUserProfileCache(userId: string): void {
  profileMemoryCache.delete(userId)
  try {
    sessionStorage.removeItem(getProfileCacheKey(userId))
  } catch (error) {
    console.warn('[profilePostsCache] Error limpiando caché de perfil:', error)
  }
}

