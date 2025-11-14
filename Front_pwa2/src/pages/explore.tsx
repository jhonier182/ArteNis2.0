/**
 * Página de exploración de Next.js
 * 
 * Esta es la página pública que Next.js renderiza en la ruta /explore
 * Muestra publicaciones de usuarios que no se siguen
 */

import { useMemo } from 'react'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useFollowingContext } from '@/context/FollowingContext'
import { useExplorePosts } from '@/app/explore/hooks/useExplorePosts'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { DiscoverPosts } from '@/features/search/components/DiscoverPosts'

export default function Explore() {
  const { user } = useAuth()
  const { followingUsers } = useFollowingContext()

  // Obtener IDs de usuarios seguidos
  const followingIds = useMemo(
    () => followingUsers.map((u) => u.id),
    [followingUsers]
  )

  // Cargar posts de usuarios no seguidos
  const { posts, isLoading, hasMore, loadMore } = useExplorePosts({
    autoLoad: true,
    limit: 20,
    followingIds,
    userId: user?.id
  })

  // Scroll infinito
  const { setElement } = useInfiniteScroll({
    hasMore,
    loading: isLoading,
    onLoadMore: loadMore,
    threshold: 300
  })

  return (
    <>
      <Head>
        <title>Explorar - ArteNis</title>
        <meta name="description" content="Descubre arte de tatuadores que no sigues" />
      </Head>

      <div className="min-h-screen bg-black text-white pb-20">
        <div className="container-mobile px-4 pt-4 max-w-md mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white">Explorar</h1>
            <p className="text-gray-400 text-sm mt-1">
              Descubre publicaciones de usuarios que no sigues
            </p>
          </header>

          <div className="space-y-6">
            <DiscoverPosts
              posts={posts}
              isLoading={isLoading && posts.length === 0}
              showTitle={false}
            />
          </div>

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
        </div>
      </div>
    </>
  )
}

