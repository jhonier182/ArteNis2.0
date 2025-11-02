'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { postService, Post } from '@/features/posts/services/postService'
import { LikeButton } from '@/features/likes/components/LikeButton'
import { ChevronLeft } from 'lucide-react'

/**
 * Página de detalle de post
 * Ruta: /postDetail?postId=xxx
 * 
 * Esta página muestra el detalle completo de un post
 */
export default function PostDetailPage() {
  const router = useRouter()
  const { postId } = router.query
  const { user, isAuthenticated } = useAuth()
  
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (postId && typeof postId === 'string') {
      loadPost(postId)
    }
  }, [postId])

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📥 Cargando post con ID:', id)
      const postData = await postService.getPostById(id)
      console.log('✅ Post cargado:', postData)
      setPost(postData)
    } catch (err: any) {
      console.error('❌ Error cargando post:', err)
      console.error('❌ Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      setError(err.response?.data?.message || err.message || 'Error al cargar el post')
    } finally {
      setIsLoading(false)
    }
  }

  if (!postId || typeof postId !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419] text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Post no encontrado</h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 mt-4"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419] text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar el post</h2>
          <p className="text-gray-400 mb-4">{error || 'No se pudo cargar el post'}</p>
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
    <div className="min-h-screen bg-[#0f1419] text-white pb-20">
      <Head>
        <title>{post.title || 'Post'} - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container-mobile px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
              aria-label="Volver"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold truncate flex-1">Publicación</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-mobile px-4 pt-20 max-w-md mx-auto">
        {/* Media */}
        {(post.imageUrl || (post as any).mediaUrl) && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.imageUrl || (post as any).mediaUrl}
              alt={post.title || 'Post'}
              className="w-full h-auto object-contain bg-gray-900"
            />
          </div>
        )}

        {/* Post Info */}
        <div className="space-y-4">
          {/* Title and Description */}
          {post.title && (
            <h2 className="text-xl font-bold">{post.title}</h2>
          )}
          {post.description && (
            <p className="text-gray-300 whitespace-pre-wrap">{post.description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked || false}
              initialLikesCount={post.likesCount || 0}
              showCount={true}
              variant="default"
            />
          </div>

          {/* Tags */}
          {((post.tags && post.tags.length > 0) || ((post as any).hashtags && (post as any).hashtags.length > 0)) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(post.tags || (post as any).hashtags || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Info */}
          {post.author && (
            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Publicado por{' '}
                <span className="text-white font-medium">
                  {post.author.fullName || post.author.username}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

