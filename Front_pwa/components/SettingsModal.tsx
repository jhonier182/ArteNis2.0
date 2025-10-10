import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  LogOut, 
  Settings, 
  User, 
  Bell, 
  Lock, 
  HelpCircle,
  Shield,
  Moon,
  Globe,
  ChevronRight,
  Palette,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { apiClient } from '@/utils/apiClient'
import { useAlert, AlertContainer } from '@/components/Alert'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  userName: string
  userEmail?: string
  userType?: 'user' | 'artist'
  onUserTypeChange?: (newType: 'user' | 'artist') => void
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onLogout,
  userName,
  userEmail,
  userType = 'user',
  onUserTypeChange
}: SettingsModalProps) {
  const router = useRouter()
  const { alerts, success, error, removeAlert } = useAlert()
  const [isChangingType, setIsChangingType] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleLogout = () => {
    onClose()
    onLogout()
  }

  const handleEditProfile = () => {
    onClose()
    router.push('/edit-profile')
  }

  const handleChangeUserType = async () => {
    setShowConfirmModal(false)
    setIsChangingType(true)

    try {
      const newType = userType === 'user' ? 'artist' : 'user'
      
      const response = await apiClient.put('/api/profile/me', {
        userType: newType
      })

      if (onUserTypeChange) {
        onUserTypeChange(newType)
      }

      // Mostrar mensaje de éxito
      success('¡Cuenta actualizada!', `Cambiada exitosamente a ${newType === 'artist' ? 'Tatuador' : 'Usuario'}`)
      onClose()
    } catch (error: any) {
      error('Error al cambiar cuenta', error.response?.data?.message || 'No se pudo cambiar el tipo de cuenta')
    } finally {
      setIsChangingType(false)
    }
  }

  const settingsOptions = [
    {
      icon: User,
      label: 'Editar Perfil',
      description: 'Actualiza tu información',
      onClick: handleEditProfile,
      color: 'text-blue-500'
    },
   
    {
      icon: Lock,
      label: 'Privacidad',
      description: 'Controla tu privacidad',
      onClick: () => console.log('Privacidad'),
      color: 'text-green-500'
    },
    {
      icon: Shield,
      label: 'Seguridad',
      description: 'Cambiar contraseña',
      onClick: () => console.log('Seguridad'),
      color: 'text-yellow-500'
    },
    {
      icon: Globe,
      label: 'Idioma',
      description: 'Español (ES)',
      onClick: () => console.log('Idioma'),
      color: 'text-cyan-500'
    },
    {
      icon: HelpCircle,
      label: 'Ayuda y Soporte',
      description: 'Obtén ayuda',
      onClick: () => console.log('Ayuda'),
      color: 'text-gray-500'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />

          {/* Modal - Slide from bottom */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            // Aquí cambiamos bottom-0 por bottom-10 para subir la ventana
            className="fixed inset-x-0 bottom-10 z-50 max-h-[90vh] overflow-hidden"
          >
            <div className="bg-[#1a1f26] rounded-t-3xl shadow-2xl border-t border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Configuración</h2>
                  <p className="text-sm text-gray-400 mt-1">{userName}</p>
                  {userEmail && (
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] pb-4">
                {/* Settings Options */}
                <div className="px-4 py-2">
                  {settingsOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={option.onClick}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/50 rounded-xl transition-all group"
                    >
                      <div className={`p-3 rounded-xl bg-gray-800 ${option.color} group-hover:scale-110 transition-transform`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="text-sm text-gray-400">{option.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </motion.button>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-2"></div>

                {/* Cambiar tipo de cuenta */}
                <div className="px-4 py-2">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: settingsOptions.length * 0.05 }}
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isChangingType}
                    className="w-full flex items-center gap-4 p-4 hover:bg-purple-500/10 rounded-xl transition-all group disabled:opacity-50"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-500 group-hover:scale-110 transition-transform">
                      <RefreshCw className={`w-5 h-5 ${isChangingType ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-purple-500">
                        Cambiar a {userType === 'user' ? 'Tatuador' : 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {userType === 'user' 
                          ? 'Publica tu arte y gestiona citas'
                          : 'Explora y guarda tatuajes'
                        }
                      </p>
                    </div>
                    {userType === 'user' ? (
                      <Palette className="w-5 h-5 text-purple-400" />
                    ) : (
                      <User className="w-5 h-5 text-purple-400" />
                    )}
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-2"></div>

                {/* Logout Button */}
                <div className="px-4 py-2">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: settingsOptions.length * 0.05 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-red-500">Cerrar Sesión</p>
                      <p className="text-sm text-gray-400">Salir de tu cuenta</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Version Info */}
              <div className="px-6 py-4 border-t border-gray-800">
                <p className="text-center text-xs text-gray-500">
                  InkEndin • Versión 1.0.0
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
            className="fixed inset-0 bg-black/90 z-[60] backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            // Sube la ventana de confirmación también un poco
            className="fixed inset-x-4 top-[40%] -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-sm z-[60]"
          >
            <div className="bg-[#1a1f26] rounded-3xl shadow-2xl overflow-hidden border border-gray-800 p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Cambiar tipo de cuenta
                </h3>
                <p className="text-gray-400 text-sm">
                  {userType === 'user' ? (
                    <>
                      ¿Quieres convertir tu cuenta a <span className="text-purple-400 font-semibold">Tatuador</span>? 
                      Podrás publicar tu arte y gestionar citas.
                    </>
                  ) : (
                    <>
                      ¿Quieres convertir tu cuenta a <span className="text-blue-400 font-semibold">Usuario</span>? 
                      Perderás acceso a crear publicaciones y gestionar citas.
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleChangeUserType}
                  disabled={isChangingType}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingType ? 'Cambiando...' : 'Confirmar cambio'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isChangingType}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Alert Container */}
      <AlertContainer alerts={alerts} />
    </AnimatePresence>
  )
}
