'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import BottomNavigation from '@/components/BottomNavigation'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    // Si terminó de cargar y no está autenticado, redirigir al login
    // Usar replace para evitar historial innecesario y prevenir condiciones de carrera
    if (!isLoading && !isAuthenticated) {
      // Usar setTimeout para evitar navegaciones durante el render
      const timeoutId = setTimeout(() => {
        if (router.pathname !== '/login') {
          router.replace('/login')
        }
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loader mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (está redirigiendo)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, mostrar la página de inicio con navegación
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Head>
        <title>Inkedin - Inicio</title>
      </Head>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Inkedin
            </h1>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2 text-white">
            ¡Bienvenido{user ? `, ${user.username}` : ''}!
          </h2>
          <p className="text-gray-400 mb-6">
            Plataforma moderna para compartir y descubrir arte de tatuajes
          </p>
          
          {/* Placeholder para el contenido de posts */}
          <div className="mt-8 text-gray-500">
            <p className="text-sm">El contenido aparecerá aquí</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/" />
    </div>
  )
}

