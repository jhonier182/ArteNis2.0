import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Trash2, Edit, Share2 } from 'lucide-react'

interface PostMenuProps {
  isOwner: boolean
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  isDeleting?: boolean
  className?: string
}

export default function PostMenu({ 
  isOwner, 
  onEdit, 
  onDelete, 
  onShare, 
  isDeleting = false,
  className = ''
}: PostMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.menu-container')) {
          setShowMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleEdit = () => {
    setShowMenu(false)
    onEdit?.()
  }

  const handleDelete = () => {
    setShowMenu(false)
    onDelete?.()
  }

  const handleShare = () => {
    setShowMenu(false)
    onShare?.()
  }

  return (
    <div className={`relative menu-container ${className}`}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
      >
        <MoreVertical className="w-6 h-6" />
      </button>
      
      {/* Menú desplegable */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
        >
          {isOwner && (
            <>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-3"
                >
                  <Edit className="w-4 h-4" />
                  Editar publicación
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? 'Eliminando...' : 'Eliminar publicación'}
                </button>
              )}
              {(onEdit || onDelete) && (
                <div className="border-t border-gray-700 my-1"></div>
              )}
            </>
          )}
          {onShare && (
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-3"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
