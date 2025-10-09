import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { 
  Home, 
  Search, 
  Users,
  User,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Download,
  TrendingUp,
  Bell
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'
import { useInfinitePosts } from '@/hooks/useInfiniteScroll'
import { InfiniteScrollTrigger } from '@/components/LoadingIndicator'

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

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useUser()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const router = useRouter()

  // Hook de scroll infinito para posts de usuarios seguidos
  const {
    data: posts,
    loading: loadingPosts,
    hasMore,
    error,
    loadMore,
    reset: resetPosts,
    setData: setPosts
  } = useInfinitePosts<Post>('/api/posts/following', {}, {
    enabled: isAuthenticated && user?.userType !== 'artist'
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    
    // Si es tatuador, redirigir a su perfil
    if (!isLoading && isAuthenticated && user?.userType === 'artist') {
      router.push('/profile')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.userType !== 'artist') {
      loadSavedPosts()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      ;(window as any).deferredPrompt = e
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])


  const loadSavedPosts = async () => {
    try {
      const response = await apiClient.get('/api/boards/me/boards')
      const boards = response.data.data?.boards || []
      const savedPostIds = new Set<string>()
      
      boards.forEach((board: any) => {
        board.Posts?.forEach((post: any) => {
          savedPostIds.add(post.id.toString())
        })
      })
      
      setSavedPosts(savedPostIds)
    } catch (error) {
      console.error('Error al cargar posts guardados:', error)
      // No mostrar error al usuario, simplemente no cargar guardados
      setSavedPosts(new Set())
    }
  }

  const handleSavePost = async (postId: string) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para guardar publicaciones')
      router.push('/login')
      return
    }

    try {
      if (savedPosts.has(postId)) {
        // Remover de guardados - buscar el board que contiene este post
        const response = await apiClient.get('/api/boards/me/boards')
        const boards = response.data?.data?.boards || []
        
        for (const board of boards) {
          const hasPost = board.Posts?.some((post: any) => post.id === postId)
          if (hasPost) {
            await apiClient.delete(`/api/boards/${board.id}/posts/${postId}`)
            break
          }
        }
        
        setSavedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Agregar a guardados - usar el board por defecto o crear uno
        let defaultBoard = null
        
        // Buscar un board por defecto o crear uno
        const response = await apiClient.get('/api/boards/me/boards')
        const boards = response.data?.data?.boards || []
        
        if (boards.length === 0) {
          // Crear board por defecto
          const createResponse = await apiClient.post('/api/boards', {
            name: 'Mis Favoritos',
            description: 'Publicaciones que me gustan'
          })
          defaultBoard = createResponse.data?.data?.board
        } else {
          // Usar el primer board disponible
          defaultBoard = boards[0]
        }
        
        if (defaultBoard) {
          await apiClient.post(`/api/boards/${defaultBoard.id}/posts`, { postId })
          setSavedPosts(prev => new Set([...prev, postId]))
        }
      }
    } catch (error: any) {
      console.error('Error al guardar post:', error)
      alert(error.response?.data?.message || 'Error al guardar la publicación')
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Actualización optimista - actualizar UI inmediatamente
      const updatedPosts = posts.map((post: Post) => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked || false
          return {
            ...post,
            isLiked: !isCurrentlyLiked,
            likesCount: isCurrentlyLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        }
        return post
      })
      setPosts(updatedPosts)

      // Hacer la petición al backend
      await apiClient.post(`/api/posts/${postId}/like`)
    } catch (error) {
      console.error('Error al dar like:', error)
      
      // Revertir cambios en caso de error
      const revertedPosts = posts.map((post: Post) => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked || false
          return {
            ...post,
            isLiked: !isCurrentlyLiked,
            likesCount: isCurrentlyLiked ? post.likesCount + 1 : post.likesCount - 1
          }
        }
        return post
      })
      setPosts(revertedPosts)
    }
  }

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt
    if (!promptEvent) {
      return
    }

    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA')
    }
    
    ;(window as any).deferredPrompt = null
    setShowInstallPrompt(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.userType === 'artist') {
    return null // Redirección manejada por useEffect
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>InkEndin - Inicio</title>
      </Head>
      
          {/* Header */}
          <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
            <div className="container-mobile px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  InkEndin
                </h1>
                <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

      {/* Install PWA Banner */}
      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 border-b border-gray-800"
        >
          <div className="container-mobile flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Instala InkEndin en tu dispositivo</span>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Instalar InkEndin
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="container-mobile">
        {loadingPosts ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 px-4"
              >
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No sigues a ningún tatuador</h3>
                <p className="text-gray-400 mb-6">Descubre y sigue a tatuadores para ver sus publicaciones aquí</p>
                <button
                  onClick={() => router.push('/search')}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>Descubrir tatuadores</span>
                </button>
              </motion.div>
            ) : (
          <div className="py-4">
            {/* Grid limpio solo con imágenes */}
            <div className="columns-2 gap-2 px-2">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="break-inside-avoid mb-2"
                >
                  {post.mediaUrl && (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => router.push(`/post/${post.id}`)}
                    >
                      <img
                        src={post.mediaUrl}
                        alt={post.title || 'Post'}
                        className="w-full object-cover"
                      />
                      {/* Overlay sutil al hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                        {/* Información mínima en hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                          <div className="flex items-center gap-3 text-white text-sm font-medium">
                            <div className="flex items-center gap-1">
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              <span>{post.likesCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.commentsCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Indicador de scroll infinito */}
            <InfiniteScrollTrigger
              loading={loadingPosts}
              hasMore={hasMore}
              error={error}
              onRetry={loadMore}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f26] border-t border-gray-800 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="container-mobile flex items-center justify-around h-16">
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center py-2 px-3 text-blue-500"
          >
            <Home className="w-6 h-6 mb-1 fill-blue-500" />
            <span className="text-xs font-medium">Inicio</span>
          </button>
          
          <button
            onClick={() => router.push('/search')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Buscar</span>
          </button>
          
          <button
            onClick={() => router.push('/chat')}
            className="flex flex-col items-center py-2 px-3 text-gray-400 relative"
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs">Chat</span>
            <span className="absolute top-1 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}