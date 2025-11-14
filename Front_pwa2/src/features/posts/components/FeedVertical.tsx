'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Post } from '../services/postService'
import { PostCardVertical } from './PostCardVertical'
import { Loader2 } from 'lucide-react'

interface FeedVerticalProps {
  posts: Post[]
  loading: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  isLoadingMore: boolean
  onPostClick?: (postId: string) => void
}

/**
 * Componente FeedVertical estilo TikTok/Instagram Reels
 * Scroll vertical con snap points para una experiencia fluida
 */
export function FeedVertical({
  posts,
  loading,
  hasMore,
  loadMore,
  isLoadingMore,
  onPostClick
}: FeedVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Detectar post activo basado en scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setIsScrolling(true)
      
      // Limpiar timeout anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Calcular índice activo basado en scroll
      const scrollTop = container.scrollTop
      const windowHeight = window.innerHeight
      const currentIndex = Math.round(scrollTop / windowHeight)
      
      if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < posts.length) {
        setActiveIndex(currentIndex)
      }

      // Cargar más cuando se acerca al final
      const scrollBottom = scrollTop + windowHeight
      const scrollHeight = container.scrollHeight
      const threshold = scrollHeight - windowHeight * 2 // Cargar cuando faltan 2 pantallas

      if (scrollBottom >= threshold && hasMore && !isLoadingMore && !loading) {
        loadMore()
      }

      // Detectar fin de scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [posts.length, hasMore, isLoadingMore, loading, loadMore, activeIndex])

  // Scroll suave al siguiente/anterior post (para navegación con teclado o gestos)
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return

    const targetScroll = index * window.innerHeight
    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
  }, [])

  // Navegación con teclado (opcional)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && activeIndex < posts.length - 1) {
        e.preventDefault()
        scrollToIndex(activeIndex + 1)
      } else if (e.key === 'ArrowUp' && activeIndex > 0) {
        e.preventDefault()
        scrollToIndex(activeIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, posts.length, scrollToIndex])

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando publicaciones...</p>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-gray-400">No hay publicaciones disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {posts.map((post, index) => (
        <PostCardVertical
          key={post.id}
          post={post}
          isActive={index === activeIndex && !isScrolling}
          onPostClick={onPostClick}
        />
      ))}

      {/* Loading indicator al final */}
      {isLoadingMore && (
        <div className="h-screen flex items-center justify-center bg-black snap-start">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Fin del feed */}
      {!hasMore && posts.length > 0 && (
        <div className="h-screen flex items-center justify-center bg-black snap-start">
          <p className="text-gray-400 text-sm">No hay más publicaciones</p>
        </div>
      )}
    </div>
  )
}

