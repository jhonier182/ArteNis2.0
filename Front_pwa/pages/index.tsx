import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
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
import { useUser } from '../context/UserContext'
import { boardService } from '../services/boardService'
import { useInfinitePosts } from '../hooks/useInfiniteScroll'
import { InfiniteScrollTrigger } from '../components/LoadingIndicator'
import { useAlert, AlertContainer } from '../components/Alert'
import { useFollowing } from '../hooks/useFollowing'
import { postService } from '../services/postService'

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

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  }
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useUser()
  const { followingUsers } = useFollowing()
  const { alerts, success, error: showAlert, removeAlert } = useAlert()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const router = useRouter()
  

  // Hook de scroll infinito para posts de usuarios seguidos
  const {
    data: posts,
    loading: loadingPosts,
    isInitialLoading,
    hasMore,
    error,
    loadMore,
    reset: resetPosts,
    setData: setPosts,
    refresh: refreshPosts
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
  }, [isAuthenticated, user?.userType]) // Optimizado: solo userType, no el objeto completo

  // Refrescar el feed cuando cambien los usuarios seguidos (OPTIMIZADO)
  useEffect(() => {
    if (isAuthenticated && user?.userType !== 'artist' && followingUsers.length > 0) {
      refreshPosts()
    }
  }, [followingUsers.length, isAuthenticated, user?.userType]) // Removido refreshPosts de las dependencias

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
      // Usar boardService en lugar de llamada directa
      const savedIds = await boardService.getSavedPostIds()
      setSavedPostIds(savedIds)
    } catch (error) {
      // No mostrar error al usuario, simplemente no cargar guardados
      setSavedPostIds(new Set())
    }
  }

  // Función simplificada que usa boardService directamente
  // Nota: useSavePost hook está diseñado para un solo post, 
  // pero aquí necesitamos actualizar savedPostIds Set, por eso usamos el servicio directamente
  const handleSavePost = async (postId: string) => {
    if (!isAuthenticated) {
      showAlert('Acceso denegado', 'Debes iniciar sesión para guardar publicaciones')
      router.push('/login')
      return
    }

    try {
      const isCurrentlySaved = savedPostIds.has(postId)
      
      if (isCurrentlySaved) {
        // Remover de guardados usando boardService
        const savedInfo = await boardService.isPostSaved(postId)
        
        if (savedInfo.isSaved && savedInfo.boardId) {
          await boardService.removePostFromBoard(savedInfo.boardId, postId)
        } else {
          // Si no encontramos el board, buscar manualmente
          const boardsResponse = await boardService.getMyBoards()
          const boards = boardsResponse.data?.boards || []
          
          for (const board of boards) {
            const hasPost = board.Posts?.some((post) => post.id === postId)
            if (hasPost) {
              await boardService.removePostFromBoard(board.id, postId)
              break
            }
          }
        }
        // Actualizar estado local
        setSavedPostIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Agregar a guardados usando boardService
        const defaultBoard = await boardService.getOrCreateDefaultBoard()
        await boardService.addPostToBoard(defaultBoard.id, postId)
        // Actualizar estado local
        setSavedPostIds(prev => new Set([...prev, postId]))
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      const errorMessage = errorObj.response?.data?.message || 'No se pudo guardar la publicación'
      showAlert('Error al guardar', errorMessage)
    }
  }

  // Función simplificada que usa postService directamente con actualización optimista
  // Nota: useLikePost hook está diseñado para un solo post,
  // pero aquí necesitamos actualizar el array de posts, por eso usamos el servicio directamente
  const handleLike = async (postId: string) => {
    try {
      // Encontrar el post actual para obtener estado previo
      const currentPost = posts.find((post: Post) => post.id === postId)
      if (!currentPost) return

      const previousIsLiked = currentPost.isLiked || false
      const previousLikesCount = currentPost.likesCount || 0

      // Actualización optimista - actualizar UI inmediatamente
      const updatedPosts = posts.map((post: Post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !previousIsLiked,
            likesCount: previousIsLiked ? previousLikesCount - 1 : previousLikesCount + 1
          }
        }
        return post
      })
      setPosts(updatedPosts)

      // Llamar al servicio para toggle del like
      const response = await postService.toggleLike(postId)
      
      // Actualizar con la respuesta real del servidor
      if (response.success && response.data) {
        const { isLiked, likesCount } = response.data
        const finalPosts = updatedPosts.map((post: Post) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: isLiked,
              likesCount: likesCount
            }
          }
          return post
        })
        setPosts(finalPosts)
      }
    } catch (error) {
      // Revertir cambios en caso de error
      const currentPost = posts.find((post: Post) => post.id === postId)
      if (currentPost) {
        const previousIsLiked = currentPost.isLiked || false
        const previousLikesCount = currentPost.likesCount || 0
        const revertedPosts = posts.map((post: Post) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !previousIsLiked,
              likesCount: previousIsLiked ? previousLikesCount + 1 : previousLikesCount - 1
            }
          }
          return post
        })
        setPosts(revertedPosts)
      }
      
      showAlert('Error', 'No se pudo actualizar el like')
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
        {isInitialLoading ? (
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
                      <Image
                        src={post.mediaUrl}
                        alt={post.title || 'Post'}
                        width={400}
                        height={256}
                        className="w-full object-cover"
                      />
                      {/* Overlay sutil al hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                        {/* Información mínima en hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                          <div className="flex items-center gap-3 text-white text-sm font-medium">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLike(post.id)
                              }}
                              className="flex items-center gap-1 hover:scale-110 transition-transform"
                            >
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              <span>{post.likesCount}</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/post/${post.id}`)
                              }}
                              className="flex items-center gap-1 hover:scale-110 transition-transform"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.commentsCount}</span>
                            </button>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f26] border-t border-gray-800 z-50 safe-bottom bottom-nav-ios">
        <div className="flex items-center justify-around h-20 px-2">
          <button 
            onClick={() => router.push('/')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-blue-500 min-w-0 flex-1"
          >
            <Home className="w-6 h-6 mb-1 fill-blue-500" />
            <span className="text-xs font-medium truncate">Inicio</span>
          </button>
          
          <button
            onClick={() => router.push('/search')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate">Buscar</span>
          </button>
          
          <button
            onClick={() => router.push('/chat')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1 relative"
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate">Chat</span>
            <span className="absolute top-1 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Alert Container */}
      <AlertContainer alerts={alerts} />
    </div>
  )
}