import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search as SearchIcon,
  X,
  TrendingUp,
  Hash,
  User,
  MapPin,
  Star,
  Home,
  Bell,
  ChevronLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Filter,
  Sparkles
} from 'lucide-react'
import { apiClient } from '@/utils/apiClient'
import { useUser } from '@/context/UserContext'

interface SearchUser {
  id: number
  username: string
  fullName: string
  avatar: string | null
  userType: 'user' | 'artist'
  city: string | null
  bio: string | null
}

interface Post {
  id: string
  title?: string
  description?: string
  mediaUrl?: string
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
}

export default function SearchPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'artists'>('posts')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'trending' | 'recent' | 'popular'>('trending')

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const recent = localStorage.getItem('recentSearches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }
    
    // Cargar posts de usuarios que NO sigue
    fetchPosts()
  }, [selectedFilter])

  useEffect(() => {
    if (searchQuery.length >= 2 && activeTab === 'artists') {
      const debounce = setTimeout(() => {
        handleSearch()
      }, 500)
      return () => clearTimeout(debounce)
    } else if (activeTab === 'artists') {
      setSearchResults([])
    }
  }, [searchQuery, activeTab])
  
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true)
      // Obtener posts de usuarios que NO sigue (esto viene del endpoint /api/posts que ya filtra)
      const response = await apiClient.get('/api/posts', {
        params: {
          filter: selectedFilter // trending, recent, popular
        }
      })
      const postsData = response.data?.data?.posts || response.data?.data || []
      setPosts(postsData)
    } catch (error) {
      console.error('Error al cargar posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsSearching(true)
      const response = await apiClient.get('/api/search/users', {
        params: {
          query: searchQuery,
          userType: activeTab === 'all' ? undefined : activeTab === 'artists' ? 'artist' : 'user'
        }
      })
      setSearchResults(response.data.data.users || [])
    } catch (error) {
      console.error('Error al buscar:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUser = (userId: number) => {
    // Guardar búsqueda reciente
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    
    // Navegar al perfil
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

  const trendingTopics = [
    { icon: Hash, label: 'Realismo', query: 'realismo' },
    { icon: Hash, label: 'Minimalista', query: 'minimalista' },
    { icon: Hash, label: 'Japonés', query: 'japonés' },
    { icon: MapPin, label: 'Madrid', query: 'madrid' },
    { icon: TrendingUp, label: 'Blackwork', query: 'blackwork' },
  ]

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>Buscar - InkEndin</title>
      </Head>

      {/* Header con búsqueda */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container-mobile px-4 py-3">
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
                placeholder={activeTab === 'posts' ? 'Buscar estilos, hashtags...' : 'Buscar tatuadores...'}
                className="w-full bg-gray-800 text-white pl-12 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                autoFocus={activeTab === 'artists'}
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

          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Descubrir
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'artists'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Buscar Tatuadores
            </button>
          </div>
          
          {/* Filtros (solo para tab de posts) */}
          {activeTab === 'posts' && !searchQuery && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setSelectedFilter('trending')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedFilter === 'trending'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Tendencia
              </button>
              <button
                onClick={() => setSelectedFilter('recent')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedFilter === 'recent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Recientes
              </button>
              <button
                onClick={() => setSelectedFilter('popular')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedFilter === 'popular'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                Populares
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile">
        <AnimatePresence mode="wait">
          {/* Tab: Descubrir (Posts) */}
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loadingPosts ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : posts.length > 0 ? (
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
                        <Link href={`/post/${post.id}`}>
                          <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
                            {/* Post Image */}
                            {post.mediaUrl && (
                              <div className="relative group">
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
                            <div className="p-3">
                              {post.title && (
                                <h3 className="font-semibold mb-1 line-clamp-2">{post.title}</h3>
                              )}
                              {post.description && (
                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.description}</p>
                              )}
                              
                              {/* Author */}
                              {post.User && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    {post.User.avatar ? (
                                      <img
                                        src={post.User.avatar}
                                        alt={post.User.username}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {post.User.username || 'Usuario'}
                                    </p>
                                    {post.User.userType === 'artist' && (
                                      <p className="text-xs text-gray-500">Artista</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No hay publicaciones disponibles</h3>
                  <p className="text-gray-400">Sigue a algunos tatuadores para descubrir contenido</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Buscar Tatuadores */}
          {activeTab === 'artists' && (
            <motion.div
              key="artists"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-6"
            >
              {!searchQuery ? (
                <div>
                  {/* Búsquedas recientes */}
                  {recentSearches.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Búsquedas recientes</h2>
                        <button
                          onClick={clearRecentSearches}
                          className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          Borrar todo
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(search)}
                            className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <SearchIcon className="w-5 h-5 text-gray-500" />
                              <span className="text-white">{search}</span>
                            </div>
                            <X className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Topics */}
                  <div>
                    <h2 className="text-lg font-bold mb-4">Tendencias</h2>
                    <div className="space-y-2">
                      {trendingTopics.map((topic, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSearchQuery(topic.query)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <topic.icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white font-medium">{topic.label}</p>
                            <p className="text-sm text-gray-500">Trending</p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {isSearching ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400 mb-4">
                        {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map((user, index) => (
                        <motion.button
                          key={user.id}
                          onClick={() => handleSelectUser(user.id)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium truncate">{user.fullName || user.username}</p>
                              {user.userType === 'artist' && (
                                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                            {user.city && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <p className="text-xs text-gray-500">{user.city}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {user.userType === 'artist' ? (
                              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
                                Tatuador
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-700 text-gray-400 text-xs font-medium rounded-full">
                                Usuario
                              </span>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SearchIcon className="w-10 h-10 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                      <p className="text-gray-400">Intenta con otra búsqueda</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f26] border-t border-gray-800 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="container-mobile flex justify-around items-center h-16">
          {/* Solo mostrar Inicio para usuarios normales */}
          {user?.userType !== 'artist' && (
            <button
              onClick={() => router.push('/')}
              className="flex flex-col items-center py-2 px-3 text-gray-400"
            >
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs">Inicio</span>
            </button>
          )}
          
          <button
            onClick={() => router.push('/search')}
            className="flex flex-col items-center py-2 px-3 text-blue-500"
          >
            <SearchIcon className="w-6 h-6 mb-1 fill-blue-500" />
            <span className="text-xs">Buscar</span>
          </button>
          
          {/* Botón Publicar para tatuadores */}
          {user?.userType === 'artist' && (
            <button
              onClick={() => router.push('/create')}
              className="flex flex-col items-center py-2 px-3 text-gray-400"
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center -mt-2">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
              </div>
              <span className="text-xs">Publicar</span>
            </button>
          )}
          
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

