import { useRouter } from 'next/router'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { SearchPost } from '../types'

interface DiscoverPostsProps {
  /** Posts para mostrar */
  posts: SearchPost[]
  /** Si está cargando */
  isLoading: boolean
  /** Callback cuando se hace click en un post */
  onPostClick?: (postId: string) => void
  /** Mostrar título (por defecto true) */
  showTitle?: boolean
  /** Título personalizado */
  title?: string
}

/**
 * Componente para mostrar posts públicos en grid para descubrir
 * 
 * @example
 * ```tsx
 * <DiscoverPosts
 *   posts={discoverPosts}
 *   isLoading={loadingPosts}
 *   onPostClick={(postId) => router.push(`/post/${postId}`)}
 * />
 * ```
 */
export function DiscoverPosts({
  posts,
  isLoading,
  onPostClick,
  showTitle = true,
  title = 'Descubre Arte'
}: DiscoverPostsProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 text-sm">No hay publicaciones disponibles</p>
      </div>
    )
  }

  const handlePostClick = (postId: string) => {
    if (onPostClick) {
      onPostClick(postId)
    } else {
      router.push(`/postDetail?postId=${postId}`)
    }
  }

  return (
    <div>
      {showTitle && (
        <h2 className="text-base font-semibold text-gray-300 mb-3">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-2">
        {posts
          .filter((post) => post && post.id)
          .map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-[4/5] overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <button
                onClick={() => handlePostClick(post.id)}
                className="w-full h-full block relative group"
              >
                {post.mediaUrl ? (
                  <>
                    {post.type === 'video' ? (
                      <video
                        src={post.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <Image
                        src={post.mediaUrl}
                        alt={post.title || 'Post'}
                        width={400}
                        height={500}
                        className="w-full h-full object-cover"
                        priority={index < 4}
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    )}
                    {/* Overlay con icono de play para videos */}
                    {post.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <svg
                            className="w-6 h-6 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </button>
            </motion.div>
          ))}
      </div>
    </div>
  )
}

