/**
 * Feature de búsqueda - Exportaciones principales
 * 
 * Este feature proporciona toda la funcionalidad relacionada con búsqueda
 * de usuarios, posts y boards, siguiendo principios DRY y arquitectura modular
 */

// Tipos
export type {
  SearchType,
  SearchFilters,
  SearchUser,
  SearchPost,
  SearchBoard,
  SearchResponse,
  SearchSuggestions,
  PaginationInfo
} from './types'

// Servicios
export { searchService } from './services/searchService'

// Hooks
export { useSearch } from './hooks/useSearch'
export { useSearchPosts, clearSearchPostsCache } from './hooks/useSearchPosts'
export { useRecentSearches } from './hooks/useRecentSearches'
export { useFollowing, clearFollowingCache } from './hooks/useFollowing'

// Componentes
export { SearchBar } from './components/SearchBar'
export { SearchResults } from './components/SearchResults'
export { RecentSearches } from './components/RecentSearches'
export { DiscoverPosts } from './components/DiscoverPosts'

// Páginas
export { default as SearchPage } from './pages/SearchPage'

