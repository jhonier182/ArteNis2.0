/**
 * Sistema de Toast para notificaciones no bloqueantes
 * 
 * Reemplaza alert() con un sistema moderno de notificaciones
 * que no bloquea la UI y permite múltiples mensajes simultáneos.
 * 
 * @example
 * ```tsx
 * import { useToast } from '@/components/ui/Toast'
 * 
 * function MyComponent() {
 *   const toast = useToast()
 *   
 *   const handleClick = () => {
 *     toast.success('Operación exitosa')
 *     // o
 *     toast.error('Error al procesar')
 *   }
 * }
 * ```
 */

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// ============================================
// Interfaces
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

// ============================================
// Constantes
// ============================================

const DEFAULT_DURATION = 3000 // 3 segundos
const TOAST_POSITION = 'top-right' // Posición fija

// Configuración de colores por tipo
const TOAST_CONFIG: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-500/10 border-green-500/50',
    border: 'border-green-500',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/50',
    border: 'border-red-500',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/50',
    border: 'border-yellow-500',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/50',
    border: 'border-blue-500',
    icon: <Info className="w-5 h-5 text-blue-500" />,
  },
}

// ============================================
// Componente Toast Individual
// ============================================

/**
 * Componente Toast individual
 */
function ToastItem({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = TOAST_CONFIG[toast.type]
  const duration = toast.duration ?? DEFAULT_DURATION

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(toast.id), 300) // Delay para animación de salida
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, duration, onClose])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onClose(toast.id), 300)
  }, [toast.id, onClose])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border
        ${config.bg} ${config.border}
        shadow-lg backdrop-blur-sm
        min-w-[300px] max-w-[400px]
        z-50
      `}
    >
      {/* Icono */}
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>

      {/* Mensaje */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white break-words">{toast.message}</p>
      </div>

      {/* Botón de cerrar */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// ============================================
// Hook useToast
// ============================================

interface UseToastReturn {
  toasts: Toast[]
  show: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  remove: (id: string) => void
  clear: () => void
}

/**
 * Hook para manejar toasts
 * 
 * @example
 * ```ts
 * const toast = useToast()
 * toast.success('Operación exitosa')
 * toast.error('Error al procesar')
 * ```
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, type, message, duration }
    setToasts((prev) => [...prev, newToast])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clear = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    show('success', message, duration)
  }, [show])

  const error = useCallback((message: string, duration?: number) => {
    show('error', message, duration)
  }, [show])

  const warning = useCallback((message: string, duration?: number) => {
    show('warning', message, duration)
  }, [show])

  const info = useCallback((message: string, duration?: number) => {
    show('info', message, duration)
  }, [show])

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  }
}

// ============================================
// Componente ToastContainer
// ============================================

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

/**
 * Contenedor para renderizar todos los toasts
 * 
 * Debe colocarse en el layout principal de la aplicación
 * 
 * @example
 * ```tsx
 * function App() {
 *   const toast = useToast()
 *   
 *   return (
 *     <>
 *       <YourApp />
 *       <ToastContainer toasts={toast.toasts} onClose={toast.remove} />
 *     </>
 *   )
 * }
 * ```
 */
export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

