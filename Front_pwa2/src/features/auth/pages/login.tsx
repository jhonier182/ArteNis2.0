'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { AxiosError } from 'axios'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Si está autenticado, redirigir al inicio
    // Usar replace para evitar historial innecesario
    if (isAuthenticated) {
      setIsLoading(false) // Resetear loading cuando se confirma autenticación
      // Pequeño delay para asegurar que el estado se actualice completamente
      const timeoutId = setTimeout(() => {
        router.replace('/')
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, router])

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
      await login(formData.email, formData.password)
      // No navegar aquí, dejar que el useEffect maneje la redirección
      // Esto evita condiciones de carrera con el estado de autenticación
      // El setIsLoading se mantendrá activo hasta que se complete la redirección
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Error al iniciar sesión')
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <Head>
        <title>Iniciar Sesión - Inkedin</title>
      </Head>

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

      {/* Content */}
      <div className="relative z-10 h-full flex items-start justify-center px-4 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Inkedin
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-base"
            >
              Conecta con los mejores tatuadores
            </motion.p>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800/50 shadow-2xl"
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
                    className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
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
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-900 text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 11v2.6h3.9c-.2 1-1.2 3-3.9 3-2.4 0-4.3-2-4.3-4.4s1.9-4.4 4.3-4.4c1.4 0 2.3.6 2.8 1.1l2.1-2C15.5 5.6 13.9 5 12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H12z"/>
                  <path fill="#4285F4" d="M5 12c0-.7.1-1.3.4-1.9L2.6 8C2.2 9.2 2 10.6 2 12s.2 2.8.6 4l2.8-2.1c-.3-.6-.4-1.2-.4-1.9z"/>
                  <path fill="#FBBC05" d="M12 19c1.9 0 3.5-.6 4.7-1.7l-2.2-1.8c-.6.4-1.4.7-2.5.7-2.4 0-4.3-2-4.3-4.4 0-.5.1-1 .2-1.4L5.4 8.1C4.5 9.4 4 10.6 4 12c0 3.9 3.1 7 8 7h0z"/>
                  <path fill="#34A853" d="M19.1 10.2c.1.4.1.9.1 1.3 0 4-2.7 6.8-6.7 6.8h-.5v-3.5h.5c1.8 0 3-1.1 3.5-2.6h-3.5v-2h6.6z"/>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-4"
          >
            <p className="text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold hover:from-blue-300 hover:to-purple-300 transition-all"
              >
                Regístrate aquí
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

