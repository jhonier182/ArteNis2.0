'use client'

import React from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Post } from '../services/postService'
import { formatRelativeTime } from '@/utils/formatters'
import { LikeButton, SaveButton } from '@/components/ui/buttons'
import { MessageCircle, MoreHorizontal } from 'lucide-react'

interface PostCardProps {
  post: Post
  onPostClick?: (postId: string) => void
}

/**
 * Componente PostCard estilo Instagram
 * Muestra un post completo con header, imagen, acciones y descripción
 */
export function PostCard({ post, onPostClick }: PostCardProps) {
  const router = useRouter()

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
      router.push(`/profile/${post.author.id}`)
    }
  }

  const imageUrl = post.mediaUrl || post.imageUrl || ''
  const isVideo = post.type === 'video' || post.type === 'reel'

  return (
    <article className="bg-black border-b border-gray-800">
      {/* Header del post - Autor */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleAuthorClick}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          {post.author?.avatar ? (
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={post.author.avatar}
                alt={post.author.username || 'Usuario'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-gray-700"
                unoptimized
              />
              {post.author.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {(post.author?.username || post.author?.fullName || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm truncate">
                {post.author?.username || post.author?.fullName || 'Usuario'}
              </span>
              {post.author?.isVerified && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {post.author?.fullName && post.author.fullName !== post.author.username && (
              <p className="text-gray-400 text-xs truncate">{post.author.fullName}</p>
            )}
          </div>
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Imagen/Video del post */}
      <div 
        className="relative w-full bg-black cursor-pointer"
        onClick={handlePostClick}
      >
        {imageUrl ? (
          <>
            {isVideo ? (
              <div className="relative aspect-[9/16] max-h-[600px] mx-auto">
                <Image
                  src={post.thumbnailUrl || imageUrl}
                  alt={post.description || post.title || 'Post'}
                  fill
                  className="object-contain"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full aspect-square max-h-[600px] mx-auto">
                <Image
                  src={imageUrl}
                  alt={post.description || post.title || 'Post'}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-full aspect-square bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Sin imagen</p>
          </div>
        )}
      </div>

      {/* Acciones (Like, Comentar, Guardar) */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked}
              initialLikesCount={post.likesCount}
              size="md"
            />
            <button
              onClick={handlePostClick}
              className="p-0 hover:opacity-70 transition-opacity"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <button className="p-0 hover:opacity-70 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <SaveButton
            postId={post.id}
            initialSaved={post.isSaved || false}
            size="md"
            variant="minimal"
          />
        </div>

        {/* Likes count */}
        {post.likesCount > 0 && (
          <div className="mb-1">
            <p className="text-white font-semibold text-sm">
              {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'me gusta' : 'me gusta'}
            </p>
          </div>
        )}

        {/* Descripción y autor */}
        {post.description && (
          <div className="mb-1">
            <p className="text-white text-sm">
              <button
                onClick={handleAuthorClick}
                className="font-semibold hover:opacity-70 transition-opacity"
              >
                {post.author?.username || 'Usuario'}
              </button>
              {' '}
              <span>{post.description}</span>
            </p>
          </div>
        )}

        {/* Ver todos los comentarios */}
        {post.commentsCount > 0 && (
          <button
            onClick={handlePostClick}
            className="text-gray-400 text-sm hover:text-gray-300 transition-colors mb-1"
          >
            Ver los {post.commentsCount} {post.commentsCount === 1 ? 'comentario' : 'comentarios'}
          </button>
        )}

        {/* Fecha */}
        <p className="text-gray-400 text-xs uppercase mt-2">
          {formatRelativeTime(post.createdAt)}
        </p>
      </div>
    </article>
  )
}

