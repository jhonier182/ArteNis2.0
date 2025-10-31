import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/utils/apiClient'

interface Post {
  id: string
  title?: string
  description?: string
  mediaUrl?: string
  thumbnailUrl?: string
  type: 'image' | 'video' | 'reel'
  User?: {
    id: string
    username: string
    fullName: string
    avatar?: string
    userType: string
  }
  likesCount: number
  commentsCount: number
  viewsCount: number
  createdAt: string
  publishedAt?: string
  isLiked?: boolean
}

interface UseSearchPostsReturn {
  posts: Post[]
  isLoading: boolean
  error: string | null
  refreshPosts: () => Promise<void>
  loadFilteredPosts: (followingIds: string[], userId?: string) => Promise<Post[]>
}

// Caché global para evitar llamadas duplicadas
let globalPostsCache: Post[] | null = null
let globalCacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 60 segundos (más tiempo porque los posts cambian menos frecuentemente)

// Flag para evitar múltiples llamadas simultáneas
let isLoadingGlobally = false

export function useSearchPosts(): UseSearchPostsReturn {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadSearchPosts = useCallback(async (forceRefresh = false) => {
    // Verificar si ya hay datos en caché y no es muy antiguo
    const now = Date.now()
    if (!forceRefresh && globalPostsCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
      if (mountedRef.current) {
        setPosts(globalPostsCache)
        setIsLoading(false)
      }
      return globalPostsCache
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
      if (globalPostsCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
        if (mountedRef.current) {
          setPosts(globalPostsCache)
          setIsLoading(false)
        }
        return globalPostsCache
      }
    }

    try {
      isLoadingGlobally = true
      if (mountedRef.current) {
        setIsLoading(true)
        setError(null)
      }

      console.log('🔄 Cargando posts de búsqueda...')
      const response = await apiClient.get('/api/search/posts?limit=50')
      let rawPosts = response.data.data.posts || []
      
      // Normalizar la estructura de datos (el backend devuelve 'author' en lugar de 'User')
      const normalizedPosts = rawPosts.map((post: any) => ({
        ...post,
        User: post.author || post.User
      }))
      
      // Actualizar caché global
      globalPostsCache = normalizedPosts
      globalCacheTimestamp = now

      if (mountedRef.current) {
        setPosts(normalizedPosts)
        setIsLoading(false)
      }

      console.log(`✅ Posts de búsqueda cargados: ${normalizedPosts.length}`)
      return normalizedPosts

    } catch (err: any) {
      console.error('❌ Error cargando posts de búsqueda:', err)
      if (mountedRef.current) {
        setError(err.message || 'Error al cargar publicaciones')
        setIsLoading(false)
      }
      return []
    } finally {
      isLoadingGlobally = false
    }
  }, [])

  const loadFilteredPosts = useCallback(async (followingIds: string[], userId?: string): Promise<Post[]> => {
    try {
      // Cargar posts si no están en caché
      const allPosts = await loadSearchPosts()
      
      if (!allPosts.length) return []
      
      // Filtrar publicaciones propias del usuario y de usuarios que ya sigue
      const filteredPosts = allPosts.filter((post: Post) => {
        const postUserId = post.User?.id
        const postUserIdStr = String(postUserId)
        const userIdStr = String(userId)
        
        // Excluir publicaciones propias
        if (userId && postUserIdStr === userIdStr) {
          return false
        }
        
        // Excluir publicaciones de usuarios que ya sigue
        const isFollowing = followingIds.some(followingId => String(followingId) === postUserIdStr)
        if (isFollowing) {
          return false
        }
        
        return true
      })
      
      // Agrupar por usuario y tomar solo las 2 más recientes de cada uno
      const userPostsMap = new Map<string, Post[]>()
      filteredPosts.forEach((post: Post) => {
        const userId = post.User?.id
        if (userId) {
          if (!userPostsMap.has(userId)) {
            userPostsMap.set(userId, [])
          }
          userPostsMap.get(userId)!.push(post)
        }
      })
      
      // Tomar solo las 2 más recientes de cada usuario
      const finalFilteredPosts: Post[] = []
      userPostsMap.forEach((userPosts: Post[]) => {
        const sortedPosts = userPosts.sort((a: Post, b: Post) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        finalFilteredPosts.push(...sortedPosts.slice(0, 2))
      })
      
      // Ordenar por fecha de creación (más recientes primero)
      finalFilteredPosts.sort((a: Post, b: Post) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      const finalPosts = finalFilteredPosts.slice(0, 20) // Limitar a 20 posts total
      
      console.log(`✅ Posts filtrados: ${finalPosts.length} de ${allPosts.length} totales`)
      return finalPosts
      
    } catch (error) {
      console.error('❌ Error filtrando posts:', error)
      return []
    }
  }, [loadSearchPosts])

  const refreshPosts = useCallback(async () => {
    await loadSearchPosts(true)
  }, [loadSearchPosts])

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSearchPosts()
    
    return () => {
      mountedRef.current = false
    }
  }, [loadSearchPosts])

  return {
    posts,
    isLoading,
    error,
    refreshPosts,
    loadFilteredPosts
  }
}

// Función utilitaria para limpiar el caché cuando sea necesario
export const clearSearchPostsCache = () => {
  globalPostsCache = null
  globalCacheTimestamp = 0
  console.log('🧹 Caché de posts de búsqueda limpiado')
}
