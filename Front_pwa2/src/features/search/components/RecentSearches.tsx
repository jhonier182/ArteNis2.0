import { Search as SearchIcon } from 'lucide-react'

interface RecentSearchesProps {
  /** Lista de búsquedas recientes */
  searches: string[]
  /** Callback cuando se selecciona una búsqueda */
  onSelectSearch: (search: string) => void
  /** Callback para limpiar todas las búsquedas */
  onClearAll: () => void
}

/**
 * Componente para mostrar búsquedas recientes
 * 
 * @example
 * ```tsx
 * <RecentSearches
 *   searches={recentSearches}
 *   onSelectSearch={(search) => setSearchQuery(search)}
 *   onClearAll={clearRecentSearches}
 * />
 * ```
 */
export function RecentSearches({
  searches,
  onSelectSearch,
  onClearAll
}: RecentSearchesProps) {
  if (searches.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-300">Recientes</h2>
        <button
          onClick={onClearAll}
          className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          Borrar
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelectSearch(search)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-white">{search}</span>
          </button>
        ))}
      </div>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

