import { useState, useEffect } from 'react'
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

  const fetchSavedPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await profileService.getSavedPosts()
      setPosts(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar publicaciones guardadas'))
    } finally {
      setLoading(false)
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

