'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { SocialLoginButtons } from '@/components/ui/SocialLoginButtons'

interface LoginFormProps {
  onForgotPassword?: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(emailOrUsername, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
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
        <label className="block text-sm font-medium mb-1 text-white">
          Email o Usuario
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail size={18} />
          </div>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="tu@email.com"
            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-neutral-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="........"
          required
        />
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-primary text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Cargando...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>

      <SocialLoginButtons />

      <div className="text-center text-sm text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
          Regístrate aquí
        </Link>
      </div>
    </form>
  )
}
