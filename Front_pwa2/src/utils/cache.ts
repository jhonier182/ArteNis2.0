/**
 * Sistema de caché genérico y centralizado
 * 
 * Este módulo proporciona un sistema de caché reutilizable que combina
 * memoria (rápido) y sessionStorage (persistente) para cualquier tipo de dato.
 * 
 * Principios:
 * - DRY: Un solo sistema para todos los tipos de caché
 * - Type-safe: Usa TypeScript generics para seguridad de tipos
 * - Extensible: Fácil de usar para nuevos casos de uso
 * - Performance: Memoria primero, sessionStorage como respaldo
 */

// Importaciones de tipos (al inicio para evitar dependencias circulares)
import { UserPost, Profile } from '@/features/profile/services/profileService'
import { Post } from '@/features/posts/services/postService'

interface CacheEntry<T> {
  data: T
  timestamp: number
  key: string
}

interface CacheConfig {
  /** Duración del caché en milisegundos (default: 5 minutos) */
  duration?: number
  /** Prefijo para las claves en sessionStorage (default: 'cache_') */
  keyPrefix?: string
  /** Si debe persistir en sessionStorage (default: true) */
  persist?: boolean
}

/**
 * Clase genérica para manejar caché de cualquier tipo de dato
 */
class CacheManager<T> {
  private memoryCache: Map<string, CacheEntry<T>>
  private config: Required<CacheConfig>
  private cacheName: string

  constructor(cacheName: string, config: CacheConfig = {}) {
    this.cacheName = cacheName
    this.memoryCache = new Map()
    this.config = {
      duration: config.duration ?? 5 * 60 * 1000, // 5 minutos por defecto
      keyPrefix: config.keyPrefix ?? 'cache_',
      persist: config.persist ?? true
    }
  }

  /**
   * Genera la clave completa para sessionStorage
   */
  private getStorageKey(key: string): string {
    return `${this.config.keyPrefix}${this.cacheName}_${key}`
  }

  /**
   * Guarda datos en caché (memoria + sessionStorage)
   */
  set(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key
    }

    // Guardar en memoria (siempre)
    this.memoryCache.set(key, entry)

    // Guardar en sessionStorage (si está habilitado)
    if (this.config.persist) {
      try {
        sessionStorage.setItem(this.getStorageKey(key), JSON.stringify(entry))
      } catch (error) {
        console.warn(`[CacheManager:${this.cacheName}] Error guardando en sessionStorage:`, error)
      }
    }
  }

  /**
   * Obtiene datos del caché (memoria primero, luego sessionStorage)
   */
  get(key: string): T | null {
    // Primero intentar memoria (más rápido)
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry) {
      const age = Date.now() - memoryEntry.timestamp
      if (age < this.config.duration) {
        return memoryEntry.data
      } else {
        // Caché expirado, limpiar
        this.memoryCache.delete(key)
      }
    }

    // Si no está en memoria y está habilitado, intentar sessionStorage
    if (this.config.persist) {
      try {
        const cached = sessionStorage.getItem(this.getStorageKey(key))
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached)
          const age = Date.now() - entry.timestamp

          if (age < this.config.duration && entry.key === key) {
            // Restaurar en memoria también
            this.memoryCache.set(key, entry)
            return entry.data
          } else {
            // Caché expirado, limpiar
            sessionStorage.removeItem(this.getStorageKey(key))
          }
        }
      } catch (error) {
        console.warn(`[CacheManager:${this.cacheName}] Error leyendo sessionStorage:`, error)
      }
    }

    return null
  }

  /**
   * Elimina un elemento específico del caché
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
    if (this.config.persist) {
      try {
        sessionStorage.removeItem(this.getStorageKey(key))
      } catch (error) {
        console.warn(`[CacheManager:${this.cacheName}] Error eliminando de sessionStorage:`, error)
      }
    }
  }

  /**
   * Limpia todo el caché de este manager
   */
  clear(): void {
    this.memoryCache.clear()
    if (this.config.persist) {
      try {
        // Limpiar todas las claves relacionadas
        const keysToRemove: string[] = []
        const prefix = this.getStorageKey('')
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key))
      } catch (error) {
        console.warn(`[CacheManager:${this.cacheName}] Error limpiando sessionStorage:`, error)
      }
    }
  }

  /**
   * Verifica si existe un elemento en caché (sin validar expiración)
   */
  has(key: string): boolean {
    return this.memoryCache.has(key) || 
           (this.config.persist && sessionStorage.getItem(this.getStorageKey(key)) !== null)
  }
}

/**
 * Factory function para crear instancias de caché con configuración específica
 * 
 * @example
 * const postCache = createCache<Post>('post', { duration: 10 * 60 * 1000 })
 * postCache.set('post-123', postData)
 * const cached = postCache.get('post-123')
 */
