import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { usePublicUserProfile } from '../hooks/usePublicUserProfile'
import { useUserPosts } from '../hooks/useUserPosts'
import { PublicUserHeader } from '../components/PublicUserHeader'
import { PublicUserInfo } from '../components/PublicUserInfo'
import { InfiniteScrollTrigger } from '../components/LoadingIndicator'

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
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { profile, loading, error } = usePublicUserProfile(userId)
  const {
    posts,
    loading: loadingPosts,
    hasMore,
    loadMore
  } = useUserPosts(userId)

  // Si estoy viendo mi propio perfil, redirigir a /profile
  useEffect(() => {
    if (currentUser && profile && String(currentUser.id) === String(profile.id)) {
      router.replace('/profile')
    }
  }, [currentUser, profile, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419] text-white">
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

  const isArtist = profile.userType === 'artist'

  return (
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
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
          {loadingPosts && posts.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No hay publicaciones aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 auto-rows-[200px]">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/postDetail?postId=${post.id}`)}
                  className="relative overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  {post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title || 'Post'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {hasMore && <InfiniteScrollTrigger onLoadMore={loadMore} loading={loadingPosts} />}
        </div>
      </div>
    </div>
  )
}

