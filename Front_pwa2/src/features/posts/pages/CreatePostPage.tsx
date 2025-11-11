'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { postService } from '@/features/posts/services/postService'
import { ImageEditor } from '@/features/posts/components/ImageEditor'
import { logger } from '@/utils/logger'
import { POST_CREATION_PROCESSING_DELAY_MS, POST_CREATION_NAVIGATION_DELAY_MS, ERROR_NO_FILE_SELECTED, ERROR_INVALID_FILE_TYPE } from '@/utils/constants'
import { validatePostFile } from '@/utils/fileValidators'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedImageBlob, setEditedImageBlob] = useState<Blob | null>(null)

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

  // Abrir la galería automáticamente al entrar si no hay archivo seleccionado
  useEffect(() => {
    if (isAuthenticated && !isLoading && isArtist && !selectedFile && fileInputRef.current) {
      const timer = setTimeout(() => {
        fileInputRef.current?.click()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, isArtist, selectedFile])

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
    
    if (editedBlob.size > 0) {
      // Si hay blob, crear archivo editado
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
    
    // Publicar directamente
    await handlePublish()
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

  // Función principal: Publicar post
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


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isArtist) {
    return null
  }

  // Siempre mostrar el editor directamente
  return (
    <>
      <Head>
        <title>Crear Publicación - InkEndin</title>
      </Head>

      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        style={{ display: 'none' }}
      />

      <ImageEditor
        imageUrl={previewUrl || undefined}
        onSave={handleEditorSave}
        onClose={handleClose}
        onSelectFile={() => fileInputRef.current?.click()}
        isPublishing={isPublishing}
        initialDescription={description}
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

