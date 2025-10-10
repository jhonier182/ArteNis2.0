import { useState, useCallback } from 'react'

// Tipos para los filtros
export interface PostFilters {
  styles: string[]
  visibility: 'public' | 'private' | 'all'
  type: 'image' | 'video' | 'all'
  dateRange: 'today' | 'week' | 'month' | 'all'
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending'
}

export interface FilterOptions {
  tattooStyles: string[]
  popularStyles: string[]
  visibilityOptions: Array<{
    value: 'public' | 'private' | 'all'
    label: string
    description: string
  }>
  typeOptions: Array<{
    value: 'image' | 'video' | 'all'
    label: string
    icon: string
  }>
  dateRangeOptions: Array<{
    value: 'today' | 'week' | 'month' | 'all'
    label: string
  }>
  sortOptions: Array<{
    value: 'newest' | 'oldest' | 'popular' | 'trending'
    label: string
  }>
}

// Configuración por defecto de filtros
export const defaultFilters: PostFilters = {
  styles: [],
  visibility: 'all',
  type: 'all',
  dateRange: 'all',
  sortBy: 'newest'
}

// Opciones de filtros disponibles
export const filterOptions: FilterOptions = {
  tattooStyles: [
    'Realismo', 'Tradicional', 'Japonés', 'Acuarela',
    'Geométrico', 'Minimalista', 'Blackwork', 'Dotwork',
    'Tribal', 'Neo-tradicional', 'Ilustrativo', 'Lettering'
  ],
  popularStyles: ['Realismo', 'Tradicional', 'Japonés'],
  visibilityOptions: [
    { value: 'all', label: 'Todos', description: 'Ver todas las publicaciones' },
    { value: 'public', label: 'Público', description: 'Solo publicaciones públicas' },
    { value: 'private', label: 'Privado', description: 'Solo publicaciones privadas' }
  ],
  typeOptions: [
    { value: 'all', label: 'Todos', icon: '📷' },
    { value: 'image', label: 'Imágenes', icon: '🖼️' },
    { value: 'video', label: 'Videos', icon: '🎥' }
  ],
  dateRangeOptions: [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' }
  ],
  sortOptions: [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'popular', label: 'Más populares' },
    { value: 'trending', label: 'Tendencia' }
  ]
}

// Hook personalizado para manejo de filtros
export const usePostFilters = (initialFilters: PostFilters = defaultFilters) => {
  const [filters, setFilters] = useState<PostFilters>(initialFilters)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Toggle de estilos de tatuaje
  const toggleStyle = useCallback((style: string) => {
    setFilters(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }))
  }, [])

  // Actualizar filtro específico
  const updateFilter = useCallback(<K extends keyof PostFilters>(
    key: K,
    value: PostFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Resetear todos los filtros
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  // Resetear filtro específico
  const resetFilter = useCallback((key: keyof PostFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: defaultFilters[key]
    }))
  }, [])

  // Aplicar múltiples filtros
  const applyFilters = useCallback((newFilters: Partial<PostFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return (
      filters.styles.length > 0 ||
      filters.visibility !== 'all' ||
      filters.type !== 'all' ||
      filters.dateRange !== 'all' ||
      filters.sortBy !== 'newest'
    )
  }, [filters])

  // Contar filtros activos
  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    if (filters.styles.length > 0) count++
    if (filters.visibility !== 'all') count++
    if (filters.type !== 'all') count++
    if (filters.dateRange !== 'all') count++
    if (filters.sortBy !== 'newest') count++
    return count
  }, [filters])

  // Obtener resumen de filtros activos
  const getFiltersSummary = useCallback(() => {
    const summary: string[] = []
    
    if (filters.styles.length > 0) {
      summary.push(`${filters.styles.length} estilo${filters.styles.length > 1 ? 's' : ''}`)
    }
    
    if (filters.visibility !== 'all') {
      const visibilityLabel = filterOptions.visibilityOptions.find(
        opt => opt.value === filters.visibility
      )?.label
      if (visibilityLabel) summary.push(visibilityLabel)
    }
    
    if (filters.type !== 'all') {
      const typeLabel = filterOptions.typeOptions.find(
        opt => opt.value === filters.type
      )?.label
      if (typeLabel) summary.push(typeLabel)
    }
    
    if (filters.dateRange !== 'all') {
      const dateLabel = filterOptions.dateRangeOptions.find(
        opt => opt.value === filters.dateRange
      )?.label
      if (dateLabel) summary.push(dateLabel)
    }
    
    if (filters.sortBy !== 'newest') {
      const sortLabel = filterOptions.sortOptions.find(
        opt => opt.value === filters.sortBy
      )?.label
      if (sortLabel) summary.push(sortLabel)
    }
    
    return summary
  }, [filters])

  return {
    filters,
    setFilters,
    isFilterOpen,
    setIsFilterOpen,
    toggleStyle,
    updateFilter,
    resetFilters,
    resetFilter,
    applyFilters,
    hasActiveFilters,
    getActiveFiltersCount,
    getFiltersSummary
  }
}

// Utilidades para filtrado de datos
export const filterPosts = (posts: any[], filters: PostFilters) => {
  return posts.filter(post => {
    // Filtro por estilos
    if (filters.styles.length > 0) {
      const postStyles = post.hashtags ? post.hashtags.split(',').map((tag: string) => tag.trim()) : []
      const hasMatchingStyle = filters.styles.some(style => 
        postStyles.some((postStyle: string) => 
          postStyle.toLowerCase().includes(style.toLowerCase())
        )
      )
      if (!hasMatchingStyle) return false
    }

    // Filtro por visibilidad
    if (filters.visibility !== 'all') {
      if (post.visibility !== filters.visibility) return false
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      if (post.type !== filters.type) return false
    }

    // Filtro por rango de fecha
    if (filters.dateRange !== 'all') {
      const postDate = new Date(post.createdAt)
      const now = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          if (postDate < today) return false
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (postDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (postDate < monthAgo) return false
          break
      }
    }

    return true
  })
}

// Utilidades para ordenamiento
export const sortPosts = (posts: any[], sortBy: PostFilters['sortBy']) => {
  const sortedPosts = [...posts]
  
  switch (sortBy) {
    case 'newest':
      return sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sortedPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'popular':
      return sortedPosts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    case 'trending':
      // Algoritmo simple de trending basado en likes recientes y comentarios
      return sortedPosts.sort((a, b) => {
        const aScore = (a.likesCount || 0) + (a.commentsCount || 0) * 2
        const bScore = (b.likesCount || 0) + (b.commentsCount || 0) * 2
        return bScore - aScore
      })
    default:
      return sortedPosts
  }
}

// Función principal para aplicar filtros y ordenamiento
export const applyPostFilters = (posts: any[], filters: PostFilters) => {
  const filteredPosts = filterPosts(posts, filters)
  return sortPosts(filteredPosts, filters.sortBy)
}

// Constantes para validación
export const FILTER_CONSTRAINTS = {
  MAX_STYLES: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const

// Validadores
export const validateFilters = (filters: PostFilters): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (filters.styles.length > FILTER_CONSTRAINTS.MAX_STYLES) {
    errors.push(`Máximo ${FILTER_CONSTRAINTS.MAX_STYLES} estilos permitidos`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Exportar todo como un objeto para facilitar el uso
export const PostFiltersUtils = {
  defaultFilters,
  filterOptions,
  usePostFilters,
  filterPosts,
  sortPosts,
  applyPostFilters,
  validateFilters,
  FILTER_CONSTRAINTS
} as const
