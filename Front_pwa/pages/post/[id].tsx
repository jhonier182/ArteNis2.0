import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Send
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'

export default function PostDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated } = useUser()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (id) {
      loadPost()
    }
  }, [id])

  const loadPost = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/api/posts/${id}`)
      const postData = response.data.data.post
      setPost(postData)
      setIsLiked(postData.isLiked || false)
      setLikesCount(postData.likesCount || 0)
    } catch (error) {
      console.error('Error al cargar post:', error)
      alert('Error al cargar la publicación')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like')
      return
    }

    try {
      if (isLiked) {
        await apiClient.delete(`/api/posts/${id}/like`)
        setIsLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        await apiClient.post(`/api/posts/${id}/like`)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error al dar like:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <Head>
        <title>{post.title || 'Publicación'} - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container-mobile px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Publicación</h1>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Post Image */}
      <div className="w-full bg-black">
        <img
          src={post.mediaUrl}
          alt={post.title || 'Post'}
          className="w-full max-h-[70vh] object-contain"
        />
      </div>

      {/* Post Info */}
      <div className="container-mobile px-4 py-4">
        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/user/${post.User?.id}`)}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              {post.User?.avatar ? (
                <img
                  src={post.User.avatar}
                  alt={post.User.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {post.User?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold group-hover:text-blue-500 transition-colors">
                {post.User?.fullName || post.User?.username}
              </p>
              <p className="text-sm text-gray-500">@{post.User?.username}</p>
            </div>
          </button>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors">
            Seguir
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between py-3 border-y border-gray-800">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 group"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'
                }`}
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button className="flex items-center space-x-2 group">
              <MessageCircle className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">{post.commentsCount || 0}</span>
            </button>

            <button className="flex items-center space-x-2 group">
              <Share2 className="w-6 h-6 group-hover:text-green-500 transition-colors" />
            </button>
          </div>

          <button className="group">
            <Bookmark className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>

        {/* Description */}
        {post.description && (
          <div className="py-4">
            <p className="text-gray-300 whitespace-pre-wrap">{post.description}</p>
          </div>
        )}

        {/* Tags */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 py-3">
            {post.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm text-blue-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {post.tags && typeof post.tags === 'string' && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 py-3">
            {post.tags.split(',').map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm text-blue-400"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4">Comentarios</h3>
          
          {/* Comment Input */}
          {isAuthenticated && (
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Agrega un comentario..."
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Comments List - Placeholder */}
          <div className="text-center py-10 text-gray-500">
            No hay comentarios aún
          </div>
        </div>
      </div>
    </div>
  )
}

