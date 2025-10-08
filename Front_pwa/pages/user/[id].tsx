import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  MessageCircle,
  Star,
  Award,
  Bookmark,
  Share2,
  Gift,
  MoreVertical,
  Calendar
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'

interface PublicUser {
  id: number
  username: string
  fullName: string
  email: string
  avatar: string | null
  userType: 'user' | 'artist'
  bio: string | null
  city: string | null
  state: string | null
  country: string | null
  // Artist specific
  studioName?: string | null
  studioAddress?: string | null
  pricePerHour?: number | null
  experience?: number | null
  specialties?: string | null
}

export default function PublicProfilePage() {
  const router = useRouter()
  const { id } = router.query
  const { user: currentUser, isAuthenticated } = useUser()
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    if (id) {
      loadUserProfile()
    }
  }, [id])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/api/profile/${id}`)
      setProfileUser(response.data.data.user)
      
      // Verificar si ya sigue al usuario
      if (isAuthenticated) {
        checkIfFollowing()
      }

      // Cargar publicaciones del usuario
      loadUserPosts()
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      alert('Error al cargar el perfil del usuario')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserPosts = async () => {
    try {
      setLoadingPosts(true)
      const response = await apiClient.get(`/api/posts/user/${id}`)
      setUserPosts(response.data.data.posts || [])
    } catch (error) {
      console.error('Error al cargar publicaciones:', error)
      setUserPosts([])
    } finally {
      setLoadingPosts(false)
    }
  }

  const checkIfFollowing = async () => {
    try {
      const response = await apiClient.get('/api/follow/following')
      const followingUsers = response.data.data.followingUsers || []
      const isUserFollowed = followingUsers.some((u: any) => u.id === id)
      setIsFollowing(isUserFollowed)
    } catch (error) {
      console.error('Error al verificar seguimiento:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para seguir usuarios')
      router.push('/login')
      return
    }

    try {
      setIsFollowLoading(true)
      
      if (isFollowing) {
        // Dejar de seguir
        await apiClient.delete(`/api/follow/${id}`)
        setIsFollowing(false)
      } else {
        // Seguir
        await apiClient.post('/api/follow', { userId: id })
        setIsFollowing(true)
      }
    } catch (error: any) {
      console.error('Error al cambiar seguimiento:', error)
      alert(error.response?.data?.message || 'Error al actualizar seguimiento')
    } finally {
      setIsFollowLoading(false)
    }
  }

  // Mock data - Reemplazar con datos reales del backend
  const stats = {
    followers: 1200,
    rating: 4.5,
    totalReviews: 28,
    collections: 58,
    completedAppointments: 150,
    responseRate: 98
  }

  const userRewards = {
    points: 1250,
    level: 'Gold',
    nextReward: 1500,
    badges: [
      { id: 1, name: 'Compartió 10 veces', icon: Share2, earned: true },
      { id: 2, name: 'Super Fan', icon: Star, earned: true },
      { id: 3, name: 'Embajador', icon: Award, earned: false },
    ]
  }

  const badges = [
    { icon: Award, label: 'Explorador de estilos', color: 'bg-yellow-500' },
    { icon: Star, label: 'Comentarista estrella', color: 'bg-blue-500' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profileUser) {
    return null
  }

  // Si estoy viendo mi propio perfil, redirigir a /profile
  if (currentUser && String(currentUser.id) === String(profileUser.id)) {
    router.push('/profile')
    return null
  }

  const isArtist = profileUser.userType === 'artist'

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>{profileUser.fullName || profileUser.username} - InkEndin</title>
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
            <h1 className="text-lg font-bold">{profileUser.username}</h1>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container-mobile px-6 pt-6">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
            <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profileUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Name and Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">
            {profileUser.fullName || profileUser.username}
          </h2>
          <p className="text-gray-400">
            {isArtist ? 'Tatuador/a' : 'Usuario'} en {profileUser.city || 'Madrid'}
          </p>
          
          {/* Rating con estrellas (solo para artistas) */}
          {isArtist && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(stats.rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : i < stats.rating
                        ? 'fill-yellow-500/50 text-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">
                {stats.rating}
              </span>
              <span className="text-xs text-gray-500">
                ({stats.totalReviews} valoraciones)
              </span>
            </div>
          )}

          {/* Bio */}
          {profileUser.bio && (
            <p className="text-gray-300 mt-3 max-w-md mx-auto">
              {profileUser.bio}
            </p>
          )}
        </div>

        {/* Action Buttons - Solo si NO es tu propio perfil */}
        {currentUser?.id?.toString() !== profileUser.id?.toString() && (
          <div className="flex gap-3 mb-8">
            {isArtist ? (
              <>
                <button 
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                    isFollowing
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : isFollowing ? (
                    'Siguiendo'
                  ) : (
                    'Seguir'
                  )}
                </button>
                <button 
                  onClick={() => router.push('/appointments/book')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Solicitar cotización
                </button>
              </>
            ) : (
              <button 
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : isFollowing ? (
                  'Siguiendo'
                ) : (
                  'Seguir'
                )}
              </button>
            )}
            <button className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mensaje
            </button>
          </div>
        )}

        {/* Stats para Artistas */}
        {isArtist && (
          <div className="space-y-4 mb-8">
            {/* Stats principales en 3 columnas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {stats.followers < 1000 ? stats.followers : `${(stats.followers / 1000).toFixed(1)}K`}
                </div>
                <div className="text-xs text-gray-400">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{stats.rating}</div>
                <div className="text-xs text-gray-400">Valoración</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{stats.collections}</div>
                <div className="text-xs text-gray-400">Trabajos</div>
              </div>
            </div>

            {/* Métricas profesionales en 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1f26] rounded-xl py-3 px-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-blue-400">{stats.completedAppointments}+</div>
                  <div className="text-xs text-gray-400 truncate">Citas completadas</div>
                </div>
              </div>
              
              <div className="bg-[#1a1f26] rounded-xl py-3 px-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-green-400">{stats.responseRate}%</div>
                  <div className="text-xs text-gray-400 truncate">Tasa de respuesta</div>
                </div>
              </div>
            </div>

            {/* Info adicional del estudio */}
            {profileUser.studioName && (
              <div className="bg-[#1a1f26] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Información del Estudio</h3>
                <p className="text-white font-medium mb-1">{profileUser.studioName}</p>
                {profileUser.studioAddress && (
                  <p className="text-sm text-gray-400">{profileUser.studioAddress}</p>
                )}
                {profileUser.pricePerHour && (
                  <p className="text-sm text-blue-400 mt-2">
                    Desde ${profileUser.pricePerHour}/hora
                  </p>
                )}
                {profileUser.experience && (
                  <p className="text-sm text-gray-400 mt-1">
                    {profileUser.experience} años de experiencia
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sistema de Recompensas e Insignias para Usuarios Normales */}
        {!isArtist && (
          <>
            {/* Sistema de Recompensas */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-pink-600/20 rounded-2xl p-5 border border-yellow-600/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Nivel de Recompensas</h3>
                      <p className="text-xs text-gray-400">Nivel {userRewards.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{userRewards.points}</div>
                    <p className="text-xs text-gray-400">puntos</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Progreso</span>
                    <span>{userRewards.points}/{userRewards.nextReward}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(userRewards.points / userRewards.nextReward) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                  {userRewards.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        badge.earned
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      <badge.icon
                        className={`w-5 h-5 ${
                          badge.earned ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      />
                      <p className={`text-[10px] text-center leading-tight ${
                        badge.earned ? 'text-yellow-400' : 'text-gray-500'
                      }`}>
                        {badge.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insignias Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Insignias y Logros</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 text-center"
                  >
                    <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center mb-2`}>
                      <badge.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-gray-400 max-w-[80px] leading-tight">
                      {badge.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Portafolio / Publicaciones Guardadas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {isArtist ? 'Portafolio' : 'Publicaciones Guardadas'}
            </h3>
            {userPosts.length > 0 && (
              <span className="text-sm text-gray-400">{userPosts.length} publicaciones</span>
            )}
          </div>
          
          {loadingPosts ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {userPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  {post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title || 'Post'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Bookmark className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-3 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span>{post.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentsCount || 0}</span>
                        </div>
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
              <p className="text-gray-400">
                {isArtist ? 'Aún no hay publicaciones' : 'No hay publicaciones guardadas'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

