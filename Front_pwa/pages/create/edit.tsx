import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  X, 
  Check,
  RotateCw,
  Crop,
  Sliders,
  Sparkles
} from 'lucide-react'
import { apiClient } from '@/utils/apiClient'

type FilterType = 'none' | 'vivid' | 'bright' | 'dark' | 'vintage' | 'cool' | 'warm'

export default function EditImagePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [draftData, setDraftData] = useState({
    description: '',
    styles: '',
    clientTag: '',
    visibility: 'public'
  })
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)
  const [saturation, setSaturation] = useState(50)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none')
  const [rotation, setRotation] = useState(0)
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters'>('adjust')
  const [isPublishing, setIsPublishing] = useState(false)

  // Cargar imagen y datos del draft
  useEffect(() => {
    const draftImage = localStorage.getItem('draft_image')
    const description = localStorage.getItem('draft_description') || ''
    const styles = localStorage.getItem('draft_styles') || ''
    const clientTag = localStorage.getItem('draft_client') || ''
    const visibility = localStorage.getItem('draft_visibility') || 'public'

    if (!draftImage) {
      router.push('/create')
      return
    }

    setImageUrl(draftImage)
    setDraftData({ description, styles, clientTag, visibility })
  }, [])

  const filters: { name: FilterType; label: string; preview: string }[] = [
    { name: 'none', label: 'Original', preview: 'brightness(100%)' },
    { name: 'vivid', label: 'Vivid', preview: 'saturate(150%) contrast(110%)' },
    { name: 'bright', label: 'Bright', preview: 'brightness(120%) contrast(90%)' },
    { name: 'dark', label: 'Dark', preview: 'brightness(80%) contrast(120%)' },
    { name: 'vintage', label: 'Vintage', preview: 'sepia(40%) contrast(90%)' },
    { name: 'cool', label: 'Cool', preview: 'hue-rotate(20deg) saturate(120%)' },
    { name: 'warm', label: 'Warm', preview: 'sepia(20%) saturate(130%)' },
  ]

  const getFilterStyle = () => {
    const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    const filterEffect = filters.find(f => f.name === selectedFilter)?.preview || ''
    return `${adjustments} ${filterEffect}`
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handlePublish = async () => {
    if (!imageUrl) {
      alert('No hay imagen para publicar')
      return
    }

    try {
      setIsPublishing(true)

      // Paso 1: Convertir base64 a File
      const filename = localStorage.getItem('draft_filename') || 'image.jpg'
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], filename, { type: blob.type })

      // Paso 2: Subir imagen a Cloudinary
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      const uploadResult = await apiClient.post('/api/posts/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { url: uploadedImageUrl, publicId: cloudinaryPublicId } = uploadResult.data.data

      // Paso 3: Crear el post con la URL de Cloudinary
      const postData: any = {
        imageUrl: uploadedImageUrl,
        cloudinaryPublicId,
        description: draftData.description,
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }

      if (draftData.styles) {
        postData.hashtags = draftData.styles.split(',').map(s => s.trim()).filter(Boolean).join(',')
      }

      await apiClient.post('/api/posts', postData)

      // Limpiar localStorage
      localStorage.removeItem('draft_image')
      localStorage.removeItem('draft_filename')
      localStorage.removeItem('draft_description')
      localStorage.removeItem('draft_styles')
      localStorage.removeItem('draft_client')
      localStorage.removeItem('draft_visibility')

      alert('¡Publicación creada exitosamente!')
      router.push('/')
    } catch (error: any) {
      console.error('Error al publicar:', error)
      alert(error.response?.data?.message || 'Error al crear la publicación')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Head>
        <title>Editar Imagen - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0e1a] border-b border-gray-800">
        <div className="container-mobile px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Edición y Filtros de Imagen</h1>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="text-blue-500 font-semibold flex items-center gap-1 disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Publicar
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black/30">
        {imageUrl ? (
          <div 
            className="relative max-w-full max-h-[60vh] overflow-hidden rounded-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                filter: getFilterStyle(),
                transition: 'filter 0.2s ease',
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain'
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando imagen...</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-[#0a0e1a] border-t border-gray-800">
        <div className="container-mobile flex">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'adjust' ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <Sliders className="w-5 h-5 mx-auto mb-1" />
            Ajustes
            {activeTab === 'adjust' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'filters' ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <Sparkles className="w-5 h-5 mx-auto mb-1" />
            Filtros
            {activeTab === 'filters' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        </div>
      </div>

      {/* Controls Area */}
      <div className="bg-[#0a0e1a] border-t border-gray-800 pb-safe">
        <div className="container-mobile p-4">
          {activeTab === 'adjust' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Brillo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Brillo</label>
                  <span className="text-sm text-gray-500">{brightness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                />
              </div>

              {/* Contraste */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Contraste</label>
                  <span className="text-sm text-gray-500">{contrast}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                />
              </div>

              {/* Saturación */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Saturación</label>
                  <span className="text-sm text-gray-500">{saturation}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                />
              </div>

              {/* Herramientas adicionales */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRotate}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-5 h-5" />
                  Rotar
                </button>
                <button className="flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                  <Crop className="w-5 h-5" />
                  Recortar
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setBrightness(50)
                  setContrast(50)
                  setSaturation(50)
                  setRotation(0)
                }}
                className="w-full text-gray-400 text-sm py-2 hover:text-white transition-colors"
              >
                Restablecer ajustes
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Filters Grid */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
                {filters.map((filter) => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.name)}
                    className="flex-shrink-0 w-20"
                  >
                    <div
                      className={`relative aspect-square rounded-xl overflow-hidden mb-2 border-2 transition-all ${
                        selectedFilter === filter.name
                          ? 'border-blue-500 scale-95'
                          : 'border-transparent'
                      }`}
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={filter.label}
                          className="w-full h-full object-cover"
                          style={{ filter: filter.preview }}
                        />
                      )}
                      {selectedFilter === filter.name && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs text-center transition-colors ${
                      selectedFilter === filter.name ? 'text-blue-500 font-medium' : 'text-gray-400'
                    }`}>
                      {filter.label}
                    </p>
                  </button>
                ))}
              </div>

              {/* Filter info */}
              <div className="bg-gray-800/50 rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-400 text-center">
                  Desliza para ver más filtros y toca para aplicar
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }

        .slider-blue::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  )
}
