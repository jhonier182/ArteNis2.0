import React from 'react'
import Image from 'next/image'
import { UserPost } from '../services/profileService'

interface ProfilePostItemProps {
  post: UserPost
  index: number
  onClick: (postId: string) => void
  aspectRatio?: '3/4' | 'auto' // Para permitir diferentes aspect ratios según el contexto
}

/**
 * Componente memoizado para renderizar un post en el grid del perfil
 * Evita re-renders innecesarios cuando se vuelve desde PostDetailPage
 */
const ProfilePostItem = React.memo<ProfilePostItemProps>(({ post, index, onClick, aspectRatio = 'auto' }) => {
  const handleClick = React.useCallback(() => {
    onClick(post.id)
  }, [post.id, onClick])

  const containerClassName = aspectRatio === '3/4' 
    ? "relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 cursor-pointer"
    : "relative overflow-hidden rounded-lg cursor-pointer"

  return (
    <div
      data-post-item
      data-post-id={post.id}
      onClick={handleClick}
      className={containerClassName}
    >
      {post.mediaUrl ? (
        <>
          {post.type === 'video' ? (
            <div className="relative w-full h-full">
              <Image
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.title || post.description || 'Post'}
                width={aspectRatio === '3/4' ? 300 : 400}
                height={aspectRatio === '3/4' ? 300 : 300}
                className="w-full h-full object-cover"
                unoptimized={true}
                priority={index < 4}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
              {/* Overlay con icono de play para videos */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className={`${aspectRatio === '3/4' ? 'w-12 h-12' : 'w-10 h-10'} bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm`}>
                  <svg className={`${aspectRatio === '3/4' ? 'w-6 h-6' : 'w-5 h-5'} text-white ml-1`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={post.mediaUrl}
              alt={post.title || post.description || 'Post'}
              width={aspectRatio === '3/4' ? 300 : 400}
              height={aspectRatio === '3/4' ? 300 : 300}
              className="w-full h-full object-cover"
              priority={index < 4}
              loading={index < 4 ? 'eager' : 'lazy'}
              unoptimized={true}
            />
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <span className="text-gray-400">Sin imagen</span>
        </div>
      )}
    </div>
  )
})

ProfilePostItem.displayName = 'ProfilePostItem'

export default ProfilePostItem

