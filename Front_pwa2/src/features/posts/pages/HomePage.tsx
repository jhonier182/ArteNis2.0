'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Bell, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { BottomNavigation } from '@/components/ui/buttons'
import { PostCard } from '../components/PostCard'
import { useFeed } from '../hooks/useFeed'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { posts, loading, error, hasMore, loadMore, isLoadingMore } = useFeed({ 
    limit: 20,
    autoLoad: isAuthenticated
  })
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Scroll infinito con Intersection Observer
  useEffect(() => {
    if (!isAuthenticated) return

    const loadMoreElement = loadMoreRef.current
    if (!loadMoreElement) return

    // Crear observer para detectar cuando el elemento es visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry.isIntersecting && hasMore && !loading && !isLoadingMore) {
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: '100px', // Cargar cuando esté a 100px de distancia
        threshold: 0.1
      }
    )

    observerRef.current.observe(loadMoreElement)

    return () => {
      if (observerRef.current && loadMoreElement) {
        observerRef.current.unobserve(loadMoreElement)
      }
    }
  }, [hasMore, loading, isLoadingMore, loadMore, isAuthenticated])

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
    <div className="min-h-screen bg-black text-white pb-20">
      <Head>
        <title>Inkedin - Inicio</title>
      </Head>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Inkedin
            </h1>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Feed de Posts */}
      <main className="max-w-2xl mx-auto">
        {loading && posts.length === 0 ? (
          // Carga inicial
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Cargando publicaciones...</p>
          </div>
        ) : error ? (
          // Error
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
          // Sin posts
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
          // Lista de posts
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostClick={handlePostClick}
              />
            ))}
            
            {/* Elemento para detectar scroll infinito */}
            <div ref={loadMoreRef} className="py-4">
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
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/" />
    </div>
  )
}

