'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { postService, Post } from '@/features/posts/services/postService'
import { LikeButton, SaveButton, ShareButton } from '@/components/ui/buttons'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useToastContext } from '@/context/ToastContext'
import { cachePost, getCachedPost } from '@/utils/cache'
import { FullScreenSpinner } from '@/components/ui/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Página de detalle de post
 * 
 * Esta página muestra el detalle completo de un post
 */
export default function PostDetailPage() {
  const router = useRouter()
  const { postId } = router.query
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToastContext()
  
  // Usar ref para evitar re-renders cuando el post ya está cargado
  const postRef = useRef<Post | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Para comentarios
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string }>>([])
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const isNavigatingRef = useRef(false)


  // Handler para "Cotizar"
  const handleCotizar = () => {
    // Aquí puedes abrir un modal, redirigir, etc.
    toast.info('¡Gracias por tu interés! Te contactaremos para cotizar.')
  }

  // Handler para navegación suave de vuelta
  const handleBack = () => {
    if (isNavigatingRef.current) return // Evitar múltiples navegaciones
    isNavigatingRef.current = true
    setIsExiting(true)
    // Esperar a que termine la animación antes de navegar
    setTimeout(() => {
      router.back()
    }, 250) // Duración de la animación de salida
  }

  // Manejar el botón atrás del navegador con animación suave
  useEffect(() => {
    const handleBeforePopState = (state: any) => {
      if (!isExiting && !isNavigatingRef.current) {
        isNavigatingRef.current = true
        setIsExiting(true)
        // Permitir la navegación después de la animación
        setTimeout(() => {
          router.back()
        }, 250)
        return false // Bloquear la navegación inmediata
      }
      return true
    }

    router.beforePopState(handleBeforePopState)

    return () => {
      // Restaurar comportamiento por defecto
      router.beforePopState(() => true)
    }
  }, [router, isExiting])

  useEffect(() => {
    if (postId && typeof postId === 'string') {
      // Verificar caché primero, antes de establecer loading
      const cachedPost = getCachedPost(postId)
      if (cachedPost) {
        // Post en caché: establecer inmediatamente sin mostrar spinner
        postRef.current = cachedPost
        setPost(cachedPost)
        setIsLoading(false)
        loadComments(postId)
        return
      }

      // No hay caché: cargar desde API
      loadPost(postId)
      loadComments(postId)
    }
  }, [postId])

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const postData = await postService.getPostById(id)
      
      // Guardar en caché
      if (postData) {
        cachePost(id, postData)
        postRef.current = postData
      }
      
      setPost(postData)
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string }; status?: number } }
      setError(error.response?.data?.message || error.message || 'Error al cargar el post')
    } finally {
      setIsLoading(false)
    }
  }

  // Mockup: cargar comentarios (en backend real sería un fetch)
  const loadComments = async (_id: string) => {
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

  // Memoizar la URL de la imagen para evitar re-renders innecesarios
  const imageUrl = useMemo(() => {
    return post?.imageUrl || post?.mediaUrl || ''
  }, [post?.imageUrl, post?.mediaUrl])

  // Memoizar si es video
  const isVideo = useMemo(() => {
    if (!post) return false
    return post.type === 'video' ||
      (post.mediaUrl &&
        (post.mediaUrl.includes('.mp4') ||
          post.mediaUrl.includes('.webm') ||
          post.mediaUrl.includes('.mov')))
  }, [post])

  // Variantes de animación para entrada y salida (tipo Instagram)
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1], // ease-out
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1], // ease-out
      },
    },
  }

  if (!postId || typeof postId !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Post no encontrado</h2>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 mt-4"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <FullScreenSpinner />
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar el post</h2>
          <p className="text-gray-400 mb-4">{error || 'No se pudo cargar el post'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="post-detail"
        initial="initial"
        animate={isExiting ? "exit" : "animate"}
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-black text-white pb-32"
      >
      <Head>
        <title>{post.title || 'Post'} - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-transparent pointer-events-none">
        <div className="container-mobile px-4 pt-4 max-w-md mx-auto">
          <motion.button
            onClick={handleBack}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Media */}
      {imageUrl && (
        <div
          className="mb-4 relative overflow-hidden bg-black rounded-xl"
          style={{
            width: 'calc(100vw - 32px)', // 16px margin each side para espacio
            maxWidth: 'calc(100vw - 32px)',
            aspectRatio: '9/16',
            maxHeight: '70vh',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {isVideo ? (
            <>
              <video
                key={post.id} // Key estable para que React reutilice el elemento
                src={post.mediaUrl || post.imageUrl}
                autoPlay
                loop
                playsInline
                poster={post.thumbnailUrl}
                className="w-full h-full object-cover rounded-xl"
                style={{
                  outline: 'none',
                  aspectRatio: '9/16',
                  maxHeight: '70vh',
                  backgroundColor: '#0f1419'
                }}
              />
              {/* Marca de agua del autor */}
              {post.author && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 z-10 border border-white/20">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.username}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                      unoptimized // Para evitar re-procesamiento de imágenes pequeñas
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {(post.author.username || post.author.fullName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-white text-sm font-medium">
                    @{post.author.username || post.author.fullName || 'Usuario'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div
              className="w-full h-full rounded-xl"
              style={{
                backgroundColor: '#000', // Fondo negro para imágenes
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                maxHeight: '70vh',
                position: 'relative'
              }}
            >
              <Image
                key={`${post.id}-${imageUrl}`} // Key estable basado en post.id
                src={imageUrl}
                alt={post.title || 'Post'}
                fill
                className="object-contain rounded-xl"
                priority
                unoptimized={true} // Cloudinary ya optimiza las imágenes, evitar doble optimización
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100vw',
                  maxHeight: '70vh',
                  backgroundColor: 'transparent' // la imagen tiene fondo transparente sobre #000
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container-mobile px-4 pt-16 pb-24 max-w-md mx-auto">
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
          <div className="flex items-center gap-4 pt-4 border-t border-neutral-800 justify-between">
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              {/* Guardar */}
              <SaveButton
                postId={post.id}
                initialSaved={post.isSaved || false}
                size="lg"
                variant="default"
              />

              {/* Compartir */}
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={post.title || 'Post en InkEndin'}
                text={post.description || ''}
                size="lg"
                variant="default"
              />


              {/* Botón Cotizar */}
              <button
                type="button"
                onClick={handleCotizar}
                className="ml-1 px-4 py-2 rounded-full font-bold text-sm transition-colors bg-gradient-to-r from-orange-400 to-red-500 text-white shadow hover:brightness-110 focus:outline-none"
                style={{minWidth: '90px'}}
              >
                Cotizar
              </button>
            </div>
          </div>

          {/* Tags */}
          {(() => {
            const postWithHashtags = post as Post & { hashtags?: string[] }
            const tags = post.tags || postWithHashtags.hashtags || []
            return tags.length > 0
          })() && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(() => {
                const postWithHashtags = post as Post & { hashtags?: string[] }
                return (post.tags || postWithHashtags.hashtags || [])
              })().map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                >
                  #{tag}
                </span>
              ))}
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

      {/* Barra de envío de comentario (sticky bottom, fondo oscuro, pegada abajo) */}
      <form
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 py-3 border-t border-neutral-900"
        style={{ boxShadow: '0 -4px 24px 0rgba(0, 0, 0, 0.6)' }}
        onSubmit={handleCommentSend}
        autoComplete="off"
      >
        <div className="container-mobile mx-auto max-w-md flex px-3 items-end gap-2">
          <input
            type="text"
            className={`flex-1 px-4 py-2 rounded-full bg-neutral-900 text-white placeholder-gray-400 outline-none border-none shadow-inner transition-all ring-1 focus:ring-2 ring-neutral-700 ${
              !isAuthenticated ? 'ring-red-400 focus:ring-red-400' : 'focus:ring-blue-500'
            }`}
            placeholder={isAuthenticated ? "Añade un comentario y participa en la conversación..." : "Inicia sesión para comentar"}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={!isAuthenticated || isCommenting}
            maxLength={240}
            aria-label="Escribe tu comentario"
            style={{ backgroundColor: '#16181d' }} // refuerza fondo muy oscuro
          />

          <button
            type="submit"
            className={`ml-1 px-4 h-10 py-2 text-sm rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              newComment.trim().length === 0 || !isAuthenticated || isCommenting
                ? 'bg-neutral-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
            disabled={newComment.trim().length === 0 || !isAuthenticated || isCommenting}
            aria-disabled={newComment.trim().length === 0 || !isAuthenticated || isCommenting}
            tabIndex={0}
          >
            {isCommenting ? (
              <>
                <span className="loader inline-block w-4 h-4 border-2 border-t-2 border-blue-200 rounded-full animate-spin mr-1"></span>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 -ml-1 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Publicar
              </>
            )}
          </button>
        </div>
        {!isAuthenticated && (
          <div className="container-mobile mx-auto max-w-md px-4 mt-2 flex items-center gap-1">
            <span className="text-xs text-red-400">
              Debes iniciar sesión para comentar.
            </span>
            <button
              type="button"
              className="text-blue-400 underline text-xs ml-2 hover:text-blue-200 transition"
              onClick={() => router.push('/login')}
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </form>
      </motion.div>
    </AnimatePresence>
  )
}

