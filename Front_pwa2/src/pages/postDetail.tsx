'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { postService, Post } from '@/features/posts/services/postService'
import { LikeButton } from '@/features/likes/components/LikeButton'
import { ChevronLeft, MessageCircle } from 'lucide-react' // Añadimos el icono de comentarios

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
  // Para comentarios
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string }>>([])
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)

  useEffect(() => {
    if (postId && typeof postId === 'string') {
      loadPost(postId)
      loadComments(postId)
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

  // Mockup: cargar comentarios (en backend real sería un fetch)
  const loadComments = async (id: string) => {
    // Aquí simulamos comentarios para ejemplo
    // Reemplazar con fetch real si tienes backend
    setComments([
      { id: '1', author: 'Alice', text: 'Excelente post!' },
      { id: '2', author: 'Bob', text: '¡Muy interesante, gracias por compartir!' },
    ])
  }

  // Mockup: enviar comentario (en backend real sería un POST)
  const handleCommentSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsCommenting(true)
    // Aquí deberías hacer un POST real
    setTimeout(() => {
      setComments(c => [
        ...c,
        {
          id: String(Date.now()),
          author: user?.fullName || user?.username || 'Tú',
          text: newComment,
        },
      ])
      setNewComment('')
      setIsCommenting(false)
    }, 500)
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
    <div className="min-h-screen bg-[#0f1419] text-white pb-32">
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
      <div className="container-mobile px-4 pt-20 pb-24 max-w-md mx-auto">
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
            {/* Comentarios */}
            <div className="flex items-center gap-1 cursor-pointer text-gray-400 hover:text-blue-400 transition">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">{comments.length}</span>
            </div>
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

          {/* Lista de comentarios */}
          <div className="pt-6">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Comentarios <span className="text-xs text-gray-400">({comments.length})</span>
            </h3>
            <div className="space-y-3 max-h-56 overflow-auto">
              {comments.length === 0 && (
                <div className="text-gray-500 text-sm">Sé el primero en comentar.</div>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2 items-start">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-md shrink-0">
                    {typeof comment.author === 'string' ? comment.author.charAt(0).toUpperCase() : ''}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{comment.author}</div>
                    <div className="text-gray-300 text-sm">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de envío de comentario (sticky bottom) */}
      <form
        // MOVEMOS UN POCO HACIA ARRIBA usando bottom-4 en vez de bottom-0
        className="fixed bottom-4 left-0 right-0 z-50 bg-[#131A22] py-3 border-t border-gray-800"
        style={{boxShadow: '0 -4px 16px 0 #0f141980'}}
        onSubmit={handleCommentSend}
      >
        <div className="container-mobile mx-auto max-w-md flex px-3 items-end gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white placeholder-gray-400 outline-none"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={!isAuthenticated || isCommenting}
            maxLength={240}
            autoComplete="off"
          />
          <button
            type="submit"
            className={`ml-1 px-4 py-2 text-sm rounded-full font-semibold transition-colors ${
              newComment.trim().length === 0 || !isAuthenticated || isCommenting
                ? 'bg-gray-700 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={newComment.trim().length === 0 || !isAuthenticated || isCommenting}
          >
            {isCommenting ? 'Enviando...' : 'Publicar'}
          </button>
        </div>
        {!isAuthenticated && (
          <div className="container-mobile mx-auto max-w-md px-4 mt-1">
            <span className="text-xs text-red-400">
              Debes iniciar sesión para comentar.
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

