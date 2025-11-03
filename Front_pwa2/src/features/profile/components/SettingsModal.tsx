import { 
  X, 
  LogOut, 
  User, 
  Lock, 
  HelpCircle,
  Shield,
  Globe,
  ChevronRight,
  Palette,
  RefreshCw
} from 'lucide-react'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { profileService } from '../services/profileService'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  userName: string
  userEmail?: string
  userType?: 'user' | 'artist'
  onUserTypeChange?: (newType: 'user' | 'artist') => void
  onEditProfile?: () => void
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onLogout,
  userName,
  userEmail,
  userType = 'user',
  onUserTypeChange,
  onEditProfile
}: SettingsModalProps) {
  const router = useRouter()
  const [isChangingType, setIsChangingType] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogout = () => {
    onClose()
    onLogout()
  }

  const handleEditProfile = () => {
    onClose()
    router.push('/profile/edit')
  }

  const handleChangeUserType = async () => {
    setShowConfirmModal(false)
    setIsChangingType(true)
    setMessage(null)

    try {
      const newType = userType === 'user' ? 'artist' : 'user'
      
      await profileService.updateProfile({ userType: newType })

      if (onUserTypeChange) {
        onUserTypeChange(newType)
      }

      setMessage({ type: 'success', text: `Cambiada exitosamente a ${newType === 'artist' ? 'Tatuador' : 'Usuario'}` })
      setTimeout(() => {
        onClose()
        setMessage(null)
      }, 1500)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setMessage({ type: 'error', text: axiosError.response?.data?.message || 'No se pudo cambiar el tipo de cuenta' })
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
      onClick: () => {},
      color: 'text-green-500'
    },
    {
      icon: Shield,
      label: 'Seguridad',
      description: 'Cambiar contraseña',
      onClick: () => {},
      color: 'text-yellow-500'
    },
    {
      icon: Globe,
      label: 'Idioma',
      description: 'Español (ES)',
      onClick: () => {},
      color: 'text-cyan-500'
    },
    {
      icon: HelpCircle,
      label: 'Ayuda y Soporte',
      description: 'Obtén ayuda',
      onClick: () => {},
      color: 'text-gray-500'
    }
  ]

  if (!isOpen) return null

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
      />

      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-h-[90vh] overflow-hidden max-w-md mx-auto"
      >
            <div className="bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800">
              <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Configuración</h2>
                  <p className="text-sm text-gray-400 mt-1">{userName}</p>
                  {userEmail && (
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-220px)] pb-4">
                {message && (
                  <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/50 text-green-500'
                      : 'bg-red-500/10 border border-red-500/50 text-red-500'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="px-4 py-2">
                  {settingsOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={option.onClick}
                      className="w-full flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-xl transition-colors group"
                    >
                      <div className={`p-3 rounded-xl bg-neutral-800 ${option.color}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="text-sm text-gray-400">{option.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
                    </button>
                  ))}
                </div>

                <div className="border-t border-neutral-800 my-2"></div>

                <div className="px-4 py-2">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isChangingType}
                    className="w-full flex items-center gap-4 p-4 hover:bg-purple-500/10 rounded-xl transition-colors group disabled:opacity-50"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                      <RefreshCw className={`w-5 h-5 ${isChangingType ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-purple-400">
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
                  </button>
                </div>

                <div className="border-t border-neutral-800 my-2"></div>

                <div className="px-4 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-colors group"
                  >
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-red-500">Cerrar Sesión</p>
                      <p className="text-sm text-gray-400">Salir de tu cuenta</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-800">
                <p className="text-center text-xs text-gray-500">
                  Inkedin • Versión 1.0.0
                </p>
              </div>
            </div>
      </div>

      {showConfirmModal && (
        <>
          <div
            onClick={() => setShowConfirmModal(false)}
            className="fixed inset-0 bg-black/90 z-[60] backdrop-blur-sm"
          />

          <div
            className="fixed inset-x-4 top-[40%] -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-sm z-[60]"
          >
                <div className="bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-800 p-6">
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
                      className="w-full bg-neutral-800 text-white py-3 rounded-xl font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
          </div>
        </>
      )}
    </>
  )
}

