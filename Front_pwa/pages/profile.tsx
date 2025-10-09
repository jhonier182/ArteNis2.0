import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Settings, 
  LogOut, 
  User, 
  Award,
  Star,
  TrendingUp,
  MessageCircle,
  Grid,
  Bookmark,
  ChevronLeft,
  MoreVertical,
  Camera,
  Share2,
  Gift,
  Zap,
  Home,
  Search,
  Bell,
  Heart
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'
import EditProfileModal from '@/components/EditProfileModal'
import SettingsModal from '@/components/SettingsModal'
import { useInfinitePosts } from '@/hooks/useInfiniteScroll'
import { InfiniteScrollTrigger } from '@/components/LoadingIndicator'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, setUser } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('collections')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loadingSavedPosts, setLoadingSavedPosts] = useState(true)

  // Hook de scroll infinito para posts del usuario (solo para tatuadores)
  const {
    data: userPosts,
    loading: loadingPosts,
    hasMore,
    error,
    loadMore,
    reset: resetPosts,
    setData: setUserPosts
  } = useInfinitePosts<any>(`/api/posts/user/${user?.id}`, {}, {
    enabled: isAuthenticated && user?.userType === 'artist'
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.userType !== 'artist') {
        fetchSavedPosts()
      }
    }
  }, [isAuthenticated, user])


  const fetchSavedPosts = async () => {
    try {
      setLoadingSavedPosts(true)
      const response = await apiClient.get('/api/boards/me/boards')
      console.log('Publicaciones guardadas:', response.data)
      // Extraer todas las publicaciones de todos los boards
      const allPosts = response.data?.data?.boards?.flatMap((board: any) => board.Posts || []) || []
      setSavedPosts(allPosts)
    } catch (error) {
      console.error('Error al cargar publicaciones guardadas:', error)
      setSavedPosts([])
    } finally {
      setLoadingSavedPosts(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatar: newAvatarUrl })
    }
  }

  const handleUserTypeChange = (newType: 'user' | 'artist') => {
    if (user) {
      setUser({ ...user, userType: newType })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
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
    { icon: TrendingUp, label: 'Top 10 Semanal', color: 'bg-green-500' },
  ]

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>Perfil - InkEndin</title>
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
            <h1 className="text-lg font-bold">Perfil</h1>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="container-mobile px-6 pt-6">
        {user.userType === 'artist' ? (
          /* Layout para Tatuador: Foto pequeña a la izquierda */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-start gap-4">
              {/* Avatar pequeño */}
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
                  <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Edit Button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Info a la derecha */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1 truncate">
                      {user.fullName || user.username}
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                      Tatuador/a en {user.city || 'Madrid'}
                    </p>
                  </div>
                  {/* Seguidores pequeño */}
                  <div className="text-center ml-3 flex items-center gap-2">
                    <div>
                      <div className="text-lg font-bold">
                        {stats.followers < 1000 ? stats.followers : `${(stats.followers / 1000).toFixed(1)}K`}
                      </div>
                      <div className="text-[10px] text-gray-500">Seguidores</div>
                    </div>
                    <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                      <Share2 className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Rating con estrellas */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
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
                </div>

              </div>
            </div>
          </motion.div>
        ) : (
          /* Layout para Usuario Normal: Foto grande centrada */
          <>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-6"
            >
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
                  <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Edit Button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>

            {/* Name and Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">
                {user.fullName || user.username}
              </h2>
              <p className="text-gray-400">
                Usuario en {user.city || 'Madrid'}
              </p>
            </div>
          </>
        )}


        {/* Métricas Profesionales - Solo para tatuadores */}
        {user.userType === 'artist' && (
          <div className="mb-8">
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
          </div>
        )}

        {/* Sistema de Recompensas (solo usuarios normales) */}
        {user.userType !== 'artist' && (
          <>
            <div className="mb-8">
              <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-pink-600/20 rounded-2xl p-5 border border-yellow-600/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Recompensas por Compartir</h3>
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
                    <span>Progreso al siguiente nivel</span>
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

                {/* Acción rápida */}
                <button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Ganar más puntos
                </button>
              </div>
            </div>

            {/* Badges Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Insignias y Logros</h3>
                <button className="text-blue-500 text-sm font-medium">Ver todo</button>
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

        {/* Collections/Portfolio Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {user.userType === 'artist' ? 'Portafolio' : 'Publicaciones Guardadas'}
            </h3>
            {user.userType === 'artist' && userPosts.length > 0 && (
              <button 
                onClick={() => router.push('/collections')}
                className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors"
              >
                Ver todo
              </button>
            )}
            {user.userType === 'user' && savedPosts.length > 6 && (
              <button 
                onClick={() => router.push('/collections')}
                className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors"
              >
                Ver todo
              </button>
            )}
          </div>
          
          {/* Posts Grid */}
          {user.userType === 'artist' ? (
            loadingPosts ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {userPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => router.push(`/post/${post.id}`)}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 group cursor-pointer"
                    >
                      {post.mediaUrl && (
                        <>
                          {post.type === 'video' ? (
                            <div className="relative w-full h-full">
                              <img
                                src={post.thumbnailUrl || post.mediaUrl}
                                alt={post.description || 'Post'}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay con icono de play para videos */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.mediaUrl}
                              alt={post.description || 'Post'}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-white text-sm">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
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
                
                {/* Indicador de scroll infinito */}
                <InfiniteScrollTrigger
                  loading={loadingPosts}
                  hasMore={hasMore}
                  error={error}
                  onRetry={loadMore}
                />
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tienes publicaciones aún</h3>
                <p className="text-gray-400 mb-4">Comparte tu trabajo con la comunidad</p>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Crear publicación
                </button>
              </div>
            )
          ) : (
            // Para usuarios normales - Mostrar publicaciones guardadas
            loadingSavedPosts ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : savedPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {savedPosts.slice(0, 6).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 group cursor-pointer"
                  >
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt={post.description || 'Post'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Indicador de guardado */}
                    <div className="absolute top-2 right-2">
                      <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
                    </div>
                  </motion.div>
                ))}
                {savedPosts.length > 6 && (
                  <div className="col-span-2 flex justify-center mt-4">
                    <button
                      onClick={() => router.push('/collections')}
                      className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors"
                    >
                      Ver todas las colecciones ({savedPosts.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tienes publicaciones guardadas</h3>
                <p className="text-gray-400 mb-4">Guarda publicaciones que te gusten para verlas aquí</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Explorar publicaciones
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f26] border-t border-gray-800 z-50 safe-bottom bottom-nav-ios">
        <div className="flex items-center justify-around h-20 px-2">
          {/* Solo mostrar Inicio para usuarios normales */}
          {user.userType !== 'artist' && (
            <button
              onClick={() => router.push('/')}
              className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
            >
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">Inicio</span>
            </button>
          )}
          
          <button
            onClick={() => router.push('/search')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate">Buscar</span>
          </button>
          
          {/* Botón Publicar para tatuadores */}
          {user.userType === 'artist' && (
            <button
              onClick={() => router.push('/create')}
              className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
              </div>
              <span className="text-xs font-medium truncate">Publicar</span>
            </button>
          )}
          
          <button
            onClick={() => router.push('/chat')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1 relative"
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate">Chat</span>
            <span className="absolute top-1 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>
          
          <button className="nav-button flex flex-col items-center justify-center py-2 px-3 text-purple-500 min-w-0 flex-1">
            <User className="w-6 h-6 mb-1 fill-purple-500" />
            <span className="text-xs font-medium truncate">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentAvatar={user.avatar}
        onAvatarUpdated={handleAvatarUpdated}
        userId={user.id}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLogout={handleLogout}
        userName={user.fullName || user.username}
        userEmail={user.email}
        userType={user.userType as 'user' | 'artist'}
        onUserTypeChange={handleUserTypeChange}
      />
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