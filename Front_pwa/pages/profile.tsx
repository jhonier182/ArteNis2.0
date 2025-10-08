import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { Settings, LogOut, User, Mail, Calendar } from 'lucide-react'
import { useUser } from '@/context/UserContext'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head>
        <title>Perfil - ArteNis 2.0</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-mobile px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container-mobile p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h2>
              <p className="text-gray-500">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-600 mt-3 max-w-md mx-auto">{user.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Siguiendo</p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <User className="w-5 h-5" />
                <span className="capitalize">{user.userType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Miembro desde {new Date().getFullYear()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                Editar Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
