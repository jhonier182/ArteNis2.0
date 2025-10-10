import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Image as ImageIcon,
  Camera,
  Video,
  Sparkles,
  Edit3,
  Send,
  Upload,
  Wand2
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { apiClient } from '@/utils/apiClient'
import { useAlert, AlertContainer } from '@/components/Alert'
import { StyleFilter, VisibilityFilter, ClientTagFilter } from '@/components/PostFilters'
import { usePostFilters, FILTER_CONSTRAINTS } from '@/hooks/usePostFilters'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useUser()
  const { alerts, success, error } = useAlert()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [clientTag, setClientTag] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<'select' | 'edit'>('select')

  // Usar el hook de filtros para manejar estilos y visibilidad
  const {
    filters,
    toggleStyle,
    updateFilter
  } = usePostFilters({
    styles: [],
    visibility: 'public',
    type: 'all',
    dateRange: 'all',
    sortBy: 'newest'
  })

  // Drag and drop functions
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setCurrentStep('edit')
    } else {
      error('Tipo de archivo no válido', 'Solo se permiten imágenes o videos')
    }
  }, [error])

  // IA suggestions
  const generateAISuggestions = useCallback(() => {
    const suggestions = [
      'Tatuaje realizado con técnica de realismo',
      'Sesión de 3 horas con cliente satisfecho',
      'Diseño personalizado inspirado en la naturaleza',
      'Trabajo en progreso - próximamente más fotos',
      'Nuevo estilo explorando técnicas mixtas',
      'Colaboración especial con @cliente',
      'Detalles finos con agujas de alta calidad',
      'Proceso de curación - resultado final en 2 semanas'
    ]
    setAiSuggestions(suggestions)
    setShowAISuggestions(true)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      error('Tipo de archivo no válido', 'Solo se permiten imágenes o videos')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setCurrentStep('edit')
  }

  const handleEdit = () => {
    if (!selectedFile) {
      error('Archivo requerido', 'Por favor selecciona una imagen o video')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const imageData = e.target?.result as string
      localStorage.setItem('draft_image', imageData)
      localStorage.setItem('draft_filename', selectedFile.name)
      localStorage.setItem('draft_description', description)
      localStorage.setItem('draft_styles', filters.styles.join(','))
      localStorage.setItem('draft_client', clientTag)
      localStorage.setItem('draft_visibility', filters.visibility)
      router.push('/create/edit')
    }
    reader.readAsDataURL(selectedFile)
  }

  const handlePublish = async () => {
    if (!selectedFile) {
      error('Archivo requerido', 'Por favor selecciona una imagen o video')
      return
    }
    try {
      setIsPublishing(true)
      const formData = new FormData()
      formData.append('image', selectedFile)
      const uploadResponse = await apiClient.post('/api/posts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const { url: imageUrl, publicId: cloudinaryPublicId } = uploadResponse.data.data
      const postData = {
        imageUrl,
        cloudinaryPublicId,
        description,
        type: selectedFile.type.startsWith('video/') ? 'video' : 'image',
        hashtags: filters.styles,
        visibility: filters.visibility,
        clientTag: clientTag || undefined,
        thumbnailUrl: uploadResponse.data.data.thumbnailUrl || undefined
      }
      await apiClient.post('/api/posts', postData)

      // Limpiar draft
      localStorage.removeItem('draft_image')
      localStorage.removeItem('draft_filename')
      localStorage.removeItem('draft_description')
      localStorage.removeItem('draft_styles')
      localStorage.removeItem('draft_client')
      localStorage.removeItem('draft_visibility')

      success('¡Publicación creada!', 'Tu publicación se ha subido exitosamente')
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (e: any) {
      console.error('Error al publicar:', e)
      error('Error al publicar', e.response?.data?.message || 'No se pudo crear la publicación')
    } finally {
      setIsPublishing(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Pantallas de carga/restricción
  if (isLoading) {
    return (
      <div className="min-h-screen h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  if (user?.userType !== 'artist') {
    return (
      <div className="min-h-screen h-screen flex items-center justify-center bg-[#0a0e1a] p-4">
        <div className="text-center w-full max-w-xs space-y-4">
          <h2 className="text-xl font-bold text-white">Acceso Restringido</h2>
          <p className="text-gray-400">Solo los tatuadores pueden crear publicaciones</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 w-full text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Layout adaptable al alto de pantalla y espacio para footer fijo
  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#0a0e1a] text-white">
      <Head>
        <title>Crear Publicación - InkEndin</title>
        {/* Asegura meta viewport adecuada */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
      </Head>

      {/* Header "pegajoso" */}
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-md w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Nueva Publicación</h1>
            {currentStep === 'edit' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  disabled={isPublishing}
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Editor
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs">Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publicar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-md mx-auto pb-[92px]"> {/* padding bottom para navegación */}
        <div className="w-full px-4 py-6 flex-1 flex flex-col justify-start">
          {/* Área de selección de archivo */}
          {currentStep === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 w-full max-w-md mx-auto"
            >
              {/* Drag & Drop Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300 w-full ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-500/10 scale-105'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
                style={{ minHeight: 220 }}
              >
                <motion.div
                  animate={isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="space-y-4"
                >
                  <Upload className={`w-14 h-14 mx-auto ${isDragOver ? 'text-blue-400' : 'text-gray-500'}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {isDragOver ? '¡Suelta aquí!' : 'Arrastra tu archivo aquí'}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      O selecciona desde tu dispositivo
                    </p>
                  </div>
                </motion.div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2 max-w-xs mx-auto w-full mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-semibold">Galería</span>
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-3 bg-gray-800 text-white py-3 rounded-2xl hover:bg-gray-700 transition-all hover:scale-105"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="font-semibold">Cámara</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-3 bg-gray-800 text-white py-3 rounded-2xl hover:bg-gray-700 transition-all hover:scale-105"
                  >
                    <Video className="w-5 h-5" />
                    <span className="font-semibold">Video</span>
                  </button>
                </div>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/30 rounded-2xl p-4 w-full"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2">Tips para mejores publicaciones</h3>
                    <ul className="grid grid-cols-1 gap-1 text-sm text-gray-400 list-[circle] ml-4">
                      <li>Buena iluminación natural</li>
                      <li>Fondo limpio y neutral</li>
                      <li>Enfoque en el tatuaje</li>
                      <li>Múltiples ángulos si es posible</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Área de edición */}
          {currentStep === 'edit' && selectedFile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 w-full max-w-md mx-auto"
            >
              {/* Preview mejorado, cuadrado adaptado */}
              <div className="relative group">
                <div
                  className="relative w-full max-w-xs mx-auto aspect-square rounded-3xl overflow-hidden bg-gray-900 shadow-2xl"
                  style={{ minHeight: 240 }}
                >
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={previewUrl || ''}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  ) : (
                    <img
                      src={previewUrl || ''}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Descripción con IA */}
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <label className="text-sm font-semibold text-gray-300">Descripción</label>
                  <button
                    onClick={generateAISuggestions}
                    className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full text-xs font-medium text-purple-400 hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
                  >
                    <Wand2 className="w-3 h-3" /> IA
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    placeholder="Describe tu trabajo, técnica utilizada, tiempo de sesión..."
                    className="w-full h-28 sm:h-32 bg-[#0f1419] border border-gray-800 rounded-2xl p-3 sm:p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition-all"
                  />
                  <div className="absolute bottom-2 right-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{description.length}/500</span>
                    {description.length > 400 && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                {/* Sugerencias de IA */}
                <AnimatePresence>
                  {showAISuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2"
                    >
                      <p className="text-xs text-gray-400 font-medium">Sugerencias de IA:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {aiSuggestions.slice(0, 4).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setDescription(suggestion)
                              setShowAISuggestions(false)
                            }}
                            className="text-left p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 hover:bg-gray-800 transition-all text-sm w-full"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span className="text-gray-300">{suggestion}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowAISuggestions(false)}
                        className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                      >
                        Cerrar sugerencias
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

               {/* Estilos de tatuaje */}
               <StyleFilter
                 selectedStyles={filters.styles}
                 onStyleToggle={toggleStyle}
               />

               {/* Etiquetar cliente */}
               <ClientTagFilter
                 clientTag={clientTag}
                 onClientTagChange={setClientTag}
               />

               {/* Visibilidad */}
               <VisibilityFilter
                 visibility={filters.visibility}
                 onVisibilityChange={(visibility) => updateFilter('visibility', visibility)}
               />
            </motion.div>
          )}

          {/* Inputs ocultos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </main>

      {/* Bottom Navigation adaptado, fijo abajo */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0e1a] border-t border-gray-800 z-50 safe-bottom bottom-nav-ios">
        <div className="flex items-center justify-around h-20 px-2 max-w-md mx-auto w-full">
          <button
            onClick={() => router.push('/')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs font-medium truncate">Inicio</span>
          </button>
          <button
            onClick={() => router.push('/search')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs font-medium truncate">Buscar</span>
          </button>
          <button className="nav-button flex flex-col items-center justify-center py-2 px-3 text-blue-500 min-w-0 flex-1">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-medium truncate">Publicar</span>
          </button>
          <button
            onClick={() => router.push('/notifications')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-xs font-medium truncate">Notificaciones</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="nav-button flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white transition-colors min-w-0 flex-1"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs font-medium truncate">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Alert Container */}
      <AlertContainer alerts={alerts} />
    </div>
  )
}