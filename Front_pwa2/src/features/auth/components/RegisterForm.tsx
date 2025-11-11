'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, User, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordStrengthBar } from '@/components/ui/PasswordStrengthBar'
import { TextInput } from '@/components/ui/TextInput'
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateConfirmPassword
} from '@/utils/validators'
import { extractValidationErrors, extractErrorMessage } from '@/utils/errorHelpers'

interface FieldErrors extends Record<string, string | undefined> {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const validateFields = (): boolean => {
    const errors: FieldErrors = {}
    
    const firstNameError = validateFirstName(firstName)
    if (firstNameError) errors.firstName = firstNameError

    const lastNameError = validateLastName(lastName)
    if (lastNameError) errors.lastName = lastNameError

    const emailError = validateEmail(email)
    if (emailError) errors.email = emailError

    const passwordError = validatePassword(password)
    if (passwordError) errors.password = passwordError

    const confirmPasswordError = validateConfirmPassword(password, confirmPassword)
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError

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

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      const username = firstName.trim().toLowerCase()
      await register(username, email, password, acceptTerms, false, fullName)
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

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFirstName(value)
    const error = validateFirstName(value, true)
    setFieldErrors(prev => ({
      ...prev,
      firstName: error || undefined
    }))
  }

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLastName(value)
    const error = validateLastName(value, true)
    setFieldErrors(prev => ({
      ...prev,
      lastName: error || undefined
    }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    const error = validateEmail(value, true)
    setFieldErrors(prev => ({
      ...prev,
      email: error || undefined
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    const error = validatePassword(value, true)
    setFieldErrors(prev => ({
      ...prev,
      password: error || undefined
    }))
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(value, confirmPassword, true)
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError || undefined
      }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    const error = validateConfirmPassword(password, value, true)
    setFieldErrors(prev => ({
      ...prev,
      confirmPassword: error || undefined
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Nombre"
          value={firstName}
          onChange={handleFirstNameChange}
          placeholder="Juan"
          icon={<User size={18} />}
          error={fieldErrors.firstName}
          autoComplete="given-name"
          required
        />

        <TextInput
          label="Apellido"
          value={lastName}
          onChange={handleLastNameChange}
          placeholder="Pérez"
          icon={<User size={18} />}
          error={fieldErrors.lastName}
          autoComplete="family-name"
          required
        />
      </div>

      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="tu@email.com"
        icon={<Mail size={18} />}
        error={fieldErrors.email}
        autoComplete="email"
        required
      />

      <div>
        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={handlePasswordChange}
          placeholder="********"
          error={fieldErrors.password}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthBar password={password} />
      </div>

      <PasswordInput
        label="Confirmar Contraseña"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="********"
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 w-4 h-4 text-purple-600 bg-black border-neutral-800 rounded focus:ring-purple-500"
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

