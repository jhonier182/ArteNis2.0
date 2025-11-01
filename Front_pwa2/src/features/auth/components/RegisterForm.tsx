'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, User, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordStrengthBar } from '@/components/ui/PasswordStrengthBar'
import { RoleSelector, UserRole } from '@/components/ui/RoleSelector'
import { isValidEmail } from '@/utils/validators'

export function RegisterForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!fullName.trim()) {
      setError('El nombre completo es requerido')
      return
    }

    if (fullName.trim().split(' ').length < 2) {
      setError('Por favor ingresa tu nombre completo (mínimo 2 palabras)')
      return
    }

    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!role) {
      setError('Por favor selecciona un tipo de cuenta')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      // Extraer username del nombre completo (primera palabra)
      const username = fullName.trim().split(' ')[0].toLowerCase()
      await register(username, email, password, role || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-white">Nombre Completo</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <User size={18} />
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juan Pérez"
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-white">Email</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail size={18} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />
        <PasswordStrengthBar password={password} />
      </div>

      <div>
        <PasswordInput
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          required
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="mt-1 text-sm text-red-400">Las contraseñas no coinciden</p>
        )}
      </div>

      <RoleSelector value={role} onChange={setRole} />

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
          required
        />
        <label htmlFor="terms" className="text-sm text-gray-400">
          Al registrarte, aceptas nuestros{' '}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
            Política de Privacidad
          </Link>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-secondary text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Cargando...</span>
          </>
        ) : (
          <>
            <UserPlus size={20} />
            <span>Crear Cuenta</span>
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </form>
  )
}

