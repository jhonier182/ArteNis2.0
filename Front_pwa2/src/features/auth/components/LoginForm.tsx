'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { TextInput } from '@/components/ui/TextInput'
import { SocialLoginButtons } from '@/components/ui/buttons'
import {
  validateLoginIdentifier,
  validateLoginPassword
} from '@/utils/validators'
import { extractValidationErrors, extractErrorMessage } from '@/utils/errorHelpers'

interface LoginFormProps {
  onForgotPassword?: () => void
}

interface FieldErrors {
  identifier?: string
  password?: string
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const validateFields = (): boolean => {
    const errors: FieldErrors = {}
    
    const identifierError = validateLoginIdentifier(emailOrUsername)
    if (identifierError) errors.identifier = identifierError

    const passwordError = validateLoginPassword(password)
    if (passwordError) errors.password = passwordError

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateFields()) {
      return
    }

    setLoading(true)

    try {
      await login(emailOrUsername, password)
    } catch (err) {
      const backendErrors = extractValidationErrors<FieldErrors>(err)
      if (Object.keys(backendErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...backendErrors }))
      }
      const errorMessage = extractErrorMessage(err)
      if (errorMessage && Object.keys(backendErrors).length === 0) {
        setError(errorMessage)
      } else if (Object.keys(backendErrors).length > 0) {
        setError('')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmailOrUsername(value)
    const error = validateLoginIdentifier(value)
    setFieldErrors(prev => ({
      ...prev,
      identifier: error || undefined
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    const error = validateLoginPassword(value)
    setFieldErrors(prev => ({
      ...prev,
      password: error || undefined
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <TextInput
        label="Email o Usuario"
        type="text"
        value={emailOrUsername}
        onChange={handleIdentifierChange}
        placeholder="tu@email.com"
        icon={<Mail size={18} />}
        error={fieldErrors.identifier}
        autoComplete="username"
        required
      />

      <div>
        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={handlePasswordChange}
          placeholder="........"
          error={fieldErrors.password}
          autoComplete="current-password"
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