export function createCache<T>(cacheName: string, config: CacheConfig = {}): CacheManager<T> {
  return new CacheManager<T>(cacheName, config)
}

/**
 * Utilidad para manejar scroll positions (no necesita genérico)
 */
class ScrollCache {
  private static readonly SCROLL_PREFIX = 'scroll_'
  private static readonly SCROLL_DURATION = 10 * 60 * 1000 // 10 minutos

  static save(userId: string, scrollY: number): void {
    const data = { scrollY, timestamp: Date.now() }
    try {
      sessionStorage.setItem(`${this.SCROLL_PREFIX}${userId}`, JSON.stringify(data))
    } catch (error) {
      console.warn('[ScrollCache] Error guardando scroll:', error)
    }
  }

  static get(userId: string): number | null {
    try {
      const cached = sessionStorage.getItem(`${this.SCROLL_PREFIX}${userId}`)
      if (cached) {
        const data = JSON.parse(cached)
        const age = Date.now() - data.timestamp
        if (age < this.SCROLL_DURATION) {
          return data.scrollY
        } else {
          sessionStorage.removeItem(`${this.SCROLL_PREFIX}${userId}`)
        }
      }
    } catch (error) {
      console.warn('[ScrollCache] Error leyendo scroll:', error)
    }
    return null
  }

  static clear(userId: string): void {
    try {
      sessionStorage.removeItem(`${this.SCROLL_PREFIX}${userId}`)
    } catch (error) {
      console.warn('[ScrollCache] Error limpiando scroll:', error)
    }
  }
}

export { ScrollCache }

// ============================================
// Instancias de caché pre-configuradas
// ============================================

/**
 * Interfaces para los datos cacheados
 */
export interface CachedUserPosts {
  posts: UserPost[]
  nextCursor: string | null
  userId: string
}

export interface CachedProfile {
  profile: Profile
  userId: string
}

/**
 * Caché de posts del perfil de usuario
 */
export const userPostsCache = createCache<CachedUserPosts>('user_posts', {
  duration: 5 * 60 * 1000, // 5 minutos
  keyPrefix: 'profile_posts_cache_'
})

/**
 * Caché de perfiles de usuario
 */
export const profileCache = createCache<CachedProfile>('profile', {
  duration: 5 * 60 * 1000, // 5 minutos
  keyPrefix: 'profile_data_cache_'
})

/**
 * Caché de posts individuales
 */
export const postCache = createCache<Post>('post', {
  duration: 10 * 60 * 1000, // 10 minutos
  keyPrefix: 'post_cache_'
})

// ============================================
// Funciones helper para facilitar el uso
// ============================================

/**
 * Guardar posts en caché
 */
export function cacheUserPosts(userId: string, posts: UserPost[], nextCursor: string | null): void {
  const cacheData: CachedUserPosts = {
    posts,
    nextCursor,
    userId
  }
  userPostsCache.set(userId, cacheData)
}

/**
 * Obtener posts del caché
 */
export function getCachedUserPosts(userId: string): CachedUserPosts | null {
  return userPostsCache.get(userId)
}

/**
 * Limpiar caché de un usuario específico (posts, perfil y scroll)
 */
export function clearUserPostsCache(userId: string): void {
  userPostsCache.delete(userId)
  profileCache.delete(userId)
  ScrollCache.clear(userId)
}

/**
 * Limpiar todo el caché
 */
export function clearAllCache(): void {
  userPostsCache.clear()
  profileCache.clear()
  postCache.clear()
}

/**
 * Guardar perfil en caché
 */
export function cacheUserProfile(userId: string, profile: Profile): void {
  const cacheData: CachedProfile = {
    profile,
    userId
  }
  profileCache.set(userId, cacheData)
}

/**
 * Obtener perfil del caché
 */
export function getCachedUserProfile(userId: string): Profile | null {
  const cached = profileCache.get(userId)
  return cached ? cached.profile : null
}

/**
 * Limpiar caché de perfil de un usuario específico
 */
export function clearUserProfileCache(userId: string): void {
  profileCache.delete(userId)
}

/**
 * Guardar post individual en caché
 */
export function cachePost(postId: string, post: Post): void {
  postCache.set(postId, post)
}

/**
 * Obtener post individual del caché
 */
export function getCachedPost(postId: string): Post | null {
  return postCache.get(postId)
}

/**
 * Limpiar caché de un post específico
 */
export function clearPostCache(postId: string): void {
  postCache.delete(postId)
}

/**
 * Guardar posición de scroll
 */
export function saveScrollPosition(userId: string, scrollY: number): void {
  ScrollCache.save(userId, scrollY)
}

/**
 * Obtener posición de scroll guardada
 */
export function getScrollPosition(userId: string): number | null {
  return ScrollCache.get(userId)
}

/**
 * Limpiar posición de scroll
 */
export function clearScrollPosition(userId: string): void {
  ScrollCache.clear(userId)
}

