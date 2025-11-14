'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { Post } from '../services/postService'
import { formatRelativeTime } from '@/utils/formatters'
import { LikeButton, SaveButton, FollowButton } from '@/components/ui/buttons'
import { MessageCircle, Share2, MoreVertical, Volume2, VolumeX } from 'lucide-react'
import clsx from 'clsx'

interface PostCardVerticalProps {
  post: Post
  onPostClick?: (postId: string) => void
  isActive?: boolean
}

/**
 * Componente PostCard estilo TikTok/Instagram Reels
 * Diseño vertical fullscreen con autoplay de videos
 * 
 * Se ajustó la card para quedar un poco más arriba usando padding y 
 * desplazamiento vertical usando translate.
 */
export function PostCardVertical({ post, onPostClick, isActive = false }: PostCardVerticalProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  const imageUrl = post.mediaUrl || post.imageUrl || ''
  const isVideo = post.type === 'video' || post.type === 'reel'

  // Intersection Observer para autoplay
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Autoplay cuando está visible y activo
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (inView && isActive) {
        videoRef.current.play().catch(() => {
          // Ignorar errores de autoplay (políticas del navegador)
        })
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [inView, isActive, isVideo])

  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick(post.id)
    } else {
      router.push(`/postDetail?postId=${post.id}`)
    }
  }

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (post.author?.id) {
      router.push(`/userProfile?userId=${post.author.id}`)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Ajuste: desplazamos la card hacia arriba usando translate-y-[-40px] (o 10 a 12)
  // y agregamos paddingTop para evitar que suba demasiado y no se corte el contenido
  return (
    <article
      ref={ref}
      className="relative w-full h-screen snap-start snap-always bg-black overflow-hidden flex items-start justify-center"
      style={{ paddingTop: '32px' }} // 32px ~ pt-8
    >
      {/* Container desplazado hacia arriba */}
      <div
        className="w-full h-[calc(100vh-32px)] relative"
        style={{ transform: 'translateY(-90px)' }} // sube la card 90px
      >
        {/* Media Container - Fullscreen ocupando toda la pantalla */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black padding-bottom-10"
          onClick={handlePostClick}
        >
          {imageUrl ? (
            <>
              {isVideo ? (
                // Cambiar la posición de los controles flotantes un poco más arriba
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={imageUrl}
                    poster={post.thumbnailUrl}
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Botón de mute/unmute para videos. Cambiar top-4 a top-12 para subir el botón */}
                  <button
                    onClick={toggleMute}
                    className={clsx(
                      "absolute top-12 right-4 p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-30",
                      "bg-black/50", // Clase base
                      { "bg-black/70": !isMuted } // Ejemplo de clase condicional
                    )}
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  {/* Indicador de reproducción */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={imageUrl}
                    alt={post.description || post.title || 'Post'}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    unoptimized
                    priority={isActive}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Sin contenido</p>
            </div>
          )}
        </div>

        {/* Controles laterales (estilo TikTok) - Posicionados en la parte inferior derecha */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4 z-30">
          {/* Avatar del autor */}
          <button
            onClick={handleAuthorClick}
            className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white"
          >
            {post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.username || 'Usuario'}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-base">
                  {(post.author?.username || post.author?.fullName || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
          </button>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked}
              initialLikesCount={post.likesCount}
              size="lg"
              variant="minimal"
            />
            <span className="text-white text-xs font-semibold mt-1">
              {post.likesCount > 0 && post.likesCount.toLocaleString()}
            </span>
          </div>

          {/* Comment Button */}
          <button
            onClick={handlePostClick}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-semibold mt-1">
              {post.commentsCount > 0 && post.commentsCount.toLocaleString()}
            </span>
          </button>

          {/* Share Button */}
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </div>
          </button>

          {/* Save Button */}
          <SaveButton
            postId={post.id}
            initialSaved={post.isSaved || false}
            size="lg"
            variant="minimal"
          />
        </div>

        {/* Información inferior - Ajustada para no cubrir contenido, solo en la parte inferior */}
        <div className="absolute bottom-4 left-0 right-0 p-4 pb-16 md:pb-20 z-30 pointer-events-none">
          <div className="pointer-events-auto max-w-[calc(100%-80px)]">
            {/* Autor y botón seguir */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleAuthorClick}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <span className="text-white font-semibold text-sm truncate">
                  @{post.author?.username || post.author?.fullName || 'Usuario'}
                </span>
                {post.author?.isVerified && (
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              {post.author?.id && (
                <FollowButton
                  targetUserId={post.author.id}
                  initialFollowState={false}
                  size="sm"
                  showText={false}
                />
              )}
            </div>

            {/* Descripción */}
            {post.description && (
              <p className="text-white text-sm mb-2 line-clamp-2">
                {post.description}
              </p>
            )}

            {/* Tags/Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {post.hashtags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-blue-400 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Fecha */}
            <p className="text-gray-400 text-xs">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}