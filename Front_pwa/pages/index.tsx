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
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const router = useRouter()

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
      fetchPosts()
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

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true)
      // Solo cargar posts de usuarios seguidos
      const response = await apiClient.get('/api/posts/following')
      const postsData = response.data?.data?.posts || response.data?.data || []
      setPosts(postsData)
      
      // Cargar posts guardados
      loadSavedPosts()
    } catch (error) {
      console.error('Error al cargar posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

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
    try {
      // TODO: Implementar sistema de guardado con boards
      // Por ahora, mostrar mensaje informativo
      alert('Sistema de guardado en desarrollo. Próximamente podrás guardar publicaciones en tus colecciones.')
      
      /* IMPLEMENTACIÓN FUTURA:
      if (savedPosts.has(postId)) {
        // Remover de guardados
        await apiClient.delete(`/api/boards/${boardId}/posts/${postId}`)
        setSavedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Guardar post - necesita boardId
        await apiClient.post(`/api/boards/${boardId}/posts`, { postId })
        setSavedPosts(prev => new Set(prev).add(postId))
      }
      */
    } catch (error: any) {
      console.error('Error al guardar post:', error)
      alert(error.response?.data?.message || 'Error al guardar la publicación')
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await apiClient.post(`/api/posts/${postId}/like`)
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likesCount: post.likesCount + 1 }
          : post
      ))
    } catch (error) {
      console.error('Error al dar like:', error)
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
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
                    <TrendingUp className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                  </button>
                  <button 
                    onClick={() => router.push('/chat')}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
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
            {/* Pinterest-style Masonry Grid */}
            <div className="columns-2 gap-3 px-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="break-inside-avoid mb-3"
                >
                  <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
                    {/* Post Image */}
                    {post.mediaUrl && (
                      <div className="relative group cursor-pointer">
                        <img
                          src={post.mediaUrl}
                          alt={post.title || 'Post'}
                          className="w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLike(post.id)
                                }}
                                className="flex items-center space-x-1 text-white"
                              >
                                <Heart className="w-5 h-5" />
                                <span className="text-sm font-medium">{post.likesCount}</span>
                              </button>
                              <div className="flex items-center space-x-1 text-white">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{post.commentsCount}</span>
                              </div>
                            </div>
                            <button className="text-white">
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Post Info */}
                    <div className="p-3">
                      {post.title && (
                        <h3 className="font-semibold mb-1 line-clamp-2">{post.title}</h3>
                      )}
                      {post.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.description}</p>
                      )}
                      
                      {/* Author */}
                      <Link href={`/user/${post.User?.id}`} className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          {post.User?.avatar ? (
                            <img
                              src={post.User.avatar}
                              alt={post.User.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-blue-500 transition-colors truncate">
                            {post.User?.username || 'Usuario'}
                          </p>
                          {post.User?.userType === 'artist' && (
                            <p className="text-xs text-gray-500">Artista</p>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            handleSavePost(post.id)
                          }}
                          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                          <Bookmark 
                            className={`w-5 h-5 transition-colors ${
                              savedPosts.has(post.id)
                                ? 'fill-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-blue-500'
                            }`} 
                          />
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f1419] border-t border-gray-800 z-50 safe-bottom">
        <div className="container-mobile flex items-center justify-around py-2">
          <button className="flex flex-col items-center py-2 px-3 text-blue-500">
            <Home className="w-6 h-6 mb-1" fill="currentColor" />
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