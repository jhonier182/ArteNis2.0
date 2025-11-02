import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'recentSearches'
const MAX_RECENT_SEARCHES = 5

/**
 * Hook para manejar búsquedas recientes guardadas en localStorage
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Cargar búsquedas recientes al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed)
        }
      } catch (error) {
        console.error('Error cargando búsquedas recientes:', error)
      }
    }
  }, [])

  /**
   * Agregar una búsqueda a las recientes
   */
  const addSearch = useCallback((searchTerm: string) => {
    if (!searchTerm || !searchTerm.trim()) return

    setRecentSearches((prev) => {
      const trimmed = searchTerm.trim()
      // Remover si ya existe y agregar al principio
      const filtered = prev.filter((s) => s !== trimmed)
      const newSearches = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES)

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches))

      return newSearches
    })
  }, [])

  /**
   * Limpiar todas las búsquedas recientes
   */
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  /**
   * Remover una búsqueda específica
   */
  const removeSearch = useCallback((searchTerm: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== searchTerm)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return filtered
    })
  }, [])

  return {
    recentSearches,
    addSearch,
    clearRecentSearches,
    removeSearch
  }
}

