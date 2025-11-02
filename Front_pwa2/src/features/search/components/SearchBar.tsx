import { Search as SearchIcon, X } from 'lucide-react'

interface SearchBarProps {
  /** Valor del input */
  value: string
  /** Callback cuando cambia el valor */
  onChange: (value: string) => void
  /** Placeholder del input */
  placeholder?: string
  /** Si está buscando */
  isSearching?: boolean
  /** Si tiene autoFocus */
  autoFocus?: boolean
  /** Callback cuando se limpia */
  onClear?: () => void
}

/**
 * Componente de barra de búsqueda
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Buscar tatuadores..."
 *   isSearching={isSearching}
 * />
 * ```
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  isSearching = false,
  autoFocus = false,
  onClear
}: SearchBarProps) {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 text-white pl-12 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        autoFocus={autoFocus}
        disabled={isSearching}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}

