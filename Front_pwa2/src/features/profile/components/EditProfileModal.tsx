import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Camera, Upload, Trash2, Save, User, MessageSquare, Phone, MapPin, Building2, DollarSign, Briefcase, Sparkles } from 'lucide-react'
import { AxiosError } from 'axios'
import { profileService, type Profile, type UpdateProfileData } from '../services/profileService'
import { useAuth } from '@/context/AuthContext'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: Profile | null
  onProfileUpdated: () => void
}

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

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentProfile,
  onProfileUpdated
}: EditProfileModalProps) {
  const { updateUser } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  // Cargar datos del perfil cuando se abre el modal
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        fullName: currentProfile.fullName || '',
        bio: currentProfile.bio || '',
        phone: (currentProfile as Profile & { phone?: string }).phone || '',
        city: currentProfile.city || '',
        state: (currentProfile as Profile & { state?: string }).state || '',
        country: (currentProfile as Profile & { country?: string }).country || '',
        studioName: (currentProfile as Profile & { studioName?: string }).studioName || '',
        studioAddress: (currentProfile as Profile & { studioAddress?: string }).studioAddress || '',
        pricePerHour: (currentProfile as Profile & { pricePerHour?: number }).pricePerHour?.toString() || '',
        experience: (currentProfile as Profile & { experience?: number }).experience?.toString() || '',
        specialties: Array.isArray((currentProfile as Profile & { specialties?: string[] }).specialties) 
          ? (currentProfile as Profile & { specialties?: string[] }).specialties || []
          : []
      })
      setSelectedImage(null)
      setSelectedFile(null)
      setError('')
      setSuccessMessage('')
    }
  }, [isOpen, currentProfile])

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
    setSuccessMessage('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB')
      return
    }

    setError('')
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    try {
      const result = await profileService.uploadAvatar(selectedFile)
      if (updateUser) {
        updateUser({ avatar: result.avatarUrl })
      }
      setSelectedImage(null)
      setSelectedFile(null)
      setSuccessMessage('Avatar actualizado exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      onProfileUpdated()
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
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

      // Subir avatar si hay uno seleccionado
      if (selectedFile) {
        await handleAvatarUpload()
      }

      // Actualizar perfil
      const updatedProfile = await profileService.updateProfile(updateData)
      
      if (updateUser) {
        updateUser({ ...updatedProfile, userType: updatedProfile.userType as 'user' | 'artist' | undefined })
      }

      setSuccessMessage('Perfil actualizado exitosamente')
      setTimeout(() => {
        onClose()
        onProfileUpdated()
      }, 1500)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploading(true)
    setError('')

    try {
      await profileService.updateProfile({ userType: 'user' as 'user' | 'artist' | 'admin' })
      if (updateUser) {
        updateUser({ userType: 'user' as 'user' | 'artist' })
      }
      setSuccessMessage('Avatar eliminado exitosamente')
      setTimeout(() => {
        onClose()
        onProfileUpdated()
      }, 1500)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Error al eliminar avatar')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
      />

      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-h-[90vh] overflow-hidden max-w-2xl mx-auto">
        <div className="bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] pb-4">
            <div className="p-6 space-y-6">
              {/* Mensajes de error y éxito */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
                  {successMessage}
                </div>
              )}

              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
                    <div className="w-full h-full rounded-full bg-black p-1">
                      {selectedImage || currentProfile?.avatar ? (
                        <Image
                          src={selectedImage || currentProfile?.avatar || ''}
                          alt="Avatar"
                          width={200}
                          height={200}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null)
                        setSelectedFile(null)
                      }}
                      className="absolute top-0 right-0 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                </div>
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Información Básica
                </h3>

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
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Información de Artista
                  </h3>

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
              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-xl font-semibold hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving || isUploading ? (
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
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
