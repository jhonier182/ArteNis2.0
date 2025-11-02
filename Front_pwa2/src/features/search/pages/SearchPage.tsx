import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSearch } from '../hooks/useSearch'
import { useSearchPosts } from '../hooks/useSearchPosts'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useFollowing } from '../hooks/useFollowing'
import { SearchBar } from '../components/SearchBar'
import { SearchResults } from '../components/SearchResults'
import { RecentSearches } from '../components/RecentSearches'
import { DiscoverPosts } from '../components/DiscoverPosts'

/**
 * Página de búsqueda completa
 * 
 * Integra todos los componentes y hooks del feature de búsqueda
 */
export default function SearchPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { followingUsers } = useFollowing()
  const { searchQuery, setSearchQuery, results, isSearching, clearSearch } = useSearch({
    debounceMs: 0, // El SearchBar ya maneja el debounce internamente
    defaultType: 'artists'
  })
  const { recentSearches, addSearch, clearRecentSearches } = useRecentSearches()
  const { posts, isLoading: loadingPosts, loadFilteredPosts } = useSearchPosts({
    autoLoad: false
  })

  const [publicPosts, setPublicPosts] = useState<any[]>([])
  const [isLoadingFilteredPosts, setIsLoadingFilteredPosts] = useState(false)

  // Memoizar followingIds para evitar recálculos
  const followingIds = useMemo(
    () => followingUsers.map((u) => u.id),
    [followingUsers]
  )

  // Cargar publicaciones cuando se carguen los usuarios seguidos
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (user?.id && followingUsers.length >= 0 && isMounted) {
        setIsLoadingFilteredPosts(true)
        try {
          const filteredPosts = await loadFilteredPosts(followingIds, user.id)
          if (isMounted) {
            setPublicPosts(filteredPosts)
          }
        } catch (error) {
          console.error('Error cargando posts filtrados:', error)
          if (isMounted) {
            setPublicPosts([])
          }
        } finally {
          if (isMounted) {
            setIsLoadingFilteredPosts(false)
          }
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user?.id, followingIds, loadFilteredPosts])

  // Handler estable para evitar re-creaciones
  const handleSelectUser = useCallback(
    (userId: string) => {
      // Agregar a búsquedas recientes
      const foundUser = results.find((u) => u.id === userId)
      if (foundUser) {
        addSearch(foundUser.username)
      }
      // Navegar al perfil del usuario
      router.push(`/userProfile?userId=${userId}`)
    },
    [results, addSearch, router]
  )

  const handleClearSearch = useCallback(() => {
    clearSearch()
  }, [clearSearch])

  // Handler para onChange del SearchBar - estable para evitar re-renders
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [setSearchQuery])

  // Memoizar contenido para evitar re-renders innecesarios
  const hasSearchQuery = useMemo(() => !!searchQuery, [searchQuery])

  // Separar el header del contenido principal para evitar re-renders del header
  // IMPORTANTE: NO incluir isSearching en las dependencias para evitar re-renders
  const searchHeader = useMemo(() => (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-transparent pointer-events-none">
      <div className="container-mobile px-4 pt-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg flex-shrink-0"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 pointer-events-auto">
            <SearchBar
              onChange={handleSearchChange}
              placeholder="Buscar tatuadores..."
              autoFocus={true}
              onClear={handleClearSearch}
              debounceMs={500}
            />
          </div>
        </div>
      </div>
    </header>
  ), [router, handleSearchChange, handleClearSearch]) // NO incluir isSearching

  // Memoizar el contenido principal - solo se re-renderiza cuando cambian resultados
  const mainContent = useMemo(() => {
    if (!hasSearchQuery) {
      return (
        <div>
          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && (
            <RecentSearches
              searches={recentSearches}
              onSelectSearch={setSearchQuery}
              onClearAll={clearRecentSearches}
            />
          )}

          {/* Publicaciones Públicas */}
          <DiscoverPosts
            posts={publicPosts}
            isLoading={isLoadingFilteredPosts}
          />
        </div>
      )
    }

    return (
      <SearchResults
        results={results}
        isSearching={isSearching}
        onSelectUser={handleSelectUser}
      />
    )
  }, [
    hasSearchQuery,
    recentSearches,
    setSearchQuery,
    clearRecentSearches,
    publicPosts,
    isLoadingFilteredPosts,
    results,
    isSearching,
    handleSelectUser
  ])

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>Buscar - InkEndin</title>
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </Head>

      {/* Header con búsqueda - Memoizado para evitar re-renders */}
      {searchHeader}

      {/* Main Content - Con padding-top para compensar el header fijo */}
      <main className="container-mobile max-w-md mx-auto px-4 py-6 pt-20">
        {mainContent}
      </main>
    </div>
  )
}

