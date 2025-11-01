import { useState, useEffect } from 'react'
import { postService, Post, PostFilters } from '../services/postService'

interface UsePostsResult {
  posts: Post[]
  loading: boolean
  error: Error | null
  total: number
  refetch: () => Promise<void>
}

/**
 * Hook para obtener y gestionar posts
 */
export function usePosts(filters?: PostFilters): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await postService.getPosts(filters)
      setPosts(result.posts)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar posts'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return {
    posts,
    loading,
    error,
    total,
    refetch: fetchPosts,
  }
}

