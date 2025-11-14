/**
 * Página de exploración de Next.js
 * 
 * Esta es la página pública que Next.js renderiza en la ruta /explore
 * Muestra publicaciones de usuarios que no se siguen y permite buscar usuarios
 */

import { useMemo, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useFollowingContext } from '@/context/FollowingContext'
import { useExplorePosts } from '@/app/explore/hooks/useExplorePosts'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useSearch } from '@/features/search/hooks/useSearch'
import { SearchBar } from '@/features/search/components/SearchBar'
import { SearchResults } from '@/features/search/components/SearchResults'
import { DiscoverPosts } from '@/features/search/components/DiscoverPosts'

export default function Explore() {
  const router = useRouter()
  const { user } = useAuth()
  const { followingUsers } = useFollowingContext()

  // Obtener IDs de usuarios seguidos
  const followingIds = useMemo(
    () => followingUsers.map((u) => u.id),
    [followingUsers]
  )

  // Búsqueda de usuarios
  const { searchQuery, setSearchQuery, results, isSearching, clearSearch } = useSearch({
    debounceMs: 0, // El SearchBar ya maneja el debounce internamente
    defaultType: 'artists'
  })

  // Cargar posts de usuarios no seguidos (solo si no hay búsqueda activa)
  // Usar useMemo para evitar recrear el hook cuando searchQuery cambia frecuentemente
  const shouldLoadPosts = useMemo(() => !searchQuery, [searchQuery])
  
  const { posts, isLoading, hasMore, loadMore } = useExplorePosts({
    autoLoad: shouldLoadPosts, // Solo cargar posts si no hay búsqueda
    limit: 20,
    followingIds,
    userId: user?.id
  })

  // Scroll infinito (solo para posts, no para búsqueda)
  const { setElement } = useInfiniteScroll({
    hasMore: !searchQuery && hasMore,
    loading: isLoading,
    onLoadMore: loadMore,
    threshold: 300
  })

  // Manejar selección de usuario
  const handleSelectUser = useCallback((userId: string) => {
    router.push(`/userProfile?userId=${userId}`)
  }, [router])

  // Manejar cambio de búsqueda
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [setSearchQuery])

  // Manejar limpieza de búsqueda
  const handleClearSearch = useCallback(() => {
    clearSearch()
  }, [clearSearch])

  // Determinar si hay búsqueda activa
  const hasSearchQuery = useMemo(() => !!searchQuery, [searchQuery])

  return (
    <>
      <Head>
        <title>Explorar - ArteNis</title>
        <meta name="description" content="Descubre arte de tatuadores que no sigues" />
      </Head>

      <div className="min-h-screen bg-black text-white pb-20">
        <div className="container-mobile px-4 pt-4 max-w-md mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">Explorar</h1>
            <div className="mb-4">
              <SearchBar
                onChange={handleSearchChange}
                placeholder="Buscar tatuadores..."
                autoFocus={false}
                onClear={handleClearSearch}
                debounceMs={500}
              />
            </div>
            {!hasSearchQuery && (
              <p className="text-gray-400 text-sm mt-1">
                Descubre publicaciones de usuarios que no sigues
              </p>
            )}
          </header>

          <div className="space-y-6">
            {hasSearchQuery ? (
              // Mostrar resultados de búsqueda de usuarios
              <SearchResults
                results={results}
                isSearching={isSearching}
                onSelectUser={handleSelectUser}
              />
            ) : (
              // Mostrar posts de usuarios no seguidos
              <>
                <DiscoverPosts
                  posts={posts}
                  isLoading={isLoading && posts.length === 0}
                  showTitle={false}
                />

                {/* Trigger para scroll infinito */}
                {hasMore && (
                  <div
                    ref={setElement}
                    className="flex justify-center items-center py-8"
                  >
                    {isLoading && (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                )}

                {/* Mensaje cuando no hay más posts */}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      No hay más publicaciones para mostrar
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

