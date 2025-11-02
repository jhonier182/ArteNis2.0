import { memo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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

  // Variantes de animación para el contenedor
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03, // Delay entre cada elemento (suave como Flux)
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  }

  // Variantes de animación para cada item
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div className="space-y-2">
      <AnimatePresence mode="wait">
        <motion.p 
          key={`count-${results.length}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-gray-500 mb-3"
        >
          {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
        </motion.p>
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`results-${results.length}-${results[0]?.id || 'empty'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-2"
        >
          {results.map((user, index) => (
            <motion.div
              key={user.id}
              layout
              variants={itemVariants}
              onClick={() => handleUserClick(user.id)}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(55, 65, 81, 1)", // gray-700
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer"
            >
              <motion.div 
                layout
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1
                }}
              >
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
              </motion.div>
              <div className="flex-1 text-left min-w-0">
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-sm font-medium text-white truncate">
                    {user.fullName || user.username}
                  </p>
                  {user.userType === 'artist' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                        delay: 0.2
                      }}
                    >
                      <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    </motion.div>
                  )}
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-gray-500 truncate"
                >
                  @{user.username}
                </motion.p>
                {user.city && (
                  <motion.div 
                    className="flex items-center gap-1 mt-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500">{user.city}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// Memoizar el componente para evitar re-renders innecesarios
export const SearchResults = memo(SearchResultsComponent)
