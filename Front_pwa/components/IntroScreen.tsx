import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'

interface IntroScreenProps {
  onComplete: () => void
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [videoEnded, setVideoEnded] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario ya está logueado
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userData && token) {
      // Si el usuario está logueado, saltarse todo y ir directo al perfil
      onComplete()
      router.push('/profile')
      return
    }

    // Si no está logueado, proceder con el video de introducción
    const video = videoRef.current
    if (video) {
      // Configurar el video para reproducción automática
      video.play().catch(console.error)
      
      // Manejar cuando el video termina
      const handleVideoEnd = () => {
        setVideoEnded(true)
        // Mostrar el login después de que termine el video
        setTimeout(() => {
          setShowLogin(true)
        }, 500)
      }

      video.addEventListener('ended', handleVideoEnd)
      
      return () => {
        video.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [onComplete, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Aquí iría la lógica de login
      // Por ahora simulamos un login exitoso
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar si hay datos del usuario en localStorage
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (userData && token) {
        // Si hay datos del usuario, redirigir al perfil
        onComplete()
        router.push('/profile')
      } else {
        // Si no hay datos, redirigir al login
        onComplete()
        router.push('/login')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToRegister = () => {
    onComplete()
    router.push('/register')
  }

  const handleSkipVideo = () => {
    setVideoEnded(true)
    setTimeout(() => {
      setShowLogin(true)
    }, 500)
  }

  const handleToggleSound = () => {
    const video = videoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <>
      <Head>
        <title>InkEndin - Bienvenido</title>
      </Head>
      
      <div className="fixed inset-0 z-50 bg-black">
        {/* Video de introducción */}
        <AnimatePresence>
          {!videoEnded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                preload="auto"
                muted={true}
                autoPlay
                loop={false}
                controls={false}
              >
                <source src="/intro.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>

              {/* Botón de saltar */}
              <div className="absolute top-4 right-4">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  onClick={handleSkipVideo}
                  className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/70 transition-all"
                >
                  Saltar
                </motion.button>
              </div>

              {/* Botón de sonido */}
              <div className="absolute top-4 left-4">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  onClick={handleToggleSound}
                  className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all"
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </motion.button>
              </div>

              {/* Indicador de carga */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center space-x-2 text-white"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pantalla con imagen de fondo y login */}
        <AnimatePresence>
          {videoEnded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="h-screen bg-[#0a0a0a] relative overflow-hidden"
            >
              {/* Imagen de fondo */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: 'url(/fondo.jpeg)',
                  filter: 'brightness(0.3)'
                }}
              />

              {/* Overlay oscuro para mejor legibilidad */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Contenido del login */}
              <div className="relative z-10 h-full flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showLogin ? 1 : 0, y: showLogin ? 0 : 20 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-md"
                >
                  {/* Logo & Title */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: showLogin ? 1 : 0 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 relative"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-2 border-white/30 rounded-full border-t-transparent"
                      />
                    </motion.div>
                    
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: showLogin ? 1 : 0, y: showLogin ? 0 : 20 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-4xl font-bold mb-2"
                    >
                      <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        InkEndin
                      </span>
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: showLogin ? 1 : 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-300 text-base"
                    >
                      Conecta con los mejores tatuadores
                    </motion.p>
                  </div>

                  {/* Login Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: showLogin ? 1 : 0, y: showLogin ? 0 : 20 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-800/50 shadow-2xl"
                  >
                    <h2 className="text-xl font-bold text-white mb-4">Iniciar Sesión</h2>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email o Usuario
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            className="w-full pl-12 pr-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                          Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-base hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <LogIn className="w-5 h-5" />
                            Iniciar Sesión
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[#1a1a1a] text-gray-500">O continúa con</span>
                      </div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                      <p className="text-gray-400">
                        ¿No tienes cuenta?{' '}
                        <button
                          onClick={handleGoToRegister}
                          className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold hover:from-blue-300 hover:to-purple-300 transition-all"
                        >
                          Regístrate aquí
                        </button>
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}