/**
 * Contexto global para Toast
 * 
 * Proporciona acceso al sistema de Toast en toda la aplicación
 * sin necesidad de pasar props manualmente.
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useToast, ToastContainer } from '@/components/ui/Toast'

interface ToastContextType {
  toast: ReturnType<typeof useToast>
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

/**
 * Provider del contexto de Toast
 * 
 * Debe envolver la aplicación en _app.tsx
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const toast = useToast()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.remove} />
    </ToastContext.Provider>
  )
}

/**
 * Hook para usar el contexto de Toast
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { toast } = useToastContext()
 *   
 *   const handleClick = () => {
 *     toast.success('Operación exitosa')
 *   }
 * }
 * ```
 */
export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext debe usarse dentro de ToastProvider')
  }
  return context
}

