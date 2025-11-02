'use client'

import { useRouter } from 'next/router'
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface BottomNavigationProps {
  currentPath?: string
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const router = useRouter()
  const { user } = useAuth()

  const isActive = (path: string) => {
    return currentPath === path || router.pathname === path
  }

  const isArtist = user?.userType === 'artist' || 
                   (typeof user?.userType === 'string' && user?.userType.toLowerCase() === 'artist')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f26] border-t border-gray-800 z-50 safe-bottom bottom-nav-ios">
      <div className="flex items-center justify-around h-20 px-2">
        <button 
          onClick={() => router.push('/')}
          className={`nav-button flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
            isActive('/') ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className={`w-6 h-6 mb-1 ${isActive('/') ? 'fill-blue-500' : ''}`} />
          <span className="text-xs font-medium truncate">Inicio</span>
        </button>
        
        <button
          onClick={() => router.push('/search')}
          className={`nav-button flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
            isActive('/search') ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium truncate">Buscar</span>
        </button>
        
        {isArtist && (
          <button
            onClick={() => router.push('/create')}
            className={`nav-button flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
              isActive('/create') ? 'text-blue-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs font-medium truncate">Publicar</span>
          </button>
        )}
        
        <button
          onClick={() => router.push('/chat')}
          className={`nav-button flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors relative ${
            isActive('/chat') ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium truncate">Chat</span>
          <span className="absolute top-1 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>
        
        <button
          onClick={() => router.push('/profile')}
          className={`nav-button flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
            isActive('/profile') ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium truncate">Perfil</span>
        </button>
      </div>
    </nav>
  )
}

