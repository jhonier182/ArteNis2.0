import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Search as SearchIcon,
  X,
  User,
  MapPin,
  Star,
  ChevronLeft
} from 'lucide-react'
import { apiClient } from '@/utils/apiClient'

// Tipos para los usuarios
interface User {
  id: string
  username: string
  fullName?: string
  avatar?: string
  userType: 'artist' | 'user'
  city?: string
}

export default function Search() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

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

  const trendingTopics = [
    { icon: User, label: 'Tatuadores', query: 'tatuador' },
    { icon: Star, label: 'Artistas', query: 'artista' },
    { icon: MapPin, label: 'Local', query: 'local' },
  ]

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

            {/* Trending Topics */}
            <div>
              <h2 className="text-base font-semibold text-gray-300 mb-3">Tendencias</h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {trendingTopics.map((topic, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSearchQuery(topic.query)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all whitespace-nowrap flex-shrink-0 min-w-[100px]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      <topic.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">{topic.label}</p>
                      <p className="text-xs text-gray-400">#{topic.query}</p>
                    </div>
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
                        <img
                          src={user.avatar}
                          alt={user.username}
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