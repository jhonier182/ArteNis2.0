import React from 'react'
import Image from 'next/image'
import { Bookmark } from 'lucide-react'
import { SavedPost } from '../services/profileService'

interface ProfileSavedPostItemProps {
  post: SavedPost
  onClick: (postId: string) => void
}

/**
 * Componente memoizado para renderizar un post guardado en el grid del perfil
 * Evita re-renders innecesarios cuando se vuelve desde PostDetailPage
 */
const ProfileSavedPostItem = React.memo<ProfileSavedPostItemProps>(({ post, onClick }) => {
  const handleClick = React.useCallback(() => {
    onClick(post.id)
  }, [post.id, onClick])

  return (
    <div
      key={post.id}
      data-post-item
      data-post-id={post.id}
      onClick={handleClick}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-800 cursor-pointer"
    >
      {post.mediaUrl && (
        <>
          {post.type === 'video' ? (
            <div className="relative w-full h-full">
              <Image
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.description || 'Post'}
                width={400}
                height={500}
                className="w-full h-full object-cover"
                unoptimized={true}
              />
              {/* Overlay con icono de play para videos */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={post.mediaUrl}
              alt={post.description || 'Post'}
              width={400}
              height={500}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          )}
        </>
      )}
      <div className="absolute top-2 right-2">
        <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
      </div>
    </div>
  )
})

ProfileSavedPostItem.displayName = 'ProfileSavedPostItem'

export default ProfileSavedPostItem

