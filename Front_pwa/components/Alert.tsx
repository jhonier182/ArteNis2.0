import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export interface AlertProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export default function Alert({ id, type, title, message, duration = 4000, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 500) // Delay para la animación de salida
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 500)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return <CheckCircle className="w-6 h-6 text-green-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'error':
        return 'bg-red-500/10 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-green-500/10 border-green-500/30'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-green-400'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: 100, 
            scale: 0.8,
            rotateX: 15
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotateX: 0
          }}
          exit={{ 
            opacity: 0, 
            y: 100, 
            scale: 0.8,
            rotateX: -15
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            duration: 0.4
          }}
          className={`relative max-w-sm w-full ${getBackgroundColor()} border backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Efecto de brillo animado */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          />
          
          <div className="relative p-4">
            <div className="flex items-start gap-3">
              <motion.div 
                className="flex-shrink-0 mt-0.5"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                {getIcon()}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <motion.h4 
                  className={`text-sm font-bold ${getTextColor()} mb-1`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {title}
                </motion.h4>
                {message && (
                  <motion.p 
                    className="text-xs text-gray-300 leading-relaxed"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {message}
                  </motion.p>
                )}
              </div>
              
              <motion.button
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Barra de progreso animada */}
          <motion.div
            className="h-1 bg-gradient-to-r from-white/20 to-white/40"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ 
              duration: duration / 1000, 
              ease: 'linear',
              delay: 0.2
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para manejar alertas
export function useAlert() {
  const [alerts, setAlerts] = useState<AlertProps[]>([])

  const addAlert = (alert: Omit<AlertProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newAlert: AlertProps = {
      ...alert,
      id,
      onClose: removeAlert
    }
    setAlerts(prev => [...prev, newAlert])
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const success = (title: string, message?: string, duration?: number) => {
    addAlert({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    addAlert({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    addAlert({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    addAlert({ type: 'info', title, message, duration })
  }

  return {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info
  }
}

// Componente contenedor de alertas
export function AlertContainer({ alerts }: { alerts: AlertProps[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {alerts.map(alert => (
        <Alert key={alert.id} {...alert} />
      ))}
    </div>
  )
}
