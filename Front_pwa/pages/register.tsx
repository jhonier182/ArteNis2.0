import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Sparkles,
  Check,
  X as XIcon,
  Palette,
  Users as UsersIcon
} from 'lucide-react'
import { apiClient } from '@/utils/apiClient'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    userType: 'user' as 'user' | 'artist',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const validateForm = () => {
    if (formData.username.length < 3 || formData.username.length > 50) {
      setError('El nombre de usuario debe tener entre 3 y 50 caracteres')
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('El nombre de usuario solo puede contener letras, números y guiones bajos')
      return false
    }

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

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      await apiClient.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        userType: formData.userType,
      })
      
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario')
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
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <Head>
        <title>Registro - InkEndin</title>
      </Head>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-600/10 via-transparent to-purple-600/10 animate-gradient-reverse" />
        
        {/* Animated Tattoo Patterns */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
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
                Únete a InkEndin
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400"
            >
              Conecta con artistas del tatuaje de todo el mundo
            </motion.p>
          </div>

          {/* Register Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 shadow-2xl"
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

            {/* User Type Selection */}
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-300 mb-4 text-center">
                ¿Cómo quieres unirte?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'user' })}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    formData.userType === 'user'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-800 bg-[#0f0f0f] hover:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      formData.userType === 'user' ? 'bg-blue-500/20' : 'bg-gray-800'
                    }`}>
                      <UsersIcon className={`w-6 h-6 ${
                        formData.userType === 'user' ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">Usuario</p>
                      <p className="text-xs text-gray-400 mt-1">Explora y guarda tatuajes</p>
                    </div>
                  </div>
                  {formData.userType === 'user' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'artist' })}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    formData.userType === 'artist'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-800 bg-[#0f0f0f] hover:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      formData.userType === 'artist' ? 'bg-purple-500/20' : 'bg-gray-800'
                    }`}>
                      <Palette className={`w-6 h-6 ${
                        formData.userType === 'artist' ? 'text-purple-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">Artista</p>
                      <p className="text-xs text-gray-400 mt-1">Comparte tu arte</p>
                    </div>
                  </div>
                  {formData.userType === 'artist' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username & Full Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="usuario123"
                      className="w-full pl-12 pr-4 py-3.5 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

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
                      className="w-full pl-12 pr-4 py-3.5 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
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
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    className="w-full pl-12 pr-12 py-3.5 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                            i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-800'
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
                    className="w-full pl-12 pr-12 py-3.5 bg-[#0f0f0f] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group mt-6"
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

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Al registrarte, aceptas nuestros{' '}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                Política de Privacidad
              </Link>
            </p>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6"
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

      {/* Animated gradient background */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-reverse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
        .animate-gradient-reverse {
          animation: gradient-reverse 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}