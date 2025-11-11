'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { postService, Post } from '@/features/posts/services/postService'
import { ImageEditor } from '@/features/posts/components/ImageEditor'
import { logger } from '@/utils/logger'
import { POST_CREATION_PROCESSING_DELAY_MS, POST_CREATION_NAVIGATION_DELAY_MS, ERROR_NO_FILE_SELECTED, ERROR_INVALID_FILE_TYPE } from '@/utils/constants'
import { validatePostFile } from '@/utils/fileValidators'
import { FullScreenSpinner } from '@/components/ui/Spinner'

export default function CreatePostPage() {
  const router = useRouter()
  const { postId } = router.query
  const { user, isAuthenticated, isLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determinar si estamos editando o creando
  const isEditMode = !!postId && typeof postId === 'string'
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedImageBlob, setEditedImageBlob] = useState<Blob | null>(null)
  const [existingPost, setExistingPost] = useState<Post | null>(null)
  const [isLoadingPost, setIsLoadingPost] = useState(false)

  // Verificar si es artista
  const isArtist = user?.userType === 'artist' || 
                   (typeof user?.userType === 'string' && user?.userType.toLowerCase() === 'artist')

  // Redirigir si no está autenticado o no es artista
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && isAuthenticated && !isArtist) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isArtist, router])

  // Cargar post existente si estamos en modo edición
  useEffect(() => {
    if (isEditMode && postId && typeof postId === 'string' && isAuthenticated && !isLoading) {
      const loadPost = async () => {
        try {
          setIsLoadingPost(true)
          const post = await postService.getPostById(postId)
          
          // Verificar que el usuario sea el dueño del post
          if (post.authorId !== user?.id) {
            setError('No tienes permisos para editar esta publicación')
            setTimeout(() => router.push('/profile'), 2000)
            return
          }
          
          setExistingPost(post)
          setDescription(post.description || '')
          setHashtags(post.hashtags || post.tags || [])
          setPreviewUrl(post.imageUrl || post.mediaUrl || null)
        } catch (err) {
          logger.error('Error al cargar post para editar', err)
          setError('No se pudo cargar la publicación')
          setTimeout(() => router.push('/profile'), 2000)
        } finally {
          setIsLoadingPost(false)
        }
      }
      
      loadPost()
    }
  }, [isEditMode, postId, isAuthenticated, isLoading, user?.id, router])

  // Abrir la galería automáticamente al entrar si no hay archivo seleccionado (solo en modo crear)
  useEffect(() => {
    if (!isEditMode && isAuthenticated && !isLoading && isArtist && !selectedFile && fileInputRef.current) {
      // Abrir inmediatamente sin delay para mejor UX
      const timer = setTimeout(() => {
        fileInputRef.current?.click()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, isAuthenticated, isLoading, isArtist, selectedFile])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar archivo usando el validador centralizado
    const validation = validatePostFile(file)
    if (!validation.valid) {
      setError(validation.error || ERROR_INVALID_FILE_TYPE)
      return
    }

    setError(null)
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    
    // Si es video, no permitir edición - solo permitir imágenes para editar
    if (validation.isVideo) {
      setEditedImageBlob(null)
    }
  }


  const handleEditorSave = async (editedBlob: Blob, desc: string, tags: string[]) => {
    // Actualizar estados
    setDescription(desc)
    setHashtags(tags)
    
    // En modo edición, no procesamos el blob (no se puede cambiar la imagen)
    if (!isEditMode && editedBlob.size > 0) {
      // Si hay blob, crear archivo editado (solo en modo crear)
      const editedFile = new File([editedBlob], selectedFile?.name || 'edited-image.jpg', { 
        type: 'image/jpeg' 
      })
      setEditedImageBlob(editedBlob)
      setSelectedFile(editedFile)
      
      // Actualizar preview
      const newPreviewUrl = URL.createObjectURL(editedBlob)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(newPreviewUrl)
    }
    
    // Publicar o actualizar según el modo
    if (isEditMode) {
      await handleUpdate()
    } else {
      await handlePublish()
    }
  }

  // Función auxiliar: Preparar archivo para subir
  const prepareFileForUpload = (): File => {
    if (editedImageBlob) {
      return new File([editedImageBlob], selectedFile!.name, { type: 'image/jpeg' })
    }
    return selectedFile!
  }

  // Función auxiliar: Construir datos del post
  const buildPostData = (uploadResult: { url: string; publicId: string; type: 'image' | 'video'; thumbnailUrl?: string }) => {
    return {
      description: description.trim() || undefined,
      imageUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      type: uploadResult.type,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      thumbnailUrl: uploadResult.thumbnailUrl,
      visibility: 'public' as const,
    }
  }

  // Función auxiliar: Notificar creación exitosa
  const notifyPostCreated = () => {
    window.dispatchEvent(new CustomEvent('newPostCreated'))
    if (typeof window !== 'undefined') {
      localStorage.setItem('newPostCreated', Date.now().toString())
    }
  }

  // Función auxiliar: Limpiar recursos
  const cleanupResources = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setEditedImageBlob(null)
  }

  // Función auxiliar: Navegar al perfil
  const navigateToProfile = () => {
    setTimeout(() => {
      router.push('/profile')
    }, 500)
  }

  // Función principal: Publicar post (modo crear)
  const handlePublish = async () => {
    // Validación
    if (!selectedFile) {
      setError(ERROR_NO_FILE_SELECTED)
      return
    }

    try {
      setIsPublishing(true)
      setError(null)

      // 1. Preparar archivo
      const fileToUpload = prepareFileForUpload()

      // 2. Subir media
      const uploadResult = await postService.uploadPostMedia(fileToUpload)

      // 3. Crear post
      const postData = buildPostData(uploadResult)
      await postService.createPost(postData)

      // 4. Notificar éxito con un pequeño delay para asegurar que el backend procese el post
      await new Promise(resolve => setTimeout(resolve, POST_CREATION_PROCESSING_DELAY_MS))
      notifyPostCreated()

      // 5. Limpiar recursos
      cleanupResources()

      // 6. Navegar con un delay adicional
      setTimeout(() => {
        navigateToProfile()
      }, POST_CREATION_NAVIGATION_DELAY_MS)

    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string } } }
      logger.error('Error al publicar', err)
      setError(error.response?.data?.message || error.message || 'No se pudo crear la publicación')
    } finally {
      setIsPublishing(false)
    }
  }

  // Función principal: Actualizar post (modo editar)
  const handleUpdate = async () => {
    if (!isEditMode || !postId || typeof postId !== 'string') {
      setError('Error: No se puede actualizar sin ID de post')
      return
    }

    try {
      setIsPublishing(true)
      setError(null)

      // Actualizar solo descripción y hashtags (el backend no permite cambiar la imagen)
      await postService.updatePost(postId, {
        description: description.trim() || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined
      })

      // Notificar éxito
      await new Promise(resolve => setTimeout(resolve, POST_CREATION_PROCESSING_DELAY_MS))
      notifyPostCreated()

      // Navegar al perfil
      setTimeout(() => {
        navigateToProfile()
      }, POST_CREATION_NAVIGATION_DELAY_MS)

    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string } } }
      logger.error('Error al actualizar post', err)
      setError(error.response?.data?.message || error.message || 'No se pudo actualizar la publicación')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleClose = () => {
    // Limpiar selección
    setSelectedFile(null)
    setDescription('')
    setHashtags([])
    setError(null)
    setEditedImageBlob(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    // Los usuarios pueden usar gestos de deslizamiento para cancelar
    // Si no hay historial, redirigir al perfil
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/profile')
    }
  }


  if (isLoading || isLoadingPost) {
    return <FullScreenSpinner />
  }

  if (!isAuthenticated || !isArtist) {
    return null
  }

  // Si estamos en modo edición y no se pudo cargar el post, mostrar error
  if (isEditMode && !existingPost && !isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar publicación</h2>
          <p className="text-gray-400 mb-4">{error || 'No se pudo cargar la publicación para editar'}</p>
        </div>
      </div>
    )
  }

  // Siempre mostrar el editor directamente
  return (
    <>
      <Head>
        <title>{isEditMode ? 'Editar Publicación' : 'Crear Publicación'} - InkEndin</title>
      </Head>

      {/* Input oculto para seleccionar archivo - Se abre automáticamente */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        style={{ display: 'none' }}
        multiple={false}
      />

      <ImageEditor
        imageUrl={previewUrl || undefined}
        onSave={handleEditorSave}
        onClose={handleClose}
        onSelectFile={isEditMode ? undefined : () => fileInputRef.current?.click()}
        isPublishing={isPublishing}
        initialDescription={description}
        initialHashtags={hashtags}
        isEditMode={isEditMode}
      />

      {/* Mensaje de error si existe */}
      {error && (
        <div className="fixed bottom-24 left-0 right-0 z-[200] px-4">
          <div className="container-mobile max-w-md mx-auto">
            <div className="bg-red-900/90 border border-red-600/50 rounded-lg p-3 shadow-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

