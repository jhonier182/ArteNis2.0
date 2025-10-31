import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Search as SearchIcon,
  X,
  User,
  MapPin,
  Star,
  ChevronLeft,
  Heart,
  MessageCircle,
  UserPlus
} from 'lucide-react'
import apiClient from '../services/apiClient'
import { useUser } from '../context/UserContext'
import { useFollowing } from '../hooks/useFollowing'
import { useSearchPosts } from '../hooks/useSearchPosts'

// Tipos para los posts (compatible con la API)
interface Post {
  id: string
  title?: string
  mediaUrl?: string
  thumbnailUrl?: string
  type?: 'image' | 'video' | 'reel'
  likesCount: number
  commentsCount: number
  createdAt: string
  User: {
    id: string
    username: string
    fullName?: string
    avatar?: string
    userType: 'artist' | 'user'
  }
}

// Tipos para los usuarios
interface User {
  id: string
  username: string
  fullName?: string
  avatar?: string
  userType: 'artist' | 'user'
  city?: string
}

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function Search() {
  const router = useRouter()
  const { user } = useUser()
  const { followingUsers, isFollowing, refreshFollowing } = useFollowing()
  const { loadFilteredPosts } = useSearchPosts()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [publicPosts, setPublicPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Cargar publicaciones cuando se carguen los usuarios seguidos
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (user?.id && followingUsers.length >= 0 && isMounted) {
        setLoadingPosts(true)
        try {
          const followingIds = followingUsers.map(user => user.id)
          const filteredPosts = await loadFilteredPosts(followingIds, user.id)
          if (isMounted) {
            setPublicPosts(filteredPosts as Post[])
          }
        } catch (error) {
          console.error('Error cargando posts filtrados:', error)
          if (isMounted) {
            setPublicPosts([])
          }
        } finally {
          if (isMounted) {
            setLoadingPosts(false)
          }
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [user?.id, followingUsers, loadFilteredPosts]) // Depende de followingUsers del hook

  // Búsqueda reactiva con debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchQuery)
      }, 300) // Debounce de 300ms

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchUsers = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await apiClient.get(`/api/search/users?q=${encodeURIComponent(query)}`)
      setSearchResults(response.data.data.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUser = (userId: string) => {
    // Agregar a búsquedas recientes
    const user = searchResults.find(u => u.id === userId)
    if (user) {
      const newRecentSearches = [
        user.username,
        ...recentSearches.filter(search => search !== user.username)
      ].slice(0, 5) // Mantener solo 5 búsquedas recientes
      
      setRecentSearches(newRecentSearches)
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
    }
    
    // Navegar al perfil del usuario
    router.push(`/user/${userId}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleFollowUser = async (userId: string) => {
    try {
      await apiClient.post('/api/follow', { userId })
      // Refrescar la lista de usuarios seguidos usando el hook
      await refreshFollowing()
      
      // Refrescar las publicaciones para ocultar las del usuario recién seguido
      if (user?.id) {
        const followingIds = [...followingUsers.map(u => u.id), userId]
        const filteredPosts = await loadFilteredPosts(followingIds, user.id)
        setPublicPosts(filteredPosts as Post[])
      }
      
      console.log('Usuario seguido exitosamente')
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>Buscar - InkEndin</title>
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </Head>

      {/* Header con búsqueda */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container-mobile px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tatuadores..."
                className="w-full bg-gray-800 text-white pl-12 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                autoFocus={true}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile max-w-md mx-auto px-4 py-6">
              {!searchQuery ? (
                <div>
                  {/* Búsquedas recientes */}
                  {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-300">Recientes</h2>
                        <button
                          onClick={clearRecentSearches}
                    className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                        >
                    Borrar
                        </button>
                      </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(search)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      <SearchIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

            {/* Publicaciones Públicas */}
                  <div>
              <h2 className="text-base font-semibold text-gray-300 mb-3">Descubre Arte</h2>
              {loadingPosts ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : publicPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 auto-rows-[200px]">
                  {publicPosts.filter(post => post && post.id).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                    >
                      {/* Media completo */}
                      <button
                        onClick={() => router.push(`/post/${post.id}`)}
                        className="w-full h-full block relative group"
                      >
                        {post.mediaUrl ? (
                          <>
                            {post.type === 'video' ? (
                              <video
                                src={post.mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => e.currentTarget.pause()}
                              />
                            ) : (
                              <Image
                                src={post.mediaUrl}
                                alt={post.title || 'Post'}
                                width={400}
                                height={300}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {/* Overlay con icono de play para videos */}
                            {post.type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm">No hay publicaciones disponibles</p>
                </div>
              )}
                  </div>
                </div>
              ) : (
                <div>
                  {isSearching ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map((user, index) => (
                        <motion.button
                          key={user.id}
                          onClick={() => handleSelectUser(user.id)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all group"
                        >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.username}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                        <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{user.fullName || user.username}</p>
                              {user.userType === 'artist' && (
                          <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                            {user.city && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <p className="text-xs text-gray-500">{user.city}</p>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
              <div className="text-center py-20 px-4">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SearchIcon className="w-10 h-10 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                <p className="text-gray-400">Intenta con otro nombre o término de búsqueda</p>
                    </div>
                  )}
                </div>
              )}
      </main>
    </div>
  )
}