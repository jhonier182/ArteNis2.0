'use client'

import { useState, useRef, useEffect } from 'react'
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
  Circle,
  Upload
} from 'lucide-react'

export type FilterType = 'none' | 'vivid' | 'bright' | 'dark' | 'vintage' | 'cool' | 'warm'

export interface ImageEditorProps {
  imageUrl?: string  // Ahora opcional
  onSave: (editedImageBlob: Blob, description: string, hashtags: string[]) => Promise<void>
  onClose: () => void
  onSelectFile?: () => void  // Nueva prop para abrir galería
  isPublishing?: boolean
  initialDescription?: string  // Descripción inicial
}

export function ImageEditor({ 
  imageUrl, 
  onSave, 
  onClose, 
  onSelectFile,
  isPublishing = false,
  initialDescription = ''
}: ImageEditorProps) {
  const [description, setDescription] = useState(initialDescription)
  const [hashtags, setHashtags] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
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
  const [useManualAdjustments, setUseManualAdjustments] = useState(false)

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
      const hueRotate = (warmth - 50) * 0.6
      const hueRotateTint = (tint - 50) * 1.2
      
      const filters = []
      
      if (exposure !== 50) {
        filters.push(`brightness(${exposure}%)`)
      }
      
      filters.push(`brightness(${brightness}%)`)
      filters.push(`contrast(${contrast}%)`)
      filters.push(`saturate(${saturation}%)`)
      
      if (warmth !== 50 || tint !== 50) {
        filters.push(`hue-rotate(${hueRotate + hueRotateTint}deg)`)
      }
      
      if (sharpness < 50) {
        const blurAmount = (50 - sharpness) / 25
        filters.push(`blur(${blurAmount}px)`)
      }
      
      return filters.join(' ')
    } else {
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

  const resetAdjustments = () => {
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
    setSelectedFilter('none')
  }

  // Helper para determinar si un ajuste está activo
  const isAdjustmentActive = (value: number, defaultValue: number) => {
    return value !== defaultValue
  }

  // Helper para obtener clases de estilo dinámico según el ajuste
  const getAdjustmentClasses = (value: number, defaultValue: number, activeColor: string) => {
    const isActive = isAdjustmentActive(value, defaultValue)
    return {
      container: `w-14 h-14 rounded-xl flex items-center justify-center mb-2 mx-auto transition-all ${
        isActive 
          ? `bg-gradient-to-br ${activeColor}/20 border-2 ${activeColor}/50 shadow-lg ${activeColor}/20` 
          : 'bg-gray-800 border border-gray-700'
      }`,
      icon: `w-7 h-7 ${isActive ? activeColor : 'text-gray-500'}`,
      label: `text-xs font-semibold mb-2 ${isActive ? activeColor : 'text-gray-400'}`,
      value: `text-xs font-medium mt-1 ${isActive ? activeColor : 'text-gray-500'}`
    }
  }

  const applyFiltersToCanvas = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imageUrl) {
        reject(new Error('No image URL provided'))
        return
      }

      const canvas = document.createElement('canvas')
      
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('No context'))
          return
        }

        if (rotation === 90 || rotation === 270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (rotation !== 0) {
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.drawImage(img, -img.width / 2, -img.height / 2)
          ctx.restore()
        } else {
          ctx.drawImage(img, 0, 0)
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        if (useManualAdjustments) {
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i]
            let g = data[i + 1]
            let b = data[i + 2]

            const exposureFactor = exposure / 100
            const brightnessFactor = brightness / 100
            
            r = r * exposureFactor * brightnessFactor
            g = g * exposureFactor * brightnessFactor
            b = b * exposureFactor * brightnessFactor

            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
            
            if (highlights !== 50 && luminance > 128) {
              const highlightIntensity = (highlights - 50) / 200
              const highlightWeight = (luminance - 128) / 127
              const adjustment = highlightIntensity * highlightWeight * 50
              r += adjustment
              g += adjustment
              b += adjustment
            }

            if (shadows !== 50 && luminance < 128) {
              const shadowIntensity = (shadows - 50) / 200
              const shadowWeight = (128 - luminance) / 128
              const adjustment = shadowIntensity * shadowWeight * 50
              r += adjustment
              g += adjustment
              b += adjustment
            }

            const contrastFactor = contrast / 100
            r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255
            g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255
            b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255

            const saturationFactor = saturation / 100
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
            r = gray + (r - gray) * saturationFactor
            g = gray + (g - gray) * saturationFactor
            b = gray + (b - gray) * saturationFactor

            if (warmth !== 50) {
              const warmthAdjust = (warmth - 50) / 50
              r += warmthAdjust * 8
              b -= warmthAdjust * 8
            }

            if (tint !== 50) {
              const tintAdjust = (tint - 50) / 50
              g += tintAdjust * 5
            }

            data[i] = Math.min(255, Math.max(0, r))
            data[i + 1] = Math.min(255, Math.max(0, g))
            data[i + 2] = Math.min(255, Math.max(0, b))
          }

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

            data[i] = Math.min(255, Math.max(0, r))
            data[i + 1] = Math.min(255, Math.max(0, g))
            data[i + 2] = Math.min(255, Math.max(0, b))
          }
        }

        ctx.putImageData(imageData, 0, 0)

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

  // Extraer hashtags de la descripción
  useEffect(() => {
    if (description) {
      const hashtagRegex = /#[\w]+/g
      const matches = description.match(hashtagRegex)
      if (matches) {
        const uniqueHashtags = [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))]
        setHashtags(uniqueHashtags)
      } else {
        setHashtags([])
      }
    }
  }, [description])

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 500) {
      setDescription(value)
    }
  }

  const handleSave = async () => {
    if (!imageUrl) {
      // No permitir publicar sin imagen
      return
    }

    try {
      const blob = await applyFiltersToCanvas()
      await onSave(blob, description, hashtags)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419] border-b border-gray-800">
        <div className="container-mobile px-4 py-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              disabled={isPublishing}
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">
              {imageUrl ? '✨ Crear Publicación' : '📸 Nueva Publicación'}
            </h1>
            {imageUrl && (
              <button
                onClick={handleSave}
                disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Publicar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-[#0f1419] to-black/50 min-h-[50vh]">
        {!imageUrl ? (
          // Si no hay imagen, mostrar botón para seleccionar con diseño mejorado
          <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-sm mx-auto px-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border-2 border-dashed border-blue-500/50 animate-pulse">
                <Upload className="w-16 h-16 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">+</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">¡Crea tu publicación!</h2>
              <p className="text-gray-400 text-sm">Comienza seleccionando una imagen de tu galería</p>
            </div>
            {onSelectFile && (
              <button
                onClick={onSelectFile}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-bold text-white transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Seleccionar de Galería</span>
              </button>
            )}
            <p className="text-xs text-gray-500 text-center">
              Formatos soportados: JPG, PNG, GIF • Máx. 10MB
            </p>
          </div>
        ) : (
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
              className="max-w-full max-h-[60vh] object-contain"
              style={{
                filter: getFilterStyle(),
                transition: 'filter 0.2s ease',
              }}
            />
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
        )}
      </div>

      {/* Descripción - Solo mostrar si hay imagen */}
      {imageUrl && (
        <div className="bg-[#0f1419] border-t border-gray-800 px-4 py-5">
          <div className="container-mobile max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-200">
                📝 Descripción
              </label>
              {onSelectFile && (
                <button
                  onClick={onSelectFile}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  disabled={isPublishing}
                >
                  <Upload className="w-3 h-3" />
                  Cambiar imagen
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                maxLength={500}
                placeholder="Describe tu trabajo... 💡 Usa #hashtags para mejorar el alcance"
                className="w-full h-32 bg-gray-800/80 border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-sm"
                disabled={isPublishing}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                {description.length > 400 && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                )}
                <span className={`text-xs font-medium ${
                  description.length > 450 ? 'text-orange-400' : 
                  description.length > 400 ? 'text-yellow-400' : 
                  'text-gray-500'
                }`}>
                  {description.length}/500
                </span>
              </div>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-gray-400 font-medium">Hashtags detectados:</span>
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Solo mostrar si hay imagen */}
      {imageUrl && (
        <div className="bg-[#0f1419] border-t border-gray-800">
          <div className="container-mobile flex max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'adjust' 
                  ? 'text-blue-400 bg-blue-600/10' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              disabled={isPublishing}
            >
              <Sliders className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'adjust' ? 'text-blue-400' : ''}`} />
              Ajustes
              {activeTab === 'adjust' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'filters' 
                  ? 'text-blue-400 bg-blue-600/10' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              disabled={isPublishing}
            >
              <Sparkles className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'filters' ? 'text-blue-400' : ''}`} />
              Filtros
              {activeTab === 'filters' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Controls Area - Solo mostrar si hay imagen */}
      {imageUrl && (
        <div className="bg-[#0f1419] border-t border-gray-800 pb-safe max-h-[40vh] overflow-y-auto">
          <div className="container-mobile p-4 max-w-md mx-auto">
            {activeTab === 'adjust' ? (
            <div className="space-y-4">
              {/* Scroll horizontal de ajustes */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 pb-2" style={{ width: 'max-content' }}>
                  {/* Brillo */}
                  <div className="flex-shrink-0 w-24 text-center">
                    {(() => {
                      const classes = getAdjustmentClasses(brightness, 100, 'from-yellow-500 to-orange-500')
                      return (
                        <>
                          <div className={classes.container}>
                            <Sun className={classes.icon} />
                          </div>
                          <p className={classes.label}>Brillo</p>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={(e) => handleManualAdjustmentChange('brightness', Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-yellow"
                          />
                          <p className={classes.value}>{brightness}</p>
                        </>
                      )
                    })()}
                  </div>

                  {/* Contraste */}
                  <div className="flex-shrink-0 w-24 text-center">
                    {(() => {
                      const classes = getAdjustmentClasses(contrast, 50, 'from-blue-500 to-cyan-500')
                      return (
                        <>
                          <div className={classes.container}>
                            <Contrast className={classes.icon} />
                          </div>
                          <p className={classes.label}>Contraste</p>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={(e) => handleManualAdjustmentChange('contrast', Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                          />
                          <p className={classes.value}>{contrast}</p>
                        </>
                      )
                    })()}
                  </div>

                  {/* Saturación */}
                  <div className="flex-shrink-0 w-24 text-center">
                    {(() => {
                      const classes = getAdjustmentClasses(saturation, 50, 'from-pink-500 to-rose-500')
                      return (
                        <>
                          <div className={classes.container}>
                            <Droplets className={classes.icon} />
                          </div>
                          <p className={classes.label}>Saturación</p>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={saturation}
                            onChange={(e) => handleManualAdjustmentChange('saturation', Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                          />
                          <p className={classes.value}>{saturation}</p>
                        </>
                      )
                    })()}
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
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleRotate}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-3.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold border border-gray-700"
                  disabled={isPublishing}
                >
                  <RotateCw className="w-5 h-5" />
                  <span>🔄 Rotar</span>
                </button>
                <button 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-3.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold border border-gray-700 opacity-50 cursor-not-allowed"
                  disabled
                  title="Próximamente"
                >
                  <Crop className="w-5 h-5" />
                  <span>✂️ Recortar</span>
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={resetAdjustments}
                className="w-full bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-300 text-sm py-3 rounded-xl hover:from-red-600/30 hover:to-orange-600/30 transition-all font-semibold border border-red-500/30 flex items-center justify-center gap-2"
                disabled={isPublishing}
              >
                <RotateCw className="w-4 h-4" />
                Restablecer todos los ajustes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-300">✨ Filtros disponibles</h3>
                  <span className="text-xs text-gray-500">{filters.length} opciones</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar scroll-smooth">
                  {filters.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => handleFilterSelect(filter.name)}
                      className="flex-shrink-0 w-24 transition-all transform hover:scale-105"
                      disabled={isPublishing}
                    >
                      <div
                        className={`relative aspect-square rounded-2xl overflow-hidden mb-2 border-2 transition-all shadow-lg ${
                          selectedFilter === filter.name
                            ? 'border-blue-500 scale-95 ring-4 ring-blue-500/30'
                            : 'border-gray-700 hover:border-gray-600'
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
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent flex items-center justify-center">
                            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                        {selectedFilter !== filter.name && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs text-center font-medium transition-colors ${
                        selectedFilter === filter.name ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {filter.label}
                      </p>
                    </button>
                  ))}
                </div>
                {selectedFilter !== 'none' && (
                  <button
                    onClick={() => handleFilterSelect('none')}
                    className="w-full bg-gray-800/50 text-gray-300 text-sm py-2.5 rounded-xl hover:bg-gray-800 transition-colors font-medium border border-gray-700"
                    disabled={isPublishing}
                  >
                    ✕ Quitar filtro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      <style>{`
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

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
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

