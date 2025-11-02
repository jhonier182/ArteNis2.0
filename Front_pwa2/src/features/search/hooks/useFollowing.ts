import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/services/apiClient'

interface FollowingUser {
  id: string
  username: string
  fullName: string
  avatar?: string
}

interface UseFollowingResult {
  followingUsers: FollowingUser[]
  isLoading: boolean
  error: string | null
  isFollowing: (userId: string) => boolean
  refreshFollowing: () => Promise<void>
}

// Caché global para evitar llamadas duplicadas
let globalFollowingCache: FollowingUser[] | null = null
let globalCacheTimestamp: number = 0
const CACHE_DURATION = 30000 // 30 segundos
let isLoadingGlobally = false

/**
 * Hook para manejar usuarios seguidos con caché
 * 
 * @example
 * ```tsx
 * const { followingUsers, isFollowing, refreshFollowing } = useFollowing()
 * ```
 */
export function useFollowing(): UseFollowingResult {
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadFollowingUsers = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    
    if (!forceRefresh && globalFollowingCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
      if (mountedRef.current) {
        setFollowingUsers(globalFollowingCache)
        setIsLoading(false)
      }
      return globalFollowingCache
    }

    if (isLoadingGlobally) {
      let attempts = 0
      while (isLoadingGlobally && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts++
      }

      if (globalFollowingCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
        if (mountedRef.current) {
          setFollowingUsers(globalFollowingCache)
          setIsLoading(false)
        }
        return globalFollowingCache
      }
    }

    try {
      isLoadingGlobally = true
      if (mountedRef.current) {
        setIsLoading(true)
        setError(null)
      }

      const response = await apiClient.getClient().get<{
        success: boolean
        data: { followingUsers: FollowingUser[] }
      }>('/follow/following')

      const following = response.data.data?.followingUsers || []

      globalFollowingCache = following
      globalCacheTimestamp = now

      if (mountedRef.current) {
        setFollowingUsers(following)
        setIsLoading(false)
      }

      return following
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error al cargar usuarios seguidos')
      console.error('Error cargando usuarios seguidos:', err)
      if (mountedRef.current) {
        setError(error.message || 'Error al cargar usuarios seguidos')
        setIsLoading(false)
      }
      return []
    } finally {
      isLoadingGlobally = false
    }
  }, [])

  const isFollowing = useCallback(
    (userId: string): boolean => {
      return followingUsers.some((user) => user.id === userId)
    },
    [followingUsers]
  )

  const refreshFollowing = useCallback(async () => {
    await loadFollowingUsers(true)
  }, [loadFollowingUsers])

  useEffect(() => {
    loadFollowingUsers()

    return () => {
      mountedRef.current = false
    }
  }, [loadFollowingUsers])

  return {
    followingUsers,
    isLoading,
    error,
    isFollowing,
    refreshFollowing
  }
}

/**
 * Función utilitaria para limpiar el caché
 */
export const clearFollowingCache = () => {
  globalFollowingCache = null
  globalCacheTimestamp = 0
  console.log('🧹 Caché de usuarios seguidos limpiado')
}

