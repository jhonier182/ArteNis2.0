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
  Camera
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import EditProfileModal from '@/components/EditProfileModal'
import SettingsModal from '@/components/SettingsModal'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, setUser } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('collections')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatar: newAvatarUrl })
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
    rating: 4.9,
    collections: 58
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
        {/* Avatar */}
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
            {user.userType === 'artist' ? 'Tatuador/a' : 'Usuario'} en {user.city || 'Madrid'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Seguir
          </button>
          <button className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensaje
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {stats.followers < 1000 ? stats.followers : `${(stats.followers / 1000).toFixed(1)}K`}
            </div>
            <div className="text-sm text-gray-400">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{stats.rating}</div>
            <div className="text-sm text-gray-400">Valoración</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{stats.collections}</div>
            <div className="text-sm text-gray-400">Colecciones</div>
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

        {/* Collections Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Colecciones</h3>
            <button className="text-blue-500 text-sm font-medium">Ver todo</button>
          </div>
          
          {/* Collection Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: item * 0.1 }}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Placeholder image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <Grid className="w-12 h-12 text-gray-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f1419] border-t border-gray-800 z-50 safe-bottom">
        <div className="container-mobile flex items-center justify-around py-2">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span className="text-xs">Inicio</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-gray-400">
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <span className="text-xs">Buscar</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-gray-400">
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <span className="text-xs">Ranking</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-gray-400">
            <Bookmark className="w-6 h-6 mb-1" />
            <span className="text-xs">Guardado</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-blue-500">
            <User className="w-6 h-6 mb-1" fill="currentColor" />
            <span className="text-xs">Perfil</span>
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