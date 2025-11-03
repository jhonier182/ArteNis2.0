'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeft, Save, User, Phone, MapPin, Building2, DollarSign, Briefcase, Sparkles } from 'lucide-react'
import { AxiosError } from 'axios'
import { profileService, type Profile, type UpdateProfileData } from '../services/profileService'
import { useAuth } from '@/context/AuthContext'

const SPECIALTIES_OPTIONS = [
  'Realista',
  'Tradicional',
  'Japonés',
  'Geométrico',
  'Acuarela',
  'Neotradicional',
  'Minimalista',
  'Tribal',
  'Lettering',
  'Blackwork',
  'Color',
  'Grises'
]

interface FormData {
  fullName: string
  bio: string
  phone: string
  city: string
  state: string
  country: string
  studioName: string
  studioAddress: string
  pricePerHour: string
  experience: string
  specialties: string[]
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    studioName: '',
    studioAddress: '',
    pricePerHour: '',
    experience: '',
    specialties: []
  })

  const isArtist = currentProfile?.userType === 'artist'

  // Cargar perfil al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        router.push('/login')
        return
      }

      try {
        setIsLoading(true)
        const profile = await profileService.getCurrentProfile()
        console.log('📥 [EditProfilePage] Perfil cargado desde servidor:', {
          fullName: profile.fullName,
          username: profile.username,
          country: profile.country
        })
        setCurrentProfile(profile)
        setFormData({
          fullName: profile.fullName || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          studioName: profile.studioName || '',
          studioAddress: profile.studioAddress || '',
          pricePerHour: profile.pricePerHour?.toString() || '',
          experience: profile.experience?.toString() || '',
          specialties: Array.isArray(profile.specialties) ? profile.specialties : []
        })
      } catch (error) {
        console.error('Error al cargar perfil:', error)
        setError('Error al cargar el perfil')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.id, router])

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
    setSuccessMessage('')
  }

  const handleSpecialtyToggle = (specialty: string) => {
    const currentSpecialties = formData.specialties
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty]
    handleInputChange('specialties', newSpecialties)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      // Preparar datos para actualizar
      const updateData: UpdateProfileData = {
        fullName: formData.fullName.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
      }

      // Campos específicos para artistas
      if (isArtist) {
        updateData.studioName = formData.studioName.trim() || undefined
        updateData.studioAddress = formData.studioAddress.trim() || undefined
        updateData.pricePerHour = formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined
        updateData.experience = formData.experience ? parseInt(formData.experience, 10) : undefined
        updateData.specialties = formData.specialties.length > 0 ? formData.specialties : undefined
      }

      // Eliminar campos undefined para que no se envíen
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateProfileData] === undefined) {
          delete updateData[key as keyof UpdateProfileData]
        }
      })

      console.log('📤 Enviando datos de actualización:', updateData)

      // Actualizar perfil
      const updatedProfile = await profileService.updateProfile(updateData)
      
      console.log('✅ Perfil actualizado recibido:', updatedProfile)
      
      if (updateUser) {
        // Actualizar solo los campos compatibles con el tipo User
        const userType = updatedProfile.userType === 'admin' ? 'user' : (updatedProfile.userType as 'user' | 'artist' | undefined)
        updateUser({
          id: updatedProfile.id,
          username: updatedProfile.username,
          email: updatedProfile.email,
          avatar: updatedProfile.avatar,
          bio: updatedProfile.bio,
          fullName: updatedProfile.fullName,
          city: updatedProfile.city,
          userType: userType
        })
      }

      setCurrentProfile(updatedProfile)
      setSuccessMessage('Perfil actualizado exitosamente')
      
      // Marcar que el perfil ha sido actualizado para que la página de perfil recargue los datos
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('profileUpdated', 'true')
        // También disparar evento personalizado
        window.dispatchEvent(new Event('profileUpdated'))
      }
      
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Head>
        <title>Editar Perfil - Inkedin</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-neutral-800">
        <div className="flex items-center gap-4 px-4 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Editar Perfil</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensajes de error y éxito */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500">
              {successMessage}
            </div>
          )}

          {/* Información Básica */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Información Básica
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biografía
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+57 300 1234567"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ciudad
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Bogotá"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Departamento/Estado
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Cundinamarca"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Colombia"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Información de Artista */}
          {isArtist && (
            <div className="space-y-4 border-t border-neutral-800 pt-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Información de Artista
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Estudio
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={formData.studioName}
                      onChange={(e) => handleInputChange('studioName', e.target.value)}
                      placeholder="Mi Estudio de Tatuajes"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={255}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio por Hora (COP)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="number"
                      value={formData.pricePerHour}
                      onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                      placeholder="100000"
                      min="0"
                      step="1000"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección del Estudio
                </label>
                <textarea
                  value={formData.studioAddress}
                  onChange={(e) => handleInputChange('studioAddress', e.target.value)}
                  placeholder="Calle 123 #45-67, Local 2"
                  rows={2}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Años de Experiencia
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="5"
                    min="0"
                    max="100"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Especialidades
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES_OPTIONS.map((specialty) => {
                    const isSelected = formData.specialties.includes(specialty)
                    return (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => handleSpecialtyToggle(specialty)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                        }`}
                      >
                        {specialty}
                      </button>
                    )
                  })}
                </div>
                {formData.specialties.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.specialties.length} especialidad(es) seleccionada(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t border-neutral-800 sticky bottom-0 bg-black pb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-semibold hover:bg-neutral-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

