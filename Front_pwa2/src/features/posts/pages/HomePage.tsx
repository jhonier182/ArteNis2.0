'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Bell, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { BottomNavigation } from '@/components/ui/buttons'
import { FeedVertical } from '../components/FeedVertical'
import { PostCard } from '../components/PostCard'
import { useFeed } from '../hooks/useFeed'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { posts, loading, error, hasMore, loadMore, isLoadingMore } = useFeed({ 
    limit: 20,
    autoLoad: isAuthenticated
  })
  const [feedMode, setFeedMode] = useState<'vertical' | 'classic'>('vertical')

  useEffect(() => {
    // Si terminó de cargar y no está autenticado, redirigir al login
    if (!authLoading && !isAuthenticated) {
      const timeoutId = setTimeout(() => {
        if (router.pathname !== '/login') {
          router.replace('/login')
        }
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, authLoading, router])

  const handlePostClick = useCallback((postId: string) => {
    router.push(`/postDetail?postId=${postId}`)
  }, [router])

  // Mostrar loader mientras verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (está redirigiendo)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Inkedin - Inicio</title>
      </Head>
      
      {feedMode === 'vertical' ? (
        // Feed Vertical estilo TikTok/Instagram Reels
        <div className="h-screen flex flex-col">
          {/* Header minimalista para modo vertical */}
          <header className="sticky top-0 z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Inkedin
              </h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFeedMode('classic')}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Modo clásico"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => router.push('/notifications')}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                  title="Notificaciones"
                >
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Feed Vertical */}
          <div className="flex-1 overflow-hidden">
            {loading && posts.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-400">Cargando publicaciones...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center px-4">
                <div className="text-center">
                  <p className="text-red-400 mb-4">Error al cargar el feed</p>
                  <p className="text-gray-400 text-sm mb-4">{error.message}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="h-full flex items-center justify-center px-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">No hay publicaciones</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    {user?.followingCount === 0 
                      ? 'Sigue a otros usuarios para ver sus publicaciones aquí'
                      : 'Aún no hay publicaciones en tu feed'}
                  </p>
                  <button
                    onClick={() => router.push('/search')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Explorar
                  </button>
                </div>
              </div>
            ) : (
              <FeedVertical
                posts={posts}
                loading={loading}
                hasMore={hasMore}
                loadMore={loadMore}
                isLoadingMore={isLoadingMore}
                onPostClick={handlePostClick}
              />
            )}
          </div>
        </div>
      ) : (
        // Feed Clásico estilo Instagram
        <div className="min-h-screen pb-20">
          <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Inkedin
                </h1>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setFeedMode('vertical')}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    title="Modo vertical"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-2xl mx-auto">
            {loading && posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Cargando publicaciones...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <p className="text-red-400 mb-4">Error al cargar el feed</p>
                <p className="text-gray-400 text-sm text-center">{error.message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">No hay publicaciones</h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                  {user?.followingCount === 0 
                    ? 'Sigue a otros usuarios para ver sus publicaciones aquí'
                    : 'Aún no hay publicaciones en tu feed'}
                </p>
                <button
                  onClick={() => router.push('/search')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explorar
                </button>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostClick={handlePostClick}
                  />
                ))}
                
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No hay más publicaciones</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/" />
    </div>
  )
}

