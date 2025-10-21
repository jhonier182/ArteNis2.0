import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Camera, Upload, Trash2, Check } from 'lucide-react'
import apiClient from '../services/apiClient'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar?: string
  onAvatarUpdated: (newAvatarUrl: string) => void
  userId: string
}

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentAvatar,
  onAvatarUpdated,
  userId 
}: EditProfileModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB')
      return
    }

    setError('')
    setSelectedFile(file)

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Cargar automáticamente la imagen
    setTimeout(() => {
      handleUpload()
    }, 100)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await apiClient.post('/api/profile/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const newAvatarUrl = response.data?.data?.avatarUrl || response.data?.data?.user?.avatar
      
      if (newAvatarUrl) {
        onAvatarUpdated(newAvatarUrl)
        setSelectedImage(null)
        setSelectedFile(null)
        onClose()
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploading(true)
    setError('')

    try {
      await apiClient.put('/api/profile/me', { avatar: null })
      onAvatarUpdated('')
      onClose()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const resetSelection = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50"
          >
            <div className="bg-[#1a1f26] rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Cambiar foto de perfil</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Current/Preview Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
                      <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
                        {selectedImage || currentAvatar ? (
                          <Image
                            src={selectedImage || currentAvatar || ''}
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
                        onClick={resetSelection}
                        className="absolute top-0 right-0 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {/* File Input (Hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isUploading ? (
                    // Uploading State
                    <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Subiendo foto...
                    </div>
                  ) : (
                    <>
                      {/* Select Photo Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Seleccionar nueva foto
                      </button>

                      {/* Remove Avatar Button */}
                      {currentAvatar && (
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={isUploading}
                          className="w-full bg-gray-800 text-red-500 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          Eliminar foto actual
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Info */}
                <p className="mt-4 text-center text-sm text-gray-400">
                  Formatos: JPG, PNG, GIF • Máx: 5MB
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
