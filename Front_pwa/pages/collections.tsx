import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Bookmark, 
  Heart, 
  MessageCircle, 
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import apiClient from '../services/apiClient'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function CollectionsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user?.userType !== 'user') {
      router.push('/profile')
      return
    }

    loadSavedPosts()
  }, [isAuthenticated, user])

  useEffect(() => {
    if (searchTerm) {
      const filtered = savedPosts.filter(post => 
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(savedPosts)
    }
  }, [searchTerm, savedPosts])

  const loadSavedPosts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/boards/me/boards')
      console.log('Publicaciones guardadas:', response.data)
      
      // Extraer todas las publicaciones de todos los boards
      let allPosts = response.data?.data?.boards?.flatMap((board: any) => board.Posts || []) || []
      
      // Cargar información de likes para cada post si hay posts
      if (allPosts.length > 0 && isAuthenticated) {
        const likesPromises = allPosts.map(async (post: any) => {
          try {
            const likesResponse = await apiClient.get(`/api/posts/${post.id}/likes`)
            if (likesResponse.data.success) {
              const { isLiked, likesCount } = likesResponse.data.data
              return {
                ...post,
                isLiked: isLiked,
                likesCount: likesCount
              }
            }
          } catch (error) {
            console.log(`No se pudo cargar likes para post ${post.id}:`, error)
          }
          return post
        })
        
        allPosts = await Promise.all(likesPromises)
      }
      
      setSavedPosts(allPosts)
      setFilteredPosts(allPosts)
    } catch (error) {
      console.error('Error al cargar publicaciones guardadas:', error)
      setSavedPosts([])
      setFilteredPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromCollection = async (postId: string) => {
    try {
      // Aquí implementarías la lógica para remover de la colección
      console.log('Remover post:', postId)
      // Por ahora solo actualizamos el estado local
      setSavedPosts(prev => prev.filter(post => post.id !== postId))
      setFilteredPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error al remover de colección:', error)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Actualización optimista - actualizar UI inmediatamente
      const updatedSavedPosts = savedPosts.map((post: any) => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked || false
          console.log(`🔄 Toggle like para post ${postId}: ${isCurrentlyLiked} -> ${!isCurrentlyLiked}`)
          return {
            ...post,
            isLiked: !isCurrentlyLiked,
            likesCount: isCurrentlyLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        }
        return post
      })
      setSavedPosts(updatedSavedPosts)
      setFilteredPosts(updatedSavedPosts)

      // Hacer la petición al backend (toggle)
      const response = await apiClient.post(`/api/posts/${postId}/like`)
      
      // Actualizar con la respuesta real del servidor
      if (response.data.success) {
        const { isLiked, likesCount } = response.data.data
        console.log(`✅ Respuesta del servidor para post ${postId}: isLiked=${isLiked}, likesCount=${likesCount}`)
        const finalPosts = updatedSavedPosts.map((post: any) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: isLiked,
              likesCount: likesCount
            }
          }
          return post
        })
        setSavedPosts(finalPosts)
        setFilteredPosts(finalPosts)
      }
    } catch (error) {
      console.error('Error al dar like:', error)
      
      // Revertir cambios en caso de error
      const revertedPosts = savedPosts.map((post: any) => {
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
      setSavedPosts(revertedPosts)
      setFilteredPosts(revertedPosts)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <Head>
        <title>Mis Colecciones - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container-mobile px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Mis Colecciones</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container-mobile px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en tus colecciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="container-mobile px-4 pb-4">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{filteredPosts.length} publicaciones guardadas</span>
          <span>•</span>
          <span>{savedPosts.length} total</span>
        </div>
      </div>

      {/* Content */}
      <main className="container-mobile px-4 pb-20">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No tienes publicaciones guardadas'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Guarda publicaciones que te gusten para verlas aquí'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Explorar publicaciones
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/post/${post.id}`)}
                className={`relative rounded-2xl overflow-hidden bg-gray-800 group cursor-pointer ${
                  viewMode === 'grid' ? 'aspect-square' : 'flex h-24'
                }`}
              >
                {post.mediaUrl && (
                  <Image
                    src={post.mediaUrl}
                    alt={post.description || 'Post'}
                    width={300}
                    height={300}
                    className={`w-full object-cover ${
                      viewMode === 'grid' ? 'h-full' : 'w-24 h-full'
                    }`}
                  />
                )}
                
                {viewMode === 'list' && (
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {post.title || post.description || 'Sin título'}
                      </h3>
                      <p className="text-xs text-gray-400">
                        por @{post.author?.username || 'desconocido'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${
                  viewMode === 'list' ? 'hidden' : ''
                }`}>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white text-sm">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(post.id)
                        }}
                        className="flex items-center gap-1 hover:scale-110 transition-transform"
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{post.likesCount || 0}</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/post/${post.id}`)
                        }}
                        className="flex items-center gap-1 hover:scale-110 transition-transform"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount || 0}</span>
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromCollection(post.id)
                      }}
                      className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-red-400 fill-red-400" />
                    </button>
                  </div>
                </div>

                {/* Indicador de guardado */}
                <div className="absolute top-2 right-2">
                  <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}