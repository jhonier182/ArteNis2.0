import { useState, useEffect, useCallback } from 'react'
import { profileService, UserPost } from '../services/profileService'

interface UseUserPostsResult {
  posts: UserPost[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => Promise<void>
  reset: () => void
}

/**
 * Hook para obtener posts de un usuario con scroll infinito
 */
export function useUserPosts(userId: string | undefined): UseUserPostsResult {
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = useCallback(async (pageNum: number) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const result = await profileService.getUserPosts(userId, pageNum, 10)
      
      if (pageNum === 1) {
        setPosts(result.posts)
      } else {
        setPosts(prev => [...prev, ...result.posts])
      }
      
      setHasMore(result.pagination.hasNext)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar posts'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    const nextPage = page + 1
    await fetchPosts(nextPage)
    setPage(nextPage)
  }, [page, loading, hasMore, fetchPosts])

  const reset = useCallback(() => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    setError(null)
    fetchPosts(1)
  }, [fetchPosts])

  useEffect(() => {
    if (userId) {
      reset()
    }
  }, [userId, reset])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  }
}

