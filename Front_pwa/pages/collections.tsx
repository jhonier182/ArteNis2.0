import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  Bookmark,
  Send,
  MessageCircle,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'

interface SavedPost {
  id: number
  title: string
  description: string
  mediaUrl: string
  likesCount: number
  commentsCount: number
  User: {
    id: number
    username: string
    fullName: string
    avatar: string | null
    userType: string
  }
}

export default function CollectionsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedPosts()
    }
  }, [isAuthenticated])

  const loadSavedPosts = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/api/boards/my-boards')
      const boards = response.data.data?.boards || []
      
      // Combinar todos los posts de todos los boards
      const allPosts: SavedPost[] = []
      boards.forEach((board: any) => {
        if (board.Posts) {
          allPosts.push(...board.Posts)
        }
      })
      
      setSavedPosts(allPosts)
    } catch (error) {
      console.error('Error al cargar colecciones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePost = async (postId: number) => {
    try {
      await apiClient.delete(`/api/boards/posts/${postId}`)
      setSavedPosts(savedPosts.filter(post => post.id !== postId))
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar la publicación')
    }
  }

  const handleSendAsReference = (post: SavedPost) => {
    setSelectedPost(post)
    setShowSendModal(true)
  }

  const sendToArtist = (artistId: number) => {
    // Guardar la referencia en localStorage
    localStorage.setItem('referencePost', JSON.stringify(selectedPost))
    // Navegar al chat con el artista
    router.push(`/chat/${artistId}`)
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>Colecciones - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container-mobile px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Mis Colecciones</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : savedPosts.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              {savedPosts.length} publicación{savedPosts.length !== 1 ? 'es' : ''} guardada{savedPosts.length !== 1 ? 's' : ''}
            </p>
            
            {savedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
              >
                {/* Post Image */}
                {post.mediaUrl && (
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => router.push(`/post/${post.id}`)}
                  >
                    <img
                      src={post.mediaUrl}
                      alt={post.title || 'Post'}
                      className="w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-white">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.likesCount}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-white">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.commentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Info */}
                <div className="p-4">
                  {post.title && (
                    <h3 className="font-semibold mb-1">{post.title}</h3>
                  )}
                  {post.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.description}</p>
                  )}
                  
                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => router.push(`/user/${post.User.id}`)}
                      className="flex items-center space-x-2 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        {post.User.avatar ? (
                          <img
                            src={post.User.avatar}
                            alt={post.User.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {post.User.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-blue-500 transition-colors truncate">
                          {post.User.username}
                        </p>
                        {post.User.userType === 'artist' && (
                          <p className="text-xs text-gray-500">Artista</p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      {post.User.userType === 'artist' && (
                        <button
                          onClick={() => handleSendAsReference(post)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Enviar
                        </button>
                      )}
                      <button
                        onClick={() => handleRemovePost(post.id)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <Bookmark className="w-5 h-5 fill-blue-500 text-blue-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tienes publicaciones guardadas</h3>
            <p className="text-gray-400 mb-6">
              Guarda tatuajes que te inspiren para usarlos como referencia
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Explorar tatuajes
            </button>
          </div>
        )}
      </main>

      {/* Send Reference Modal */}
      {showSendModal && selectedPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold mb-4">Enviar como referencia</h2>
            <p className="text-gray-400 mb-4">
              ¿Quieres enviar esta publicación al chat con <span className="text-white font-semibold">{selectedPost.User.fullName || selectedPost.User.username}</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => sendToArtist(selectedPost.User.id)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Enviar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

