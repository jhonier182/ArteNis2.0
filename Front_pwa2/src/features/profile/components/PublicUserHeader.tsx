import { ChevronLeft, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/router'

interface PublicUserHeaderProps {
  /** Nombre de usuario */
  username: string
  /** Callback cuando se hace click en volver */
  onBack?: () => void
  /** Callback cuando se hace click en opciones */
  onMore?: () => void
}

/**
 * Header para perfil público de usuario
 * 
 * @example
 * ```tsx
 * <PublicUserHeader
 *   username="johndoe"
 *   onBack={() => router.back()}
 * />
 * ```
 */
export function PublicUserHeader({
  username,
  onBack,
  onMore
}: PublicUserHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container-mobile px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{username}</h1>
          {onMore ? (
            <button
              onClick={onMore}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Opciones"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" /> // Spacer para centrar el título
          )}
        </div>
      </div>
    </header>
  )
}

