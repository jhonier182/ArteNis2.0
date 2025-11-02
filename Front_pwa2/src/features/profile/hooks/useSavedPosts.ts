import { useState, useEffect, useRef } from 'react'
import { profileService, SavedPost } from '../services/profileService'

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
  const [posts, setPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchingRef = useRef(false) // Prevenir llamadas duplicadas

  const fetchSavedPosts = async () => {
    // Evitar llamadas duplicadas simultáneas (útil en StrictMode)
    if (fetchingRef.current) {
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)
      const result = await profileService.getSavedPosts()
      setPosts(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar publicaciones guardadas'))
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    fetchSavedPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    refetch: fetchSavedPosts,
  }
}

