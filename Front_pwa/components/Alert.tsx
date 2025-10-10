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

export default function Alert({ id, type, title, message, duration = 1500, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Función para reproducir sonido 
  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Sonido - más suave y musical
      const frequencies = {
        success: [523, 659, 784], // Do, Mi, Sol (acorde mayor)
        error: [392, 311, 262],   // Sol, Mi♭, Do (acorde menor)
        warning: [523, 622, 523], // Do, Mi♭, Do (tritono)
        info: [523, 659]          // Do, Mi (intervalo mayor)
      }
      
      const freqArray = frequencies[type]
      const duration = 0.3
      const noteDuration = duration / freqArray.length
      
      freqArray.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + (index * noteDuration))
        oscillator.type = 'sine'
        
        // Envelope suave como Instagram
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + (index * noteDuration))
        gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + (index * noteDuration) + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (index * noteDuration) + noteDuration)
        
        oscillator.start(audioContext.currentTime + (index * noteDuration))
        oscillator.stop(audioContext.currentTime + (index * noteDuration) + noteDuration)
      })
    } catch (error) {
      // Silenciar errores de audio si no está disponible
      console.log('Audio no disponible')
    }
  }

  useEffect(() => {
    // Reproducir sonido al aparecer
    playSound()
    
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

  const getEmoji = () => {
    const emojis = {
      success: ['🎉', '✨', '🎊', '🌟', '💫', '🔥', '💯', '✅'],
      error: ['😞', '😢', '💔', '😰', '😓', '😵', '❌', '🚫'],
      warning: ['⚠️', '🚨', '⚡', '🔥', '💥', '😱', '😨', '⚠️'],
      info: ['💡', '🔍', '📝', '📋', '📊', '📈', 'ℹ️', '💭']
    }
    
    const typeEmojis = emojis[type] || emojis.success
    const randomEmoji = typeEmojis[Math.floor(Math.random() * typeEmojis.length)]
    
    return randomEmoji
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
            scale: 0,
            rotate: 180
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotate: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0,
            rotate: -180
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.4
          }}
          className={`relative max-w-[200px] w-full ${getBackgroundColor()} border backdrop-blur-xl rounded-xl shadow-lg overflow-hidden`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Efecto de brillo animado */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity, 
              repeatDelay: 0.5,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          />
          
          <div className="relative p-3">
            <div className="flex items-center justify-center gap-2">
              <motion.div 
                className="flex-shrink-0 text-2xl"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  opacity: 1,
                  y: [0, -5, 0]
                }}
                transition={{ 
                  delay: 0.1, 
                  type: "spring", 
                  stiffness: 400,
                  damping: 20,
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }
                }}
              >
                {getEmoji()}
              </motion.div>
              
              <motion.h4 
                className={`text-xs font-bold ${getTextColor()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h4>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {alerts.map(alert => (
          <Alert key={alert.id} {...alert} />
        ))}
      </div>
    </div>
  )
}
