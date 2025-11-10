import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'

interface SearchBarProps {
  /** Valor inicial del input (solo para inicialización) */
  value?: string
  /** Callback cuando cambia el valor (con debounce para búsqueda) */
  onChange: (value: string) => void
  /** Placeholder del input */
  placeholder?: string
  /** Si tiene autoFocus */
  autoFocus?: boolean
  /** Callback cuando se limpia */
  onClear?: () => void
  /** Tiempo de debounce en milisegundos para onChange */
  debounceMs?: number
}

/**
 * Componente de barra de búsqueda con debounce interno
 * 
 * Mantiene el estado del input localmente para evitar re-renders del padre
 * y solo notifica cambios después del debounce. Evita que el teclado se cierre.
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Buscar tatuadores..."
 *   isSearching={isSearching}
 *   debounceMs={500}
 * />
 * ```
 */
function SearchBarComponent({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  autoFocus = false,
  onClear,
  debounceMs = 500
}: SearchBarProps) {
  // Estado local completamente independiente - NO se sincroniza con el padre
  const [localValue, setLocalValue] = useState(value)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isInitializedRef = useRef(false)
  const onChangeRef = useRef(onChange)

  // Mantener onChange actualizado en el ref para evitar dependencias
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Inicializar solo una vez con el valor inicial
  useEffect(() => {
    if (!isInitializedRef.current && value) {
      setLocalValue(value)
      isInitializedRef.current = true
    }
  }, [value]) // Incluir value como dependencia

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleClear = useCallback(() => {
    setLocalValue('')
    
    // Limpiar timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Notificar inmediatamente al limpiar (usando ref para evitar dependencias)
    onChangeRef.current('')
    onClear?.()
    
    // Mantener foco en el input
    // Usar requestAnimationFrame para asegurar que se ejecute después de cualquier re-render
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [onClear])

  return (
    <div className="relative">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => {
          // Manejar cambio directamente sin pasar por función
          const newValue = e.target.value
          setLocalValue(newValue)

          // Limpiar timer anterior
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }

          // Programar actualización del estado padre con debounce
          debounceTimerRef.current = setTimeout(() => {
            onChangeRef.current(newValue)
          }, debounceMs)
        }}
        placeholder={placeholder}
        className="w-full bg-gray-800 text-white pl-12 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        autoFocus={autoFocus}
        // IMPORTANTE: Prevenir que el input pierda el foco en móviles
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        // Prevenir que el navegador interfiera con el input
        inputMode="search"
      />
      {localValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Memoizar el componente para evitar re-renders innecesarios
// Comparación personalizada: solo re-renderizar si cambian props relevantes
export const SearchBar = memo(SearchBarComponent, (prevProps, nextProps) => {
  // IMPORTANTE: El SearchBar es completamente independiente - no re-renderiza por cambios externos
  // Solo re-renderizar si cambian props realmente necesarias para el input
  return (
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.autoFocus === nextProps.autoFocus &&
    prevProps.debounceMs === nextProps.debounceMs
    // NOTA: 
    // - No comparamos 'value' porque el componente es no controlado internamente
    // - No comparamos 'onChange' porque usamos ref para evitar dependencias
    // - No comparamos 'onClear' porque usamos callback estable
    // - Eliminamos 'isSearching' completamente para evitar re-renders
  )
})

