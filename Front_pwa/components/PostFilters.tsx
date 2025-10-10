import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Tag, X } from 'lucide-react'
import { usePostFilters, filterOptions } from '@/hooks/usePostFilters'

interface StyleFilterProps {
  selectedStyles: string[]
  onStyleToggle: (style: string) => void
  className?: string
}

export const StyleFilter = ({ selectedStyles, onStyleToggle, className = '' }: StyleFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-300">Estilos de tatuaje</label>
        {selectedStyles.length > 0 && (
          <span className="text-xs text-blue-400 font-medium">
            {selectedStyles.length} seleccionado{selectedStyles.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-[#0f1419] border border-gray-800 rounded-2xl hover:border-gray-700 transition-all group"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Seleccionar estilos</p>
            {selectedStyles.length > 0 ? (
              <p className="text-xs text-gray-400">
                {selectedStyles.slice(0, 2).join(', ')}
                {selectedStyles.length > 2 && ` +${selectedStyles.length - 2} más`}
              </p>
            ) : (
              <p className="text-xs text-gray-500">Toca para seleccionar</p>
            )}
          </div>
        </div>
        <ChevronRight 
          className={`w-5 h-5 text-gray-400 transition-transform group-hover:text-white ${
            isOpen ? 'rotate-90' : ''
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {/* Todos los estilos */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.tattooStyles.map((style) => (
                <motion.button
                  key={style}
                  onClick={() => onStyleToggle(style)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStyles.includes(style)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                  }`}
                >
                  {style}
                </motion.button>
              ))}
            </div>
            
            {/* Estilos populares */}
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Estilos populares:</p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.popularStyles.map((popularStyle) => (
                  <button
                    key={popularStyle}
                    onClick={() => onStyleToggle(popularStyle)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedStyles.includes(popularStyle)
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {popularStyle}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón para limpiar selección */}
            {selectedStyles.length > 0 && (
              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    selectedStyles.forEach(style => onStyleToggle(style))
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Limpiar selección
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface VisibilityFilterProps {
  visibility: 'public' | 'private' | 'all'
  onVisibilityChange: (visibility: 'public' | 'private' | 'all') => void
  className?: string
}

export const VisibilityFilter = ({ visibility, onVisibilityChange, className = '' }: VisibilityFilterProps) => {
  // Solo mostrar opciones públicas y privadas para creación de posts
  const isPublic = visibility === 'public' || visibility === 'all'
  const isPrivate = visibility === 'private'

  return (
    <div className={`pb-20 ${className}`}>
      <label className="block text-sm font-semibold text-gray-300 mb-4">
        Visibilidad
      </label>
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onVisibilityChange('public')}
          className={`p-6 rounded-3xl border-2 transition-all ${
            isPublic
              ? 'border-blue-600 bg-gradient-to-br from-blue-600/20 to-blue-800/20 shadow-lg shadow-blue-500/25'
              : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
          }`}
        >
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
              isPublic ? 'bg-blue-600' : 'bg-gray-800'
            }`}>
              <svg className={`w-6 h-6 ${
                isPublic ? 'text-white' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <p className={`text-sm font-semibold mb-1 ${
              isPublic ? 'text-white' : 'text-gray-400'
            }`}>
              Público
            </p>
            <p className={`text-xs ${
              isPublic ? 'text-blue-300' : 'text-gray-500'
            }`}>
              Visible para todos
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onVisibilityChange('private')}
          className={`p-6 rounded-3xl border-2 transition-all ${
            isPrivate
              ? 'border-purple-600 bg-gradient-to-br from-purple-600/20 to-purple-800/20 shadow-lg shadow-purple-500/25'
              : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
          }`}
        >
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
              isPrivate ? 'bg-purple-600' : 'bg-gray-800'
            }`}>
              <svg className={`w-6 h-6 ${
                isPrivate ? 'text-white' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p className={`text-sm font-semibold mb-1 ${
              isPrivate ? 'text-white' : 'text-gray-400'
            }`}>
              Privado
            </p>
            <p className={`text-xs ${
              isPrivate ? 'text-purple-300' : 'text-gray-500'
            }`}>
              Solo seguidores
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

interface ClientTagFilterProps {
  clientTag: string
  onClientTagChange: (tag: string) => void
  className?: string
}

export const ClientTagFilter = ({ clientTag, onClientTagChange, className = '' }: ClientTagFilterProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-300">Etiquetar cliente</label>
        <span className="text-xs text-gray-500">Opcional</span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <input
          type="text"
          value={clientTag}
          onChange={(e) => onClientTagChange(e.target.value)}
          placeholder="@usuario"
          className="w-full pl-14 sm:pl-16 pr-4 py-3 sm:py-4 bg-[#0f1419] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
        />
        {clientTag && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
}
