'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { apiClient } from '@/services/apiClient'

interface PostLikeInfo {
  isLiked: boolean
  likesCount: number
}

interface LikesContextType {
  /** Map de likes por postId (para búsqueda rápida O(1)) */
  likedPosts: Map<string, PostLikeInfo>
  /** Verificar si un post tiene like */
  isLiked: (postId: string) => boolean
  /** Obtener información completa de likes de un post */
  getLikeInfo: (postId: string) => PostLikeInfo | null
  /** Agregar like a un post (optimistic update) */
  addLike: (postId: string, likesCount?: number) => void
  /** Remover like de un post (optimistic update) */
  removeLike: (postId: string, likesCount?: number) => void
  /** Actualizar información de likes de un post */
  updateLikeInfo: (postId: string, isLiked: boolean, likesCount: number) => void
  /** Recargar información de likes desde el servidor */
  refreshLikeInfo: (postId: string) => Promise<void>
  /** Estado de carga inicial */
  isLoading: boolean
}

const LikesContext = createContext<LikesContextType | undefined>(undefined)

/**
 * Provider para manejar el estado global de likes
 * 
 * Características:
 * - Estado sincronizado en toda la aplicación
 * - Actualizaciones optimistas (UI inmediata)
 * - Caché persistente entre navegaciones
 * - Sincronización en tiempo real con Socket.io
 * 
 * @example
 * ```tsx
 * <LikesProvider>
 *   <App />
 * </LikesProvider>
 * ```
 */
export function LikesProvider({ children }: { children: ReactNode }) {
  // Map de likes por postId
  const [likedPosts, setLikedPosts] = useState<Map<string, PostLikeInfo>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  
  // Refs para evitar llamadas duplicadas
  const mountedRef = useRef(true)
  const isLoadingRef = useRef(false)
  
  // Caché global para persistir entre navegaciones
  const cacheKey = 'liked_posts_cache'
  const cacheTimestampKey = 'liked_posts_cache_timestamp'
  const CACHE_DURATION = 300000 // 5 minutos

  /**
   * Cargar caché desde localStorage
   */
  const loadCache = useCallback((): Map<string, PostLikeInfo> => {
    if (typeof window === 'undefined') return new Map()
    
    try {
      const cached = localStorage.getItem(cacheKey)
      const timestamp = localStorage.getItem(cacheTimestampKey)
      
      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp, 10)
        if (cacheAge < CACHE_DURATION) {
          const cachedData = JSON.parse(cached) as Array<[string, PostLikeInfo]>
          return new Map(cachedData)
        }
      }
    } catch (e) {
      console.warn('Error parseando caché de likes:', e)
    }
    
    return new Map()
  }, [])

  /**
   * Guardar en caché
   */
  const saveCache = useCallback((likedPostsMap: Map<string, PostLikeInfo>) => {
    if (typeof window === 'undefined') return
    
    try {
      const data = Array.from(likedPostsMap.entries())
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())
    } catch (e) {
      console.warn('Error guardando caché de likes:', e)
    }
  }, [])

  /**
   * Verificar si un post tiene like
   */
  const isLiked = useCallback((postId: string): boolean => {
    const info = likedPosts.get(postId)
    return info?.isLiked ?? false
  }, [likedPosts])

  /**
   * Obtener información completa de likes
   */
  const getLikeInfo = useCallback((postId: string): PostLikeInfo | null => {
    return likedPosts.get(postId) || null
  }, [likedPosts])

  /**
   * Agregar like a un post (actualización optimista)
   */
  const addLike = useCallback((postId: string, likesCount?: number) => {
    setLikedPosts(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(postId)
      
      newMap.set(postId, {
        isLiked: true,
        likesCount: likesCount ?? (current ? current.likesCount + 1 : 1)
      })
      
      // Guardar en caché
      saveCache(newMap)
      
      return newMap
    })
  }, [saveCache])

  /**
   * Remover like de un post (actualización optimista)
   */
  const removeLike = useCallback((postId: string, likesCount?: number) => {
    setLikedPosts(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(postId)
      
      newMap.set(postId, {
        isLiked: false,
        likesCount: likesCount ?? Math.max(0, (current?.likesCount ?? 1) - 1)
      })
      
      // Guardar en caché
      saveCache(newMap)
      
      return newMap
    })
  }, [saveCache])

  /**
   * Actualizar información de likes de un post
   */
  const updateLikeInfo = useCallback((postId: string, isLiked: boolean, likesCount: number) => {
    setLikedPosts(prev => {
      const newMap = new Map(prev)
      newMap.set(postId, { isLiked, likesCount })
      
      // Guardar en caché
      saveCache(newMap)
      
      return newMap
    })
  }, [saveCache])

  /**
   * Recargar información de likes desde el servidor
   */
  const refreshLikeInfo = useCallback(async (postId: string) => {
    if (isLoadingRef.current) return

    try {
      isLoadingRef.current = true
      setIsLoading(true)

      const response = await apiClient.getClient().get<{
        success: boolean
        data: {
          likesCount: number
          isLiked: boolean
          postId: string
        }
      }>(`/posts/${postId}/likes`)

      const info = response.data.data
      
      if (mountedRef.current && info) {
        updateLikeInfo(postId, info.isLiked, info.likesCount)
      }
    } catch (err: unknown) {
      console.error('Error cargando información de likes:', err)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [updateLikeInfo])

  // Cargar caché al montar
  useEffect(() => {
    mountedRef.current = true
    const cached = loadCache()
    
    if (cached.size > 0) {
      setLikedPosts(cached)
    }

    return () => {
      mountedRef.current = false
    }
  }, [loadCache])

  // Sincronizar caché cuando cambia likedPosts
  useEffect(() => {
    if (likedPosts.size > 0) {
      saveCache(likedPosts)
    }
  }, [likedPosts, saveCache])

  const value: LikesContextType = {
    likedPosts,
    isLiked,
    getLikeInfo,
    addLike,
    removeLike,
    updateLikeInfo,
    refreshLikeInfo,
    isLoading
  }

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de likes
 * 
 * @throws Error si se usa fuera del LikesProvider
 * 
 * @example
 * ```tsx
 * const { isLiked, addLike, removeLike } = useLikesContext()
 * ```
 */
export function useLikesContext(): LikesContextType {
  const context = useContext(LikesContext)
  
  if (context === undefined) {
    throw new Error('useLikesContext must be used within a LikesProvider')
  }
  
  return context
}

/**
 * Función utilitaria para limpiar el caché
 */
export function clearLikesCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('liked_posts_cache')
    localStorage.removeItem('liked_posts_cache_timestamp')
    
  }
}

