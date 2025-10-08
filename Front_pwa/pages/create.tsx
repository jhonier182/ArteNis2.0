import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Image as ImageIcon, 
  Camera, 
  Video,
  ChevronRight,
  Users,
  Lock,
  Globe,
  Tag,
  Type,
  Sparkles
} from 'lucide-react'
import { useUser } from '@/context/UserContext'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [clientTag, setClientTag] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [showStylePicker, setShowStylePicker] = useState(false)

  const tattooStyles = [
    'Realismo', 'Tradicional', 'Japonés', 'Acuarela',
    'Geométrico', 'Minimalista', 'Blackwork', 'Dotwork',
    'Tribal', 'Neo-tradicional', 'Ilustrativo', 'Lettering'
  ]

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (user?.userType !== 'artist') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-gray-400 mb-4">Solo los tatuadores pueden crear publicaciones</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Solo se permiten imágenes o videos')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleStyleToggle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style))
    } else {
      setSelectedStyles([...selectedStyles, style])
    }
  }

  const handleNext = () => {
    if (!selectedFile) {
      alert('Por favor selecciona una imagen o video')
      return
    }
    
    // Guardar la imagen en localStorage como base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      localStorage.setItem('draft_image', imageData)
      localStorage.setItem('draft_filename', selectedFile.name)
      localStorage.setItem('draft_description', description)
      localStorage.setItem('draft_styles', selectedStyles.join(','))
      localStorage.setItem('draft_client', clientTag)
      localStorage.setItem('draft_visibility', visibility)
      
      // Navegar a la pantalla de edición
      router.push('/create/edit')
    }
    reader.readAsDataURL(selectedFile)
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <Head>
        <title>Crear Publicación - InkEndin</title>
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
            <h1 className="text-lg font-bold">Nueva Publicación</h1>
            {selectedFile && (
              <button
                onClick={handleNext}
                className="text-blue-500 font-semibold"
              >
                Siguiente
              </button>
            )}
            {!selectedFile && <div className="w-20" />}
          </div>
        </div>
      </header>

      <div className="container-mobile px-4 py-6">
        {/* Área de selección de archivo */}
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Botones de carga */}
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="font-semibold">Seleccionar de la galería</span>
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-gray-800 text-white p-6 rounded-2xl hover:bg-gray-700 transition-all flex items-center justify-center gap-3"
              >
                <Camera className="w-6 h-6" />
                <span className="font-semibold">Tomar foto</span>
              </button>

              <button className="w-full bg-gray-800 text-white p-6 rounded-2xl hover:bg-gray-700 transition-all flex items-center justify-center gap-3">
                <Video className="w-6 h-6" />
                <span className="font-semibold">Seleccionar video</span>
              </button>
            </div>

            {/* Inputs ocultos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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

            {/* Info */}
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-2xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-400 mb-1">Tips para mejores publicaciones</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Buena iluminación natural</li>
                    <li>• Fondo limpio y neutral</li>
                    <li>• Enfoque en el tatuaje</li>
                    <li>• Múltiples ángulos si es posible</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Preview */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900">
              <img
                src={previewUrl || ''}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu trabajo, técnica utilizada, tiempo de sesión..."
                className="w-full h-32 bg-[#0f1419] border border-gray-800 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">{description.length}/500 caracteres</p>
            </div>

            {/* Estilos de tatuaje */}
            <div>
              <button
                onClick={() => setShowStylePicker(!showStylePicker)}
                className="w-full flex items-center justify-between p-4 bg-[#0f1419] border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Estilos de tatuaje</p>
                    {selectedStyles.length > 0 && (
                      <p className="text-xs text-gray-400">{selectedStyles.join(', ')}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showStylePicker ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showStylePicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {tattooStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => handleStyleToggle(style)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedStyles.includes(style)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Etiquetar cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Etiquetar cliente (opcional)
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={clientTag}
                  onChange={(e) => setClientTag(e.target.value)}
                  placeholder="@usuario"
                  className="w-full pl-12 pr-4 py-3 bg-[#0f1419] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Visibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Visibilidad
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVisibility('public')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    visibility === 'public'
                      ? 'border-blue-600 bg-blue-600/20'
                      : 'border-gray-800 bg-gray-900/50'
                  }`}
                >
                  <Globe className={`w-6 h-6 mx-auto mb-2 ${
                    visibility === 'public' ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    visibility === 'public' ? 'text-white' : 'text-gray-400'
                  }`}>
                    Público
                  </p>
                </button>

                <button
                  onClick={() => setVisibility('private')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    visibility === 'private'
                      ? 'border-purple-600 bg-purple-600/20'
                      : 'border-gray-800 bg-gray-900/50'
                  }`}
                >
                  <Lock className={`w-6 h-6 mx-auto mb-2 ${
                    visibility === 'private' ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    visibility === 'private' ? 'text-white' : 'text-gray-400'
                  }`}>
                    Privado
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0e1a] border-t border-gray-800 z-50 safe-bottom">
        <div className="container-mobile flex items-center justify-around py-2">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs">Inicio</span>
          </button>
          
          <button 
            onClick={() => router.push('/search')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-xs">Buscar</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-3 text-blue-500">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center -mt-2">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
            <span className="text-xs font-medium">Publicar</span>
          </button>
          
          <button 
            onClick={() => router.push('/notifications')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="text-xs">Notificaciones</span>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
