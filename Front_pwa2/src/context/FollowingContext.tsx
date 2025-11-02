'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { apiClient } from '@/services/apiClient'

interface FollowingUser {
  id: string
  username: string
  fullName: string
  avatar?: string
  isVerified?: boolean
}

interface FollowingContextType {
  /** Set de IDs de usuarios seguidos (para búsqueda rápida O(1)) */
  followingIds: Set<string>
  /** Lista completa de usuarios seguidos con datos */
  followingUsers: FollowingUser[]
  /** Verificar si un usuario está siendo seguido */
  isFollowing: (userId: string) => boolean
  /** Agregar usuario a la lista de seguidos (optimistic update) */
  addFollowing: (userId: string, userData?: FollowingUser) => void
  /** Remover usuario de la lista de seguidos (optimistic update) */
  removeFollowing: (userId: string) => void
  /** Recargar lista completa desde el servidor */
  refreshFollowing: () => Promise<void>
  /** Estado de carga inicial */
  isLoading: boolean
  /** Error si existe */
  error: string | null
}

const FollowingContext = createContext<FollowingContextType | undefined>(undefined)

/**
 * Provider para manejar el estado global de usuarios seguidos
 * 
 * Características:
 * - Estado sincronizado en toda la aplicación
 * - Actualizaciones optimistas (UI inmediata)
 * - Caché persistente entre navegaciones
 * - Recarga automática desde servidor
 * 
 * @example
 * ```tsx
 * <FollowingProvider>
 *   <App />
 * </FollowingProvider>
 * ```
 */
export function FollowingProvider({ children }: { children: ReactNode }) {
  // Estado de usuarios seguidos (Set para búsqueda O(1))
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  // Lista completa con datos de usuarios
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refs para evitar llamadas duplicadas
  const mountedRef = useRef(true)
  const isLoadingRef = useRef(false)
  
  // Caché global para persistir entre navegaciones
  const cacheKey = 'following_users_cache'
  const cacheTimestampKey = 'following_users_cache_timestamp'
  const CACHE_DURATION = 30000 // 30 segundos

  /**
   * Cargar usuarios seguidos desde el servidor
   */
  const loadFollowingUsers = useCallback(async (forceRefresh = false) => {
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current && !forceRefresh) {
      return
    }

    try {
      isLoadingRef.current = true
      setIsLoading(true)
      setError(null)

      // Verificar caché si no es forzado
      if (!forceRefresh && typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey)
        const timestamp = localStorage.getItem(cacheTimestampKey)
        
        if (cached && timestamp) {
          const cacheAge = Date.now() - parseInt(timestamp, 10)
          if (cacheAge < CACHE_DURATION) {
            try {
              const cachedUsers: FollowingUser[] = JSON.parse(cached)
              const ids = new Set(cachedUsers.map(u => u.id))
              
              if (mountedRef.current) {
                setFollowingIds(ids)
                setFollowingUsers(cachedUsers)
                setIsLoading(false)
                isLoadingRef.current = false
                
                // Cargar datos frescos en background (sin bloquear UI)
                loadFollowingUsers(true).catch(() => {
                  // Si falla, mantiene el caché
                })
                return
              }
            } catch (e) {
              console.warn('Error parseando caché de follows:', e)
            }
          }
        }
      }

      // Llamar al servidor
      const response = await apiClient.getClient().get<{
        success: boolean
        data: { followingUsers: FollowingUser[] }
      }>('/follow/following')

      const users = response.data.data?.followingUsers || []
      const ids = new Set(users.map(u => u.id))

      if (mountedRef.current) {
        setFollowingIds(ids)
        setFollowingUsers(users)
        setIsLoading(false)
        setError(null)

        // Guardar en caché
        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify(users))
          localStorage.setItem(cacheTimestampKey, Date.now().toString())
        }
      }
    } catch (err: any) {
      console.error('Error cargando usuarios seguidos:', err)
      
      if (mountedRef.current) {
        setError(err.message || 'Error al cargar usuarios seguidos')
        setIsLoading(false)
      }
    } finally {
      isLoadingRef.current = false
    }
  }, [])

  /**
   * Agregar usuario a la lista de seguidos (actualización optimista)
   */
  const addFollowing = useCallback((userId: string, userData?: FollowingUser) => {
    setFollowingIds(prev => {
      const newSet = new Set(prev)
      newSet.add(userId)
      return newSet
    })

    // Si tenemos datos del usuario, agregarlo a la lista
    if (userData) {
      setFollowingUsers(prev => {
        // Evitar duplicados
        if (prev.some(u => u.id === userId)) {
          return prev
        }
        const updated = [...prev, userData].sort((a, b) => 
          (a.username || '').localeCompare(b.username || '')
        )
        return updated
      })
    }
  }, [])

  /**
   * Remover usuario de la lista de seguidos (actualización optimista)
   */
  const removeFollowing = useCallback((userId: string) => {
    setFollowingIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(userId)
      return newSet
    })

    setFollowingUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  // Sincronizar caché cuando cambia followingUsers
  useEffect(() => {
    if (typeof window !== 'undefined' && followingUsers.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify(followingUsers))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())
    }
  }, [followingUsers])

  /**
   * Verificar si un usuario está siendo seguido
   */
  const isFollowing = useCallback((userId: string): boolean => {
    return followingIds.has(userId)
  }, [followingIds])

  /**
   * Recargar desde el servidor
   */
  const refreshFollowing = useCallback(async () => {
    await loadFollowingUsers(true)
  }, [loadFollowingUsers])

  // Cargar datos al montar
  useEffect(() => {
    mountedRef.current = true
    loadFollowingUsers()

    return () => {
      mountedRef.current = false
    }
  }, [loadFollowingUsers])

  const value: FollowingContextType = {
    followingIds,
    followingUsers,
    isFollowing,
    addFollowing,
    removeFollowing,
    refreshFollowing,
    isLoading,
    error
  }

  return (
    <FollowingContext.Provider value={value}>
      {children}
    </FollowingContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de usuarios seguidos
 * 
 * @throws Error si se usa fuera del FollowingProvider
 * 
 * @example
 * ```tsx
 * const { isFollowing, addFollowing, removeFollowing } = useFollowingContext()
 * ```
 */
export function useFollowingContext(): FollowingContextType {
  const context = useContext(FollowingContext)
  
  if (context === undefined) {
    throw new Error('useFollowingContext must be used within a FollowingProvider')
  }
  
  return context
}

/**
 * Función utilitaria para limpiar el caché
 */
export function clearFollowingCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('following_users_cache')
    localStorage.removeItem('following_users_cache_timestamp')
    console.log('🧹 Caché de usuarios seguidos limpiado')
  }
}

