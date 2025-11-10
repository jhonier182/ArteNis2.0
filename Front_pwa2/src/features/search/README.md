# Feature de Búsqueda

Feature completo y modular para búsqueda de usuarios, posts y boards. Sigue principios DRY y arquitectura modular.

## Estructura

```
search/
├── types/           # Tipos TypeScript
├── services/        # Llamadas API
├── hooks/          # Hooks reutilizables
├── components/     # Componentes UI
├── pages/          # Páginas del feature
└── index.ts        # Exportaciones públicas
```

## Uso

### Importar desde el feature

```tsx
import {
  useSearch,
  useSearchPosts,
  useRecentSearches,
  SearchBar,
  SearchResponse,
  SearchPage
} from '@/features/search'
```

### Hook: useSearch

Búsqueda de usuarios/artistas con debounce automático:

```tsx
const { searchQuery, setSearchQuery, results, isSearching } = useSearch({
  debounceMs: 300,
  defaultType: 'artists'
})
```

### Hook: useSearchPosts

Manejo de posts públicos con caché y filtrado:

```tsx
const { posts, isLoading, loadFilteredPosts } = useSearchPosts({
  autoLoad: true,
  limit: 50
})

// Filtrar posts excluyendo usuarios seguidos
const filtered = await loadFilteredPosts(followingIds, userId)
```

### Hook: useRecentSearches

Gestión de búsquedas recientes en localStorage:

```tsx
const { recentSearches, addSearch, clearRecentSearches } = useRecentSearches()
```

### Hook: useFollowing

Manejo de usuarios seguidos con caché:

```tsx
const { followingUsers, isFollowing, refreshFollowing } = useFollowing()
```

### Componentes

#### SearchBar

Barra de búsqueda con debounce y limpieza:

```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Buscar tatuadores..."
  isSearching={isSearching}
/>
```

#### SearchResults

Lista de resultados de búsqueda:

```tsx
<SearchResults
  results={results}
  isSearching={isSearching}
  onSelectUser={(userId) => router.push(`/user/${userId}`)}
  onFollowUser={handleFollowUser}
  isFollowing={(userId) => followingUsers.includes(userId)}
/>
```

#### RecentSearches

Búsquedas recientes:

```tsx
<RecentSearches
  searches={recentSearches}
  onSelectSearch={setSearchQuery}
  onClearAll={clearRecentSearches}
/>
```

#### DiscoverPosts

Grid de posts públicos para descubrir:

```tsx
<DiscoverPosts
  posts={posts}
  isLoading={isLoading}
  onPostClick={(postId) => router.push(`/post/${postId}`)}
/>
```

## Servicios

### searchService

```tsx
import { searchService } from '@/features/search'

// Búsqueda general
const results = await searchService.search('tatuaje', {
  type: 'all',
  city: 'Bogotá',
  page: 1,
  limit: 20
})

// Solo usuarios
const users = await searchService.searchUsers('artista')

// Solo posts
const posts = await searchService.searchPosts('tatuaje')

// Posts públicos (sin query)
const discoverPosts = await searchService.getDiscoverPosts(50)

// Sugerencias
const suggestions = await searchService.getSuggestions('ta')
```

## Endpoints API

- `GET /api/search?q=query&type=artists&city=...` - Búsqueda general
- `GET /api/search/suggestions?q=query` - Sugerencias
- `GET /api/follow/following` - Usuarios seguidos

## Características

- ✅ Búsqueda con debounce automático
- ✅ Caché inteligente para reducir llamadas API
- ✅ Búsquedas recientes persistentes
- ✅ Filtrado de posts (excluye seguidos y propios)
- ✅ Actualización optimista de UI
- ✅ Tipado completo con TypeScript
- ✅ Componentes reutilizables
- ✅ Arquitectura modular (DRY)

## Páginas

La página `/search` usa el componente `SearchPage` que integra todos los componentes y hooks del feature.

