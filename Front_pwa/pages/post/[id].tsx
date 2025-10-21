import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import apiClient from '../../services/apiClient'
import { useFollowing } from '../../hooks/useFollowing'
import PostMenu from '../../components/PostMenu'
import { useAlert, AlertContainer } from '../../components/Alert'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function PostDetailPage() {
  console.log('🎬 Componente PostDetailPage iniciando...')
  const router = useRouter()
  const { id } = router.query
  console.log('🔍 Router query:', { id })
  const { user, isAuthenticated } = useUser()
  console.log('👤 Usuario y autenticación:', { user, isAuthenticated })
  const { isFollowing: isFollowingUser, refreshFollowing } = useFollowing()
  const { alerts, success, error, removeAlert } = useAlert()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose:', { id, isAuthenticated })
    if (id) {
      loadPost()
    }
  }, [id, isAuthenticated])

  // Monitorear cambios en la autenticación
  useEffect(() => {
    console.log('🔄 Cambio en autenticación:', {
      isAuthenticated,
      user: user?.id,
      isLoading
    })
  }, [isAuthenticated, user, isLoading])

  useEffect(() => {
    console.log('🔍 useEffect de seguimiento ejecutándose:', {
      hasPost: !!post,
      hasAuthor: !!post?.author?.id,
      isAuthenticated,
      authorId: post?.author?.id,
      currentUserId: user?.id
    })
    
    if (post?.author?.id && isAuthenticated && user?.id) {
      const followingStatus = isFollowingUser(post.author.id)
      console.log('🔍 Verificando estado de seguimiento:', {
        authorId: post.author.id,
        currentUserId: user.id,
        isFollowing: followingStatus,
        isOwnPost: user.id === post.author.id
      })
      setIsFollowing(followingStatus)
    } else {
      console.log('⚠️ No se puede verificar seguimiento:', {
        reason: !post?.author?.id ? 'No hay autor' : 
                !isAuthenticated ? 'No autenticado' : 
                !user?.id ? 'No hay usuario' : 'Desconocido'
      })
      setIsFollowing(false)
    }
  }, [post?.author?.id, isAuthenticated, user?.id, isFollowingUser])

  useEffect(() => {
    if (post?.id && isAuthenticated) {
      checkIfSaved()
    }
  }, [post?.id, isAuthenticated])


  const loadPost = async () => {
    console.log('🚀 Iniciando carga del post...')
    try {
      setIsLoading(true)
      
      // Cargar el post principal
      const postResponse = await apiClient.get(`/api/posts/${id}`)
      
      console.log('📡 Respuesta completa de la API:', postResponse.data)
      
      if (postResponse.data.success) {
        const postData = postResponse.data.data.post
        setPost(postData)
        
        // Usar los datos del post principal para el estado de like
        setIsLiked(postData.isLiked || false)
        setLikesCount(postData.likesCount || 0)
        
        console.log('✅ Post cargado - Estado de like:', { 
          isLiked: postData.isLiked, 
          likesCount: postData.likesCount,
          willBeRed: postData.isLiked ? 'SÍ' : 'NO'
        })
        
        console.log('👤 Información del autor:', {
          hasAuthor: !!postData.author,
          authorId: postData.author?.id,
          authorUsername: postData.author?.username,
          currentUserId: user?.id,
          isOwnPost: user?.id?.toString() === postData.author?.id?.toString()
        })
        
        console.log('📊 Datos completos del post:', {
          id: postData.id,
          author: postData.author,
          likesCount: postData.likesCount,
          isLiked: postData.isLiked
        })
      } else {
        throw new Error('No se pudo cargar la publicación')
      }
      
    } catch (err) {
      console.error('Error al cargar post:', err)
      error('Error al cargar', 'No se pudo cargar la publicación')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const checkIfSaved = async () => {
    try {
      const response = await apiClient.get('/api/boards/me/boards')
      const boards = response.data?.data?.boards || []
      const isPostSaved = boards.some((board: any) => 
        board.Posts?.some((savedPost: any) => savedPost.id === post.id)
      )
      setIsSaved(isPostSaved)
    } catch (error) {
      console.error('Error al verificar guardado:', error)
    }
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      error('Acceso denegado', 'Debes iniciar sesión para seguir usuarios')
      router.push('/login')
      return
    }

    try {
      setIsFollowLoading(true)
      
      console.log('🔄 Cambiando estado de seguimiento:', {
        authorId: post.author.id,
        currentState: isFollowing,
        action: isFollowing ? 'UNFOLLOW' : 'FOLLOW'
      })
      
      if (isFollowing) {
        await apiClient.delete(`/api/follow/${post.author.id}`)
        setIsFollowing(false)
        console.log('✅ Dejaste de seguir al usuario')
      } else {
        await apiClient.post('/api/follow', { userId: post.author.id })
        setIsFollowing(true)
        console.log('✅ Empezaste a seguir al usuario')
      }
      
      // Refrescar la lista de usuarios seguidos usando el hook
      await refreshFollowing()
      
    } catch (err: any) {
      console.error('Error al cambiar seguimiento:', err)
      error('Error al seguir', err.response?.data?.message || 'No se pudo actualizar el seguimiento')
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      error('Acceso denegado', 'Debes iniciar sesión para guardar publicaciones')
      router.push('/login')
      return
    }

    try {
      setIsSaving(true)
      
      if (isSaved) {
        // Remover de guardados
        const response = await apiClient.get('/api/boards/me/boards')
        const boards = response.data?.data?.boards || []
        
        for (const board of boards) {
          const hasPost = board.Posts?.some((savedPost: any) => savedPost.id === post.id)
          if (hasPost) {
            await apiClient.delete(`/api/boards/${board.id}/posts/${post.id}`)
            break
          }
        }
        
        setIsSaved(false)
      } else {
        // Agregar a guardados
        let defaultBoard = null
        
        // Buscar un board por defecto o crear uno
        const response = await apiClient.get('/api/boards/me/boards')
        const boards = response.data?.data?.boards || []
        
        if (boards.length === 0) {
          // Crear board por defecto
          const createResponse = await apiClient.post('/api/boards', {
            name: 'Mis Favoritos',
            description: 'Publicaciones que me gustan'
          })
          defaultBoard = createResponse.data?.data?.board
        } else {
          // Usar el primer board disponible
          defaultBoard = boards[0]
        }
        
        if (defaultBoard) {
          await apiClient.post(`/api/boards/${defaultBoard.id}/posts`, { postId: post.id })
          setIsSaved(true)
        }
      }
    } catch (err: any) {
      console.error('Error al guardar post:', err)
      error('Error al guardar', err.response?.data?.message || 'No se pudo guardar la publicación')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      error('Acceso denegado', 'Debes iniciar sesión para dar like')
      return
    }

    try {
      console.log('🔄 Estado actual antes del like:', { isLiked, likesCount })
      
      // Actualización optimista - cambiar estado inmediatamente
      const newIsLiked = !isLiked
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1
      
      console.log('🎯 Cambio optimista:', { 
        from: { isLiked, likesCount }, 
        to: { newIsLiked, newLikesCount } 
      })
      
      setIsLiked(newIsLiked)
      setLikesCount(newLikesCount)

      // Hacer la petición al backend
      const response = await apiClient.post(`/api/posts/${id}/like`)
      console.log('📡 Respuesta del servidor:', response.data)
      
      // Confirmar con la respuesta del servidor
      if (response.data.success) {
        const { liked: serverLiked, likesCount: serverLikesCount } = response.data.data
        console.log('✅ Confirmado por servidor:', { liked: serverLiked, likesCount: serverLikesCount })
        setIsLiked(serverLiked)
        setLikesCount(serverLikesCount)
      }
    } catch (err) {
      console.error('Error al dar like:', err)
      
      // Revertir cambios en caso de error
      setIsLiked(!isLiked)
      setLikesCount(prev => prev + (isLiked ? 1 : -1))
      
      error('Error', 'No se pudo actualizar el like')
    }
  }

  const handleDelete = async () => {
    if (!isAuthenticated) {
      error('Acceso denegado', 'Debes iniciar sesión para eliminar publicaciones')
      return
    }

    // Verificar que el usuario sea el dueño de la publicación
    if (user?.id?.toString() !== post?.author?.id?.toString()) {
      error('Sin permisos', 'No tienes permisos para eliminar esta publicación')
      return
    }

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.')
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await apiClient.delete(`/api/posts/${id}`)
      success('Publicación eliminada', 'La publicación se ha eliminado exitosamente')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      console.error('Error al eliminar post:', err)
      error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar la publicación')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    error('Función en desarrollo', 'La edición de publicaciones estará disponible próximamente')
  }

  const handleShare = () => {
    error('Función en desarrollo', 'La función de compartir estará disponible próximamente')
  }

  const isOwner = user?.id?.toString() === post?.author?.id?.toString()

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
            <PostMenu
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={handleShare}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </header>

      {/* Post Media */}
      <div className="w-full bg-black">
        {post.type === 'video' ? (
          <video
            src={post.mediaUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full max-h-[70vh] object-contain"
            poster={post.thumbnailUrl}
          />
        ) : (
          <Image
            src={post.mediaUrl}
            alt={post.title || 'Post'}
            width={800}
            height={600}
            className="w-full max-h-[70vh] object-contain"
          />
        )}
      </div>

      {/* Post Info */}
      <div className="container-mobile px-4 py-4">
        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          {post.author ? (
            <button
              onClick={() => router.push(`/user/${post.author.id}`)}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {post.author.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold group-hover:text-blue-500 transition-colors">
                  {post.author.fullName || post.author.username || 'Usuario'}
                </p>
                <p className="text-sm text-gray-500">@{post.author.username || 'usuario'}</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-400">?</span>
              </div>
              <div>
                <p className="font-semibold text-gray-400">Usuario desconocido</p>
                <p className="text-sm text-gray-500">@desconocido</p>
              </div>
            </div>
          )}

          {post.author && user?.id?.toString() !== post.author.id?.toString() && (
            <button 
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                isFollowing
                  ? 'bg-gray-800/80 text-white hover:bg-gray-700 border border-gray-700'
                  : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isFollowLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : isFollowing ? (
                '✓ Siguiendo'
              ) : (
                '+ Seguir'
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between py-3 border-y border-gray-800">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 group"
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 group-hover:text-red-500'
                }`}
                style={{
                  fill: isLiked ? '#ef4444' : 'none',
                  color: isLiked ? '#ef4444' : 'currentColor'
                }}
              />
              <span className="text-sm font-medium">{likesCount}</span>
              {/* Debug temporal */}
              <span className="text-xs text-gray-500 ml-1">
                ({isLiked ? 'L' : 'N'})
              </span>
            </button>

            <button className="flex items-center space-x-2 group">
              <MessageCircle className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">{post.commentsCount || 0}</span>
            </button>

            <button className="flex items-center space-x-2 group">
              <Share2 className="w-6 h-6 group-hover:text-green-500 transition-colors" />
            </button>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`group transition-colors ${
              isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
            }`}
          >
            {isSaving ? (
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <Bookmark className={`w-6 h-6 transition-colors ${
                isSaved ? 'fill-blue-500 text-blue-500' : 'group-hover:text-blue-500'
              }`} />
            )}
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
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={32}
                    height={32}
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

      {/* Alert Container */}
      <AlertContainer alerts={alerts} />
    </div>
  )
}
