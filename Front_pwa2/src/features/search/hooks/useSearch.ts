import { useState, useCallback, useEffect, useRef } from 'react'
import { searchService } from '../services/searchService'
import { SearchUser, SearchFilters } from '../types'

interface UseSearchOptions {
  /** Tiempo de debounce en milisegundos */
  debounceMs?: number
  /** Tipo de búsqueda por defecto */
  defaultType?: 'artists' | 'posts' | 'boards' | 'all'
  /** Callback cuando la búsqueda se completa */
  onSearchComplete?: (results: SearchUser[]) => void
  /** Callback cuando hay un error */
  onError?: (error: Error) => void
}

interface UseSearchResult {
  /** Query de búsqueda actual */
  searchQuery: string
  /** Establecer query de búsqueda */
  setSearchQuery: (query: string) => void
  /** Resultados de búsqueda de usuarios */
  results: SearchUser[]
  /** Si está buscando */
  isSearching: boolean
  /** Error si ocurrió alguno */
  error: Error | null
  /** Realizar búsqueda manualmente */
  search: (query: string, filters?: SearchFilters) => Promise<void>
  /** Limpiar búsqueda */
  clearSearch: () => void
}

/**
 * Hook para búsqueda de usuarios/artistas con debounce
 * 
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery, results, isSearching } = useSearch({
 *   debounceMs: 300,
 *   defaultType: 'artists'
 * })
 * ```
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const {
    debounceMs = 300,
    onSearchComplete,
    onError
  } = options

  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Realizar búsqueda
   */
  const performSearch = useCallback(
    async (query: string, filters: SearchFilters = {}) => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      setError(null)

      try {
        // searchUsers no acepta 'type' en los filtros, lo maneja internamente
        const searchResults = await searchService.searchUsers(query, filters)

        setResults(searchResults.users)
        onSearchComplete?.(searchResults.users)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error en la búsqueda')
        setError(error)
        onError?.(error)
        setResults([])
        console.error('Error buscando usuarios:', err)
      } finally {
        setIsSearching(false)
      }
    },
    [onSearchComplete, onError]
  )

  /**
   * Actualizar query con debounce (solo si debounceMs > 0)
   * Si debounceMs es 0, ejecutar inmediatamente (el SearchBar ya tiene su propio debounce)
   */
  const handleSetSearchQuery = useCallback(
    (query: string) => {
      setSearchQuery(query)

      // Limpiar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (query.trim()) {
        if (debounceMs > 0) {
          // Configurar nuevo timer
          debounceTimerRef.current = setTimeout(() => {
            performSearch(query)
          }, debounceMs)
        } else {
          // Si debounceMs es 0, ejecutar inmediatamente (SearchBar ya tiene debounce)
          performSearch(query)
        }
      } else {
        setResults([])
      }
    },
    [performSearch, debounceMs]
  )

  /**
   * Búsqueda manual (sin debounce)
   */
  const search = useCallback(
    async (query: string, filters?: SearchFilters) => {
      setSearchQuery(query)
      await performSearch(query, filters)
    },
    [performSearch]
  )

  /**
   * Limpiar búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setResults([])
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    results,
    isSearching,
    error,
    search,
    clearSearch
  }
}

