import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  Download
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'

interface Post {
  id: string
  content: string
  imageUrl?: string
  author: {
    id: string
    username: string
    profileImage?: string
  }
  likes: number
  comments: number
  createdAt: string
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Detectar si se puede instalar la PWA
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
      const response = await apiClient.get('/api/posts')
      setPosts(response.data?.data?.posts || [])
    } catch (error) {
      console.error('Error al cargar posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await apiClient.post(`/api/posts/${postId}/like`)
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head>
        <title>ArteNis 2.0 - Inicio</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 safe-top">
        <div className="container-mobile px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ArteNis
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-6 h-6 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MessageCircle className="w-6 h-6 text-gray-600" />
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
          className="bg-blue-500 text-white p-4"
        >
          <div className="container-mobile flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Instala ArteNis en tu dispositivo</span>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Instalar
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay publicaciones aún</h3>
            <p className="text-gray-500 mb-6">Sé el primero en compartir tu arte</p>
            <Link
              href="/create"
              className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear publicación</span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4 p-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      {post.author.profileImage ? (
                        <img
                          src={post.author.profileImage}
                          alt={post.author.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="px-4 pb-3 text-gray-900">{post.content}</p>
                )}
                
                {post.imageUrl && (
                  <div className="w-full">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full object-cover max-h-96"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors group"
                    >
                      <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors group">
                      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="text-gray-600 hover:text-green-500 transition-colors group">
                      <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <button className="text-gray-600 hover:text-yellow-500 transition-colors group">
                    <Bookmark className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
        <div className="container-mobile flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} />
            <span className="text-xs mt-1 font-medium">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              activeTab === 'explore' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Explorar</span>
          </button>
          <Link
            href="/create"
            className="flex flex-col items-center py-2 px-3 text-gray-600"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full -mt-4 shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </Link>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              activeTab === 'messages' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Mensajes</span>
          </button>
          <Link
            href="/profile"
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
