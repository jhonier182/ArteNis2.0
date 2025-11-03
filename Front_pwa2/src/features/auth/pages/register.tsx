'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { AxiosError } from 'axios'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Sparkles,
  Check,
  X as XIcon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password))
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setError('')
  }

  const validateForm = () => {
    if (formData.fullName.length < 2 || formData.fullName.length > 255) {
      setError('El nombre completo debe tener entre 2 y 255 caracteres')
      return false
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones para registrarte')
      return false
    }

    if (!formData.acceptPrivacy) {
      setError('Debes aceptar la política de privacidad para registrarte')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      // Extraer username del nombre completo (primera palabra)
      const username = formData.fullName.trim().split(' ')[0].toLowerCase()
      await register(username, formData.email, formData.password, formData.acceptTerms, formData.acceptPrivacy)
      router.push('/login?registered=true')
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Muy débil'
    if (passwordStrength === 1) return 'Débil'
    if (passwordStrength === 2) return 'Regular'
    if (passwordStrength === 3) return 'Buena'
    if (passwordStrength === 4) return 'Fuerte'
    return 'Muy fuerte'
  }

  const passwordRequirements = [
    { met: formData.password.length >= 6, text: 'Mínimo 6 caracteres' },
    { met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password), text: 'Mayúsculas y minúsculas' },
    { met: /\d/.test(formData.password), text: 'Al menos un número' },
    { met: /[^a-zA-Z0-9]/.test(formData.password), text: 'Carácter especial' },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Head>
        <title>Registro - Inkedin</title>
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 mb-4 relative"
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
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Inkedin
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400"
            >
              Únete a la comunidad de tatuajes más grande
            </motion.p>
          </div>

          {/* Register Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 border border-neutral-800/50 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
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
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

                {/* Password Strength */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Seguridad:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 1 ? 'text-red-400' :
                        passwordStrength <= 3 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength ? getPasswordStrengthColor() : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Password Requirements */}
                    <div className="mt-3 space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <XIcon className="w-3 h-3 text-gray-600" />
                          )}
                          <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-center gap-2 text-xs"
                  >
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <XIcon className="w-3 h-3 text-red-400" />
                        <span className="text-red-400">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Checkboxes de Términos y Privacidad */}
              <div className="space-y-3 mt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-neutral-900 cursor-pointer transition-all"
                    required
                  />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Acepto los{' '}
                    <Link href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                      Términos y Condiciones
                    </Link>
                    {' '}de uso
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-neutral-900 cursor-pointer transition-all"
                    required
                  />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    Acepto la{' '}
                    <Link href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                      Política de Privacidad
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-3 rounded-xl font-semibold text-base hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group mt-4"
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
                    <UserPlus className="w-5 h-5" />
                    Crear Cuenta
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-4"
          >
            <p className="text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold hover:from-purple-300 hover:to-pink-300 transition-all"
              >
                Inicia sesión
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

    </div>
  )
}
