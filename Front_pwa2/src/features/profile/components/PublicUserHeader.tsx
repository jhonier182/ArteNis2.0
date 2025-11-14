import { MoreVertical } from 'lucide-react'

interface PublicUserHeaderProps {
  /** Nombre de usuario */
  username: string
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
 * />
 * ```
 */
export function PublicUserHeader({
  username,
  onMore
}: PublicUserHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-transparent pointer-events-none">
      <div className="container-mobile px-4 pt-4">
        <div className="flex items-center justify-end">
          <h1 className="text-lg font-bold pointer-events-none opacity-0 flex-1">{username}</h1>
          {onMore ? (
            <button
              onClick={onMore}
              className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg"
              aria-label="Opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" /> // Spacer para mantener el layout
          )}
        </div>
      </div>
    </header>
  )
}

