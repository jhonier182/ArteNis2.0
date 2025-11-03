import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/utils/apiClient'

interface FollowingUser {
  id: string
  username: string
  fullName: string
  avatar?: string
}

interface UseFollowingReturn {
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

// Flag para evitar múltiples llamadas simultáneas
let isLoadingGlobally = false

export function useFollowing(): UseFollowingReturn {
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadFollowingUsers = useCallback(async (forceRefresh = false) => {
    // Verificar si ya hay datos en caché y no es muy antiguo
    const now = Date.now()
    if (!forceRefresh && globalFollowingCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
      if (mountedRef.current) {
        setFollowingUsers(globalFollowingCache)
        setIsLoading(false)
      }
      return globalFollowingCache
    }

    // Evitar múltiples llamadas simultáneas
    if (isLoadingGlobally) {
      // Esperar a que termine la llamada actual
      let attempts = 0
      while (isLoadingGlobally && attempts < 50) { // Máximo 5 segundos de espera
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      // Si hay caché después de la espera, usarlo
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

      const response = await apiClient.get('/api/follow/following')
      const following = response.data.data.followingUsers || []
      
      // Actualizar caché global
      globalFollowingCache = following
      globalCacheTimestamp = now

      if (mountedRef.current) {
        setFollowingUsers(following)
        setIsLoading(false)
      }

      return following

    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Error al cargar usuarios seguidos')
        setIsLoading(false)
      }
      return []
    } finally {
      isLoadingGlobally = false
    }
  }, [])

  const isFollowing = useCallback((userId: string): boolean => {
    return followingUsers.some(user => user.id === userId)
  }, [followingUsers])

  const refreshFollowing = useCallback(async () => {
    await loadFollowingUsers(true)
  }, [loadFollowingUsers])

  // Cargar datos al montar el componente
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

// Función utilitaria para limpiar el caché cuando sea necesario
export const clearFollowingCache = () => {
  globalFollowingCache = null
  globalCacheTimestamp = 0
}
