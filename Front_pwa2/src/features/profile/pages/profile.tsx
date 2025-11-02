'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  User, 
  Award,
  Star,
  MessageCircle,
  Grid,
  Bookmark,
  ChevronLeft,
  MoreVertical,
  Camera,
  Share2,
  Gift,
  Zap,
  Heart
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import EditProfileModal from '../components/EditProfileModal'
import SettingsModal from '../components/SettingsModal'
import { useUserPosts } from '../hooks/useUserPosts'
import { useSavedPosts } from '../hooks/useSavedPosts'
import { InfiniteScrollTrigger } from '../components/LoadingIndicator'
import BottomNavigation from '@/components/BottomNavigation'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks para obtener datos
  const {
    posts: userPosts,
    loading: loadingPosts,
    hasMore,
    error: postsError,
    loadMore,
    reset: resetPosts,
  } = useUserPosts(user?.id)

  const {
    posts: savedPosts,
    loading: loadingSavedPosts,
  } = useSavedPosts()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const isArtist = user?.userType === 'artist' || 
                     (typeof user?.userType === 'string' && user?.userType.toLowerCase() === 'artist')
    if (isArtist) {
      const handleNewPost = () => {
        resetPosts()
      }
      window.addEventListener('newPostCreated', handleNewPost)
      return () => {
        window.removeEventListener('newPostCreated', handleNewPost)
      }
    }
  }, [user?.userType, resetPosts])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB')
      return
    }

    await handleAvatarUpload(file)
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const { profileService } = await import('../services/profileService')
      const result = await profileService.uploadAvatar(file)
      if (user) {
        updateUser({ avatar: result.avatarUrl })
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al subir la imagen')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (user) {
      updateUser({ avatar: newAvatarUrl })
    }
  }

  const handleUserTypeChange = (newType: 'user' | 'artist') => {
    if (user) {
      updateUser({ userType: newType })
    }
  }
  // Optimizado: solo depende de userType, no del objeto completo user
  // Esto evita recálculos innecesarios cuando otros campos de user cambian
  const isArtist = useMemo(() => {
    if (!user?.userType) return false
    const userType = user.userType
    return userType === 'artist' || 
           (typeof userType === 'string' && userType.toLowerCase() === 'artist')
  }, [user?.userType])

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

  const stats = {
    followers: 1200,
    rating: 4.5,
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

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>Perfil - Inkedin</title>
      </Head>

      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3 max-w-md mx-auto">
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

      <div className="px-6 pt-6 max-w-md mx-auto">
        {isArtist ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="relative group flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1 hover:from-orange-500 hover:to-orange-700 transition-all"
                >
                  <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={200}
                        height={200}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                  <Camera className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1 truncate">
                      {user.username}
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                      Tatuador/a
                    </p>
                  </div>
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
          <>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-6"
            >
              <div className="relative group">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1 hover:from-orange-500 hover:to-orange-700 transition-all"
                >
                  <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={200}
                        height={200}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">
                {user.username}
              </h2>
              <p className="text-gray-400">
                Usuario
              </p>
            </div>
          </>
        )}

        {isArtist && (
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

        {!isArtist && (
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

                <button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Ganar más puntos
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Insignias y Logros</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
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

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {isArtist ? 'Portafolio' : 'Publicaciones Guardadas'}
            </h3>
          </div>
          
          {isArtist ? (
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
                        <Image
                          src={post.mediaUrl}
                          alt={post.description || 'Post'}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-white text-sm">
                            <div className="flex items-center gap-1">
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
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
                
                <InfiniteScrollTrigger
                  loading={loadingPosts}
                  hasMore={hasMore}
                  error={postsError?.message || null}
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
                      <Image
                        src={post.mediaUrl}
                        alt={post.description || 'Post'}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
                    </div>
                  </motion.div>
                ))}
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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentAvatar={user.avatar}
        onAvatarUpdated={handleAvatarUpdated}
        userId={user.id}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLogout={handleLogout}
        userName={user.username}
        userEmail={user.email}
        userType={user.userType as 'user' | 'artist'}
        onUserTypeChange={handleUserTypeChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploadingAvatar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#0f1419] p-6 rounded-2xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            <span className="text-white font-medium">Subiendo foto...</span>
          </div>
        </div>
      )}

      <BottomNavigation currentPath="/profile" />
    </div>
  )
}

