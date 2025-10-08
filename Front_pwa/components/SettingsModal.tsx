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
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/router'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  userName: string
  userEmail?: string
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onLogout,
  userName,
  userEmail
}: SettingsModalProps) {
  const router = useRouter()

  const handleLogout = () => {
    onClose()
    onLogout()
  }

  const handleEditProfile = () => {
    onClose()
    router.push('/edit-profile')
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
      icon: Bell,
      label: 'Notificaciones',
      description: 'Configurar alertas',
      onClick: () => console.log('Notificaciones'),
      color: 'text-purple-500'
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
      icon: Moon,
      label: 'Apariencia',
      description: 'Tema oscuro activado',
      onClick: () => console.log('Apariencia'),
      color: 'text-indigo-500'
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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden"
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
                  ArteNis 2.0 • Versión 1.0.0
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
