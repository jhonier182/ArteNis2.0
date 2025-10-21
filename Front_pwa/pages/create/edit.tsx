import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  X, 
  Check,
  RotateCw,
  Crop,
  Sliders,
  Sparkles,
  Sun,
  Contrast,
  Droplets,
  Zap,
  Lightbulb,
  Moon,
  Flame,
  Palette,
  Focus,
  Circle
} from 'lucide-react'
import apiClient from '../../services/apiClient'
import { useAlert, AlertContainer } from '../../components/Alert'

type FilterType = 'none' | 'vivid' | 'bright' | 'dark' | 'vintage' | 'cool' | 'warm'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function EditImagePage() {
  const router = useRouter()
  const { alerts, success, error, removeAlert } = useAlert()
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
  const [exposure, setExposure] = useState(50)
  const [highlights, setHighlights] = useState(50)
  const [shadows, setShadows] = useState(50)
  const [warmth, setWarmth] = useState(50)
  const [tint, setTint] = useState(50)
  const [sharpness, setSharpness] = useState(50)
  const [vignette, setVignette] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none')
  const [rotation, setRotation] = useState(0)
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters'>('adjust')
  const [isPublishing, setIsPublishing] = useState(false)
  const [useManualAdjustments, setUseManualAdjustments] = useState(false)

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
    if (useManualAdjustments) {
      // Solo ajustes manuales con todos los efectos
      const hueRotate = (warmth - 50) * 0.6 // -30 a +30 grados
      const hueRotateTint = (tint - 50) * 1.2 // Para ajuste de tono
      
      // Combinar todos los filtros CSS
      const filters = []
      
      // Exposición (simular con brightness inicial)
      if (exposure !== 50) {
        filters.push(`brightness(${exposure}%)`)
      }
      
      // Brillo
      filters.push(`brightness(${brightness}%)`)
      
      // Contraste  
      filters.push(`contrast(${contrast}%)`)
      
      // Saturación
      filters.push(`saturate(${saturation}%)`)
      
      // Warmth y Tint combinados en hue-rotate
      if (warmth !== 50 || tint !== 50) {
        filters.push(`hue-rotate(${hueRotate + hueRotateTint}deg)`)
      }
      
      // Nitidez (aproximación con blur inverso)
      if (sharpness > 50) {
        // No hay forma perfecta de hacer sharpness con CSS, se aplicará en canvas
      } else if (sharpness < 50) {
        const blurAmount = (50 - sharpness) / 25 // 0-2px
        filters.push(`blur(${blurAmount}px)`)
      }
      
      return filters.join(' ')
    } else {
      // Solo filtros preestablecidos
      const filterEffect = filters.find(f => f.name === selectedFilter)?.preview || ''
      return filterEffect
    }
  }

  const handleManualAdjustmentChange = (
    type: 'brightness' | 'contrast' | 'saturation' | 'exposure' | 'highlights' | 'shadows' | 'warmth' | 'tint' | 'sharpness' | 'vignette', 
    value: number
  ) => {
    setUseManualAdjustments(true)
    setSelectedFilter('none')
    
    if (type === 'brightness') setBrightness(value)
    else if (type === 'contrast') setContrast(value)
    else if (type === 'saturation') setSaturation(value)
    else if (type === 'exposure') setExposure(value)
    else if (type === 'highlights') setHighlights(value)
    else if (type === 'shadows') setShadows(value)
    else if (type === 'warmth') setWarmth(value)
    else if (type === 'tint') setTint(value)
    else if (type === 'sharpness') setSharpness(value)
    else if (type === 'vignette') setVignette(value)
  }

  const handleFilterSelect = (filter: FilterType) => {
    setSelectedFilter(filter)
    if (filter !== 'none') {
      setUseManualAdjustments(false)
      // Reset todos los ajustes manuales
      setBrightness(50)
      setContrast(50)
      setSaturation(50)
      setExposure(50)
      setHighlights(50)
      setShadows(50)
      setWarmth(50)
      setTint(50)
      setSharpness(50)
      setVignette(0)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const applyFiltersToCanvas = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      if (!imageUrl) {
        reject(new Error('No image'))
        return
      }

      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('No context'))
          return
        }

        // Configurar el tamaño del canvas según la rotación
        if (rotation === 90 || rotation === 270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Aplicar rotación si es necesario
        if (rotation !== 0) {
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.drawImage(img, -img.width / 2, -img.height / 2)
          ctx.restore()
        } else {
          ctx.drawImage(img, 0, 0)
        }

        // Aplicar ajustes de brillo, contraste y saturación
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Solo aplicar ajustes si se están usando
        if (useManualAdjustments) {
          // Ajustes manuales - factores exactos para coincidir con CSS
          // Aplicamos en el orden correcto: exposición -> brillo -> contraste -> saturación
          
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i]
            let g = data[i + 1]
            let b = data[i + 2]

            // 1. Exposición y Brillo (aplicados por separado, no multiplicados entre sí)
            const exposureFactor = exposure / 100 // 0 a 2
            const brightnessFactor = brightness / 100 // 0 a 2
            
            r = r * exposureFactor * brightnessFactor
            g = g * exposureFactor * brightnessFactor
            b = b * exposureFactor * brightnessFactor

            // 2. Highlights y Shadows (antes del contraste para más precisión)
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
            
            // Highlights - solo zonas brillantes (luminancia > 128)
            if (highlights !== 50 && luminance > 128) {
              const highlightIntensity = (highlights - 50) / 200 // -0.25 a +0.25
              const highlightWeight = (luminance - 128) / 127 // 0 a 1
              const adjustment = highlightIntensity * highlightWeight * 50 // Ajuste suave
              r += adjustment
              g += adjustment
              b += adjustment
            }

            // Shadows - solo zonas oscuras (luminancia < 128)
            if (shadows !== 50 && luminance < 128) {
              const shadowIntensity = (shadows - 50) / 200 // -0.25 a +0.25
              const shadowWeight = (128 - luminance) / 128 // 0 a 1
              const adjustment = shadowIntensity * shadowWeight * 50 // Ajuste suave
              r += adjustment
              g += adjustment
              b += adjustment
            }

            // 3. Contraste (igual que CSS)
            const contrastFactor = contrast / 100
            r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255
            g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255
            b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255

            // 4. Saturación (igual que CSS)
            const saturationFactor = saturation / 100
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
            r = gray + (r - gray) * saturationFactor
            g = gray + (g - gray) * saturationFactor
            b = gray + (b - gray) * saturationFactor

            // 5. Warmth (temperatura de color) - muy sutil
            if (warmth !== 50) {
              const warmthAdjust = (warmth - 50) / 50 // -1 a +1
              r += warmthAdjust * 8 // Muy reducido
              b -= warmthAdjust * 8
            }

            // 6. Tint (tono verde/magenta) - muy sutil
            if (tint !== 50) {
              const tintAdjust = (tint - 50) / 50 // -1 a +1
              g += tintAdjust * 5 // Muy reducido
            }

            // Clamp valores entre 0-255
            data[i] = Math.min(255, Math.max(0, r))
            data[i + 1] = Math.min(255, Math.max(0, g))
            data[i + 2] = Math.min(255, Math.max(0, b))
          }

          // Aplicar viñeta (efecto de oscurecimiento en los bordes)
          if (vignette > 0) {
            const vignetteIntensity = vignette / 100
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)

            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX
                const dy = y - centerY
                const dist = Math.sqrt(dx * dx + dy * dy)
                const vignetteFactor = 1 - (dist / maxDist) * vignetteIntensity
                
                const i = (y * canvas.width + x) * 4
                data[i] *= vignetteFactor
                data[i + 1] *= vignetteFactor
                data[i + 2] *= vignetteFactor
              }
            }
          }
        } else if (selectedFilter !== 'none') {
          // Filtros preestablecidos
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i]
            let g = data[i + 1]
            let b = data[i + 2]

            if (selectedFilter === 'vivid') {
              r = r * 1.2
              g = g * 1.2
              b = b * 1.2
            } else if (selectedFilter === 'bright') {
              r = r * 1.3
              g = g * 1.3
              b = b * 1.3
            } else if (selectedFilter === 'dark') {
              r = r * 0.7
              g = g * 0.7
              b = b * 0.7
            } else if (selectedFilter === 'vintage') {
              const sepiaR = r * 0.393 + g * 0.769 + b * 0.189
              const sepiaG = r * 0.349 + g * 0.686 + b * 0.168
              const sepiaB = r * 0.272 + g * 0.534 + b * 0.131
              r = sepiaR * 0.6 + r * 0.4
              g = sepiaG * 0.6 + g * 0.4
              b = sepiaB * 0.6 + b * 0.4
            } else if (selectedFilter === 'cool') {
              b = b * 1.2
              r = r * 0.9
            } else if (selectedFilter === 'warm') {
              r = r * 1.2
              b = b * 0.9
            }

            // Clamp valores entre 0-255
            data[i] = Math.min(255, Math.max(0, r))
            data[i + 1] = Math.min(255, Math.max(0, g))
            data[i + 2] = Math.min(255, Math.max(0, b))
          }
        }

        ctx.putImageData(imageData, 0, 0)

        // Convertir canvas a blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/jpeg', 0.95)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageUrl
    })
  }

  const handlePublish = async () => {
    if (!imageUrl) {
      error('Error de validación', 'No hay imagen para publicar')
      return
    }

    try {
      setIsPublishing(true)

      // Paso 1: Aplicar filtros y convertir a File
      const blob = await applyFiltersToCanvas()
      const filename = localStorage.getItem('draft_filename') || 'edited-image.jpg'
      const file = new File([blob], filename, { type: 'image/jpeg' })

      // Paso 2: Subir imagen editada a Cloudinary
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
        type: 'image',
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

      success('¡Publicación creada!', 'Tu imagen ha sido publicada exitosamente')
      
      // Disparar evento para refrescar el perfil
      window.dispatchEvent(new CustomEvent('newPostCreated'))
      localStorage.setItem('newPostCreated', Date.now().toString())
      
      router.push('/profile')
    } catch (error: any) {
      console.error('Error al publicar:', error)
      error('Error al publicar', error.response?.data?.message || 'No se pudo crear la publicación')
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
            <Image
              src={imageUrl}
              alt="Preview"
              width={800}
              height={600}
              style={{
                filter: getFilterStyle(),
                transition: 'filter 0.2s ease',
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain'
              }}
            />
            {/* Viñeta overlay */}
            {vignette > 0 && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${vignette / 100}) 100%)`,
                  transition: 'background 0.2s ease'
                }}
              />
            )}
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
              className="space-y-4"
            >
              {/* Scroll horizontal de ajustes con iconos */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 pb-2" style={{ width: 'max-content' }}>
                  {/* Brillo */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Sun className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Brillo</p>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => handleManualAdjustmentChange('brightness', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{brightness}</p>
                  </div>

                  {/* Contraste */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Contrast className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Contraste</p>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => handleManualAdjustmentChange('contrast', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{contrast}</p>
                  </div>

                  {/* Saturación */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Droplets className="w-6 h-6 text-pink-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Saturación</p>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => handleManualAdjustmentChange('saturation', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{saturation}</p>
                  </div>

                  {/* Exposición */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Exposición</p>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={exposure}
                      onChange={(e) => handleManualAdjustmentChange('exposure', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{exposure}</p>
                  </div>

                  {/* Highlights */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Lightbulb className="w-6 h-6 text-yellow-300" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Altas luces</p>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={highlights}
                      onChange={(e) => handleManualAdjustmentChange('highlights', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{highlights}</p>
                  </div>

                  {/* Shadows */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Moon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Sombras</p>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={shadows}
                      onChange={(e) => handleManualAdjustmentChange('shadows', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{shadows}</p>
                  </div>

                  {/* Warmth */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Flame className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Calidez</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={warmth}
                      onChange={(e) => handleManualAdjustmentChange('warmth', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{warmth - 50 > 0 ? '+' : ''}{warmth - 50}</p>
                  </div>

                  {/* Tint */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Palette className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Tono</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tint}
                      onChange={(e) => handleManualAdjustmentChange('tint', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{tint - 50 > 0 ? '+' : ''}{tint - 50}</p>
                  </div>

                  {/* Sharpness */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Focus className="w-6 h-6 text-cyan-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Nitidez</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sharpness}
                      onChange={(e) => handleManualAdjustmentChange('sharpness', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{sharpness}</p>
                  </div>

                  {/* Vignette */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <Circle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Viñeta</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vignette}
                      onChange={(e) => handleManualAdjustmentChange('vignette', Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">{vignette}</p>
                  </div>
                </div>
              </div>

              {/* Herramientas adicionales */}
              <div className="flex gap-3">
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
                  setExposure(50)
                  setHighlights(50)
                  setShadows(50)
                  setWarmth(50)
                  setTint(50)
                  setSharpness(50)
                  setVignette(0)
                  setRotation(0)
                  setUseManualAdjustments(false)
                }}
                className="w-full bg-red-600/20 text-red-400 text-sm py-3 rounded-xl hover:bg-red-600/30 transition-colors font-medium"
              >
                🔄 Restablecer todos los ajustes
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
                    onClick={() => handleFilterSelect(filter.name)}
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
                        <Image
                          src={imageUrl}
                          alt={filter.label}
                          width={200}
                          height={200}
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

      {/* Alert Container */}
      <AlertContainer alerts={alerts} />
    </div>
  )
}
