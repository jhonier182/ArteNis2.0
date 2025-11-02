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
    <header className="sticky top-0 z-50 bg-transparent pointer-events-none">
      <div className="container-mobile px-4 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold pointer-events-none opacity-0">{username}</h1>
          {onMore ? (
            <button
              onClick={onMore}
              className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg"
              aria-label="Opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" /> // Spacer para centrar el título
          )}
        </div>
      </div>
    </header>
  )
}

