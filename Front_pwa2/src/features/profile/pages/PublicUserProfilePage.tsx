import { useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { usePublicUserProfile } from '../hooks/usePublicUserProfile'
import { useUserPosts } from '../hooks/useUserPosts'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import { useLoadingSpinner } from '@/hooks/useLoadingSpinner'
import { Spinner } from '@/components/ui/Spinner'
import { PublicUserHeader } from '../components/PublicUserHeader'
import { PublicUserInfo } from '../components/PublicUserInfo'
import { InfiniteScrollTrigger } from '../components/LoadingIndicator'
import { logger } from '@/utils/logger'

interface PublicUserProfilePageProps {
  /** ID del usuario a mostrar */
  userId: string
}

/**
 * Página completa de perfil público de usuario
 * 
 * @example
 * ```tsx
 * <PublicUserProfilePage userId="123" />
 * ```
 */
export default function PublicUserProfilePage({
  userId
}: PublicUserProfilePageProps) {
  logger.debug(`[PublicUserProfilePage] RENDER - userId: ${userId}`)
  
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { profile, loading, error } = usePublicUserProfile(userId)
  const {
    posts,
    loading: loadingPosts,
    hasMore,
    loadMore,
    error: postsError
  } = useUserPosts(userId)

  logger.debug(`[PublicUserProfilePage] Estado: posts.length=${posts.length}, loadingPosts=${loadingPosts}, hasMore=${hasMore}`)

  // Si estoy viendo mi propio perfil, redirigir a /profile
  useEffect(() => {
    if (currentUser && profile && String(currentUser.id) === String(profile.id)) {
      router.replace('/profile')
    }
  }, [currentUser, profile, router])

  // Hook reutilizable para guardar y restaurar scroll (debe estar antes de useMemo)
  const { handlePostClick } = useScrollRestoration({
    routePath: '/userProfile',
    identifier: userId,
    posts: posts, // Usar posts directamente, no uniquePosts
    itemSelector: 'data-post-item'
  })

  // Memoizar posts únicos para evitar re-renders innecesarios
  // El filtro se ejecuta solo cuando cambia posts, no en cada render
  // IMPORTANTE: Todos los hooks deben estar antes de cualquier return condicional
  const uniquePosts = useMemo(() => {
    logger.debug(`[PublicUserProfilePage] useMemo(uniquePosts) ejecutado - posts.length=${posts.length}`)
    if (posts.length === 0) {
      logger.debug('[PublicUserProfilePage] uniquePosts: Sin posts, retornando []')
      return []
    }
    
    // Filtrar duplicados por ID de forma eficiente
    const seen = new Set<string>()
    const filtered = posts.filter((post) => {
      if (seen.has(post.id)) {
        return false
      }
      seen.add(post.id)
      return true
    })
    logger.debug(`[PublicUserProfilePage] uniquePosts: ${filtered.length} posts únicos de ${posts.length} totales`)
    return filtered
  }, [posts])

  // Solo mostrar loading cuando es la primera carga (no hay posts aún)
  // Usar posts directamente en lugar de uniquePosts para evitar flickering
  // ya que uniquePosts puede cambiar cuando posts cambia
  // Memoizar para evitar recálculos innecesarios
  const showInitialLoading = useMemo(() => {
    const result = loadingPosts && posts.length === 0
    logger.debug(`[PublicUserProfilePage] useMemo(showInitialLoading) - loadingPosts=${loadingPosts}, posts.length=${posts.length}, result=${result}`)
    return result
  }, [loadingPosts, posts.length])
  
  logger.debug(`[PublicUserProfilePage] Valores finales: uniquePosts.length=${uniquePosts.length}, showInitialLoading=${showInitialLoading}`)

  // Valores derivados que se usan en los returns
  const isArtist = profile?.userType === 'artist'

  // Hook para spinner de carga inicial
  const { SpinnerComponent: InitialSpinner } = useLoadingSpinner(loading, {
    size: 'xl',
    variant: 'primary',
    fullScreen: true,
    text: 'Cargando perfil...'
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {InitialSpinner}
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar perfil</h2>
          <p className="text-gray-400 mb-4">
            {error?.message || 'No se pudo cargar el perfil del usuario'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Head>
        <title>{profile.fullName || profile.username} - InkEndin</title>
      </Head>

      {/* Header */}
      <PublicUserHeader username={profile.username} />

      {/* Profile Content */}
      <div className="container-mobile px-6 pt-6">
        {/* Información del usuario */}
        <PublicUserInfo profile={profile} isArtist={isArtist} />

        {/* Posts del usuario */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Publicaciones</h3>
          {showInitialLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" variant="primary" withText text="Cargando publicaciones..." centered />
            </div>
          ) : uniquePosts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No hay publicaciones aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 auto-rows-[200px]">
              {uniquePosts.map((post, index) => (
                <div
                  key={post.id}
                  data-post-item
                  onClick={() => handlePostClick(post.id)}
                  className="relative overflow-hidden rounded-lg cursor-pointer"
                >
                  {post.mediaUrl ? (
                    <>
                      {post.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={post.thumbnailUrl || post.mediaUrl}
                            alt={post.title || 'Post'}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover"
                            priority={index < 4}
                            loading={index < 4 ? 'eager' : 'lazy'}
                          />
                          {/* Overlay con icono de play para videos */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={post.mediaUrl}
                          alt={post.title || 'Post'}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                          priority={index < 4}
                          loading={index < 4 ? 'eager' : 'lazy'}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger - Solo mostrar cuando hay posts y hay más por cargar */}
          {/* La carga silenciosa se maneja internamente, no muestra spinner si ya hay posts */}
          {hasMore && uniquePosts.length > 0 && (
            <InfiniteScrollTrigger 
              loading={loadingPosts}
              hasMore={hasMore}
              error={postsError ? postsError.message : null}
              onRetry={loadMore}
            />
          )}
        </div>
      </div>
    </div>
  )
}

