import { motion } from 'framer-motion'

interface LoadingIndicatorProps {
  loading: boolean
  hasMore: boolean
  error: string | null
  onRetry?: () => void
  className?: string
}

export default function LoadingIndicator({ 
  loading, 
  hasMore, 
  error, 
  onRetry,
  className = ''
}: LoadingIndicatorProps) {
  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (!hasMore && !loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm">No hay más publicaciones</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2"
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-400 text-sm">Cargando más publicaciones...</span>
        </motion.div>
      </div>
    )
  }

  return null
}

// Componente específico para el trigger del scroll infinito
export function InfiniteScrollTrigger({ 
  loading, 
  hasMore, 
  error, 
  onRetry 
}: Omit<LoadingIndicatorProps, 'className'>) {
  return (
    <div className="py-4">
      <LoadingIndicator 
        loading={loading} 
        hasMore={hasMore} 
        error={error} 
        onRetry={onRetry}
      />
    </div>
  )
}
