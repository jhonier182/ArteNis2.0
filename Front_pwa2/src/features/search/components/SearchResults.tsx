import { memo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User, MapPin, Star } from 'lucide-react'
import { SearchUser } from '../types'

interface SearchResultsProps {
  /** Resultados de búsqueda */
  results: SearchUser[]
  /** Si está buscando */
  isSearching: boolean
  /** Callback cuando se selecciona un usuario */
  onSelectUser?: (userId: string) => void
}

/**
 * Componente para mostrar resultados de búsqueda de usuarios
 * 
 * @example
 * ```tsx
 * <SearchResults
 *   results={searchResults}
 *   isSearching={isSearching}
 *   onSelectUser={(userId) => router.push(`/user/${userId}`)}
 *   onFollowUser={handleFollowUser}
 *   isFollowing={(userId) => followingUsers.includes(userId)}
 * />
 * ```
 */
function SearchResultsComponent({
  results,
  isSearching,
  onSelectUser
}: SearchResultsProps) {
  const router = useRouter()

  if (isSearching) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
        <p className="text-gray-400">Intenta con otro nombre o término de búsqueda</p>
      </div>
    )
  }

  const handleUserClick = (userId: string) => {
    if (onSelectUser) {
      onSelectUser(userId)
    } else {
      router.push(`/userProfile?userId=${userId}`)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">
        {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
      </p>
      {results.map((user, index) => (
        <motion.div
          key={user.id}
          onClick={() => handleUserClick(user.id)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all group cursor-pointer"
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
              <p className="text-sm font-medium text-white truncate">
                {user.fullName || user.username}
              </p>
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
        </motion.div>
      ))}
    </div>
  )
}

// Memoizar el componente para evitar re-renders innecesarios
export const SearchResults = memo(SearchResultsComponent)
