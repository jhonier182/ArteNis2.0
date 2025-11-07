import { useState, useEffect, useRef } from 'react'
import { profileService, SavedPost } from '../services/profileService'
import { useAuth } from '@/context/AuthContext'
import { cacheSavedPosts, getCachedSavedPosts } from '@/utils/cache'

interface UseSavedPostsResult {
  posts: SavedPost[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener las publicaciones guardadas del usuario
 */
export function useSavedPosts(): UseSavedPostsResult {
  const { user } = useAuth()
  const [posts, setPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchingRef = useRef(false) // Prevenir llamadas duplicadas

  const fetchSavedPosts = async (forceRefresh: boolean = false) => {
    // Evitar llamadas duplicadas simultáneas (útil en StrictMode)
    if (fetchingRef.current) {
      return
    }

    // Si no hay usuario, no hacer nada
    if (!user?.id) {
      setLoading(false)
      return
    }

    // Verificar caché primero (solo si no es forzado)
    if (!forceRefresh) {
      const cachedPosts = getCachedSavedPosts(user.id)
      if (cachedPosts) {
        // Posts en caché: establecer inmediatamente y NO hacer llamada
        setPosts(cachedPosts)
        setLoading(false)
        return
      }
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)
      const result = await profileService.getSavedPosts()
      
      // Guardar en caché
      cacheSavedPosts(user.id, result)
      
      setPosts(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar publicaciones guardadas'))
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    if (user?.id) {
      // Verificar caché primero antes de hacer la llamada
      const cachedPosts = getCachedSavedPosts(user.id)
      if (cachedPosts) {
        // Posts en caché: establecer inmediatamente sin mostrar loading
        setPosts(cachedPosts)
        setLoading(false)
        // NO hacer llamada si hay caché válido
        return
      }
      
      // No hay caché: cargar desde API
      fetchSavedPosts(false)
    } else {
      setLoading(false)
    }
  }, [user?.id])

  return {
    posts,
    loading,
    error,
    refetch: fetchSavedPosts,
  }
}

