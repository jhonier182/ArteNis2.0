'use client'

import { useEffect, useLayoutEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  User, 
  Award,
  Star,
  Grid,
  Bookmark,
  ChevronLeft,
  MoreVertical,
  Camera,
  Share2,
  Gift,
  Zap
} from 'lucide-react'
import { AxiosError } from 'axios'
import { useAuth } from '@/context/AuthContext'
import SettingsModal from '../components/SettingsModal'
import { useUserPosts } from '../hooks/useUserPosts'
import { useSavedPosts } from '../hooks/useSavedPosts'
import { InfiniteScrollTrigger } from '../components/LoadingIndicator'
import { BottomNavigation } from '@/components/ui/buttons'
import { logger } from '@/utils/logger'
import { CHECK_NEW_POST_DELAY_MS } from '@/utils/constants'
import { validateImageFile } from '@/utils/fileValidators'
import { useToastContext } from '@/context/ToastContext'
import { saveScrollPosition, getScrollPosition } from '@/utils/profilePostsCache'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToastContext()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks para obtener datos
  const {
    posts: userPosts,
    loading: loadingPosts,
    hasMore,
    error: postsError,
    loadMore,
    reset: resetPosts,
  } = useUserPosts(user?.id)

  const {
    posts: savedPosts,
    loading: loadingSavedPosts,
  } = useSavedPosts()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Escuchar eventos de nueva publicación y refrescar automáticamente
  useEffect(() => {
    const isArtist = user?.userType === 'artist' || 
                     (typeof user?.userType === 'string' && user?.userType.toLowerCase() === 'artist')
    if (isArtist) {
      const handleNewPost = () => {
        // Pequeño delay para asegurar que el backend haya procesado el post
        setTimeout(() => {
          resetPosts()
        }, 500)
      }

      // Escuchar eventos personalizados de nueva publicación
      window.addEventListener('newPostCreated', handleNewPost)
      
      // También escuchar cambios en el localStorage (backup)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'newPostCreated' && e.newValue) {
          handleNewPost()
          // Limpiar el flag
          localStorage.removeItem('newPostCreated')
        }
      }
      
      window.addEventListener('storage', handleStorageChange)

      // Verificar si hay un post recién creado al cargar la página
      const checkForNewPost = () => {
        const newPostTimestamp = localStorage.getItem('newPostCreated')
        if (newPostTimestamp) {
          const timestamp = parseInt(newPostTimestamp)
          const now = Date.now()
          // Si el post se creó en los últimos 30 segundos, refrescar
          if (now - timestamp < 30000) {
            handleNewPost()
            localStorage.removeItem('newPostCreated')
          }
        }
      }
      
      // Verificar después de un pequeño delay para asegurar que el componente esté montado
      const checkTimer = setTimeout(checkForNewPost, CHECK_NEW_POST_DELAY_MS)

      return () => {
        window.removeEventListener('newPostCreated', handleNewPost)
        window.removeEventListener('storage', handleStorageChange)
        clearTimeout(checkTimer)
      }
    }
  }, [user?.userType, resetPosts])

  // Recargar perfil completo desde el servidor cuando se regresa de editar perfil
  useEffect(() => {
    const loadProfileFromServer = async () => {
      if (!user?.id) return
      
      try {
        const { profileService } = await import('../services/profileService')
        const updatedProfile = await profileService.getCurrentProfile()
        
        // Actualizar el contexto con todos los datos del perfil actualizado
        if (updateUser) {
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
      } catch (error) {
        logger.error('Error al recargar perfil', error)
      }
    }

    // Escuchar cuando se regresa de editar perfil
    const handleProfileUpdated = () => {
      loadProfileFromServer()
    }

    // Escuchar evento personalizado
    window.addEventListener('profileUpdated', handleProfileUpdated)
    
    // También verificar si venimos de la página de editar
    const checkRoute = () => {
      if (typeof window !== 'undefined') {
        const profileUpdated = sessionStorage.getItem('profileUpdated')
        if (profileUpdated === 'true') {
          loadProfileFromServer()
          sessionStorage.removeItem('profileUpdated')
        }
      }
    }

    // Verificar al montar el componente
    checkRoute()

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated)
    }
  }, [user?.id, updateUser, router.asPath])

  // NOTA: Eliminado useEffect que reseteaba posts al cambiar ruta
  // Esto causaba re-renders innecesarios al volver del detalle de post
  // El caché ahora maneja la persistencia de posts entre navegaciones

  // Ref para trackear la ruta anterior y si ya restauramos el scroll
  const previousPathRef = useRef<string | null>(null)
  const scrollRestoredRef = useRef<boolean>(false)
  const targetScrollRef = useRef<number | null>(null)
  const isInitialMountRef = useRef<boolean>(true)
  
  // Función para verificar si es la primera carga (usando sessionStorage para persistir)
  const getIsFirstLoad = useCallback((userId: string) => {
    if (typeof window === 'undefined') return true
    const key = `profile_first_load_${userId}`
    const stored = sessionStorage.getItem(key)
    return stored === null
  }, [])
  
  // Función para marcar que ya no es la primera carga
  const markNotFirstLoad = useCallback((userId: string) => {
    if (typeof window === 'undefined') return
    const key = `profile_first_load_${userId}`
    sessionStorage.setItem(key, 'false')
  }, [])

  // Guardar posición de scroll antes de navegar
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Guardar scroll cuando salimos del perfil (cualquier ruta que no sea /profile)
      if (user?.id && typeof window !== 'undefined' && router.asPath === '/profile' && !url.includes('/profile')) {
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        if (currentScroll > 0) {
          logger.debug(`[ProfilePage] Guardando scroll: ${currentScroll}px antes de navegar a ${url}`)
          saveScrollPosition(user.id, currentScroll)
          // Guardar la ruta a la que vamos para detectar el retorno
          previousPathRef.current = url
        }
      }
      // Resetear flag cuando salimos
      scrollRestoredRef.current = false
    }

    const handleRouteChangeComplete = () => {
      // Marcar que no es el montaje inicial después de la primera navegación
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false
      }
    }

    router.events?.on('routeChangeStart', handleRouteChangeStart)
    router.events?.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events?.off('routeChangeStart', handleRouteChangeStart)
      router.events?.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router, user?.id])

  // Restaurar posición de scroll al volver al perfil
  // Usamos useLayoutEffect para ejecutar antes del paint
  useLayoutEffect(() => {
    // Verificar si estamos en /profile (con o sin query params)
    const isOnProfile = router.asPath.startsWith('/profile') && !router.asPath.includes('/profile/')
    
    if (!user?.id || !isAuthenticated || !isOnProfile) {
      if (!isOnProfile) {
        scrollRestoredRef.current = false
        targetScrollRef.current = null
      }
      return
    }

    // Verificar si hay scroll guardado
    const savedScroll = getScrollPosition(user.id)
    
    // Determinar si estamos volviendo de otra ruta
    const currentPath = router.pathname || router.asPath.split('?')[0]
    const previousPath = previousPathRef.current?.split('?')[0] || null
    const wasOnProfile = previousPath === '/profile'
    const isReturningToProfile = previousPath !== null && 
                                  previousPath !== '/profile' && 
                                  currentPath === '/profile'
    
    // Logs de debug
    logger.debug(`[ProfilePage] useLayoutEffect - currentPath: ${currentPath}, previousPath: ${previousPath}, savedScroll: ${savedScroll}, isInitialMount: ${isInitialMountRef.current}, scrollRestored: ${scrollRestoredRef.current}`)
    
    // Verificar si es la primera carga usando sessionStorage
    const isFirstLoad = user?.id ? getIsFirstLoad(user.id) : true
    
    // Marcar que ya no es el montaje inicial después de la primera carga completa
    if (isFirstLoad && userPosts.length > 0 && user?.id) {
      logger.debug(`[ProfilePage] Marcando que ya no es primera carga (userPosts.length: ${userPosts.length})`)
      markNotFirstLoad(user.id)
      isInitialMountRef.current = false
    } else if (!isFirstLoad) {
      isInitialMountRef.current = false
    }
    
    // Restaurar si:
    // 1. Hay scroll guardado
    // 2. Posts ya están cargados (para evitar restaurar antes de que el contenido esté listo)
    // 3. Aún no se ha restaurado
    // 4. No es la primera carga (verificado con sessionStorage)
    const hasValidPreviousPath = previousPath !== null && previousPath !== '/profile'
    const isNotFirstLoad = !isFirstLoad || hasValidPreviousPath
    
    const shouldRestore = savedScroll !== null && 
                          savedScroll > 0 && 
                          !scrollRestoredRef.current &&
                          userPosts.length > 0 &&
                          isNotFirstLoad
    
    logger.debug(`[ProfilePage] shouldRestore: ${shouldRestore} (savedScroll: ${savedScroll}, hasValidPreviousPath: ${hasValidPreviousPath}, isNotFirstLoad: ${isNotFirstLoad}, isInitialMount: ${isInitialMountRef.current}, userPosts.length: ${userPosts.length}, previousPath: ${previousPath})`)
    
    if (shouldRestore && typeof window !== 'undefined') {
      logger.debug(`[ProfilePage] Restaurando scroll a: ${savedScroll}px`)
      targetScrollRef.current = savedScroll
      scrollRestoredRef.current = true

      // Función para verificar que el contenido esté renderizado
      const isContentReady = () => {
        // Verificar que haya posts en el estado
        if (userPosts.length === 0) return false
        
        // Verificar que el DOM tenga contenido (al menos un post renderizado)
        const postElements = document.querySelectorAll('[data-post-item]')
        return postElements.length > 0 || document.body.scrollHeight > window.innerHeight
      }

      // Función para restaurar scroll de forma agresiva
      const restoreScroll = () => {
        if (targetScrollRef.current === null) return
        
        // Si el contenido no está listo, esperar un poco más
        if (!isContentReady()) {
          return
        }
        
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        const target = targetScrollRef.current
        
        // Si no estamos en la posición correcta, forzar restauración
        if (Math.abs(currentScroll - target) > 10) {
          // Múltiples métodos para asegurar que funcione
          window.scrollTo({ top: target, behavior: 'auto' })
          document.documentElement.scrollTop = target
          if (document.body) {
            document.body.scrollTop = target
          }
          logger.debug(`[ProfilePage] Scroll restaurado a ${target}px (actual: ${currentScroll}px)`)
        } else {
          // Si ya estamos en la posición correcta, limpiar después de un momento
          logger.debug(`[ProfilePage] Scroll ya está en la posición correcta (${currentScroll}px)`)
          setTimeout(() => {
            targetScrollRef.current = null
          }, 500)
        }
      }

      // Restaurar inmediatamente (useLayoutEffect se ejecuta antes del paint)
      restoreScroll()
      
      const timeouts: NodeJS.Timeout[] = []
      const rafIds: number[] = []
      
      // Intentos múltiples en diferentes momentos (más agresivo)
      // Empezar después de un pequeño delay para dar tiempo al render
      for (let i = 1; i <= 50; i++) {
        timeouts.push(setTimeout(restoreScroll, i * 10)) // Cada 10ms hasta 500ms
      }
      
      // También con requestAnimationFrame (múltiples frames)
      for (let i = 0; i < 15; i++) {
        const rafId = requestAnimationFrame(() => {
          restoreScroll()
          requestAnimationFrame(() => {
            restoreScroll()
            requestAnimationFrame(restoreScroll)
          })
        })
        rafIds.push(rafId)
      }

      // Listener para prevenir que se resetee el scroll (más agresivo)
      let lastScrollTime = Date.now()
      const preventScrollReset = () => {
        if (targetScrollRef.current === null) return
        
        const now = Date.now()
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        const target = targetScrollRef.current
        
        // Si el scroll está cerca de 0 pero debería estar más abajo, restaurarlo
        if (currentScroll < 100 && target > 100 && (now - lastScrollTime) > 50) {
          logger.debug(`[ProfilePage] Preveniendo reset de scroll: ${currentScroll}px -> ${target}px`)
          restoreScroll()
          lastScrollTime = now
        }
      }

      window.addEventListener('scroll', preventScrollReset, { passive: true })
      
      // Limpiar después de un tiempo más largo
      const cleanupTimeout = setTimeout(() => {
        targetScrollRef.current = null
        window.removeEventListener('scroll', preventScrollReset)
      }, 3000)

      return () => {
        timeouts.forEach(clearTimeout)
        rafIds.forEach(cancelAnimationFrame)
        clearTimeout(cleanupTimeout)
        window.removeEventListener('scroll', preventScrollReset)
      }
    }

    // Actualizar la ruta anterior solo si realmente cambió (no sobrescribir si ya está guardada)
    // Solo actualizar si estamos en /profile y no hay un previousPath válido guardado
    if (currentPath === '/profile' && (previousPathRef.current === null || previousPathRef.current === '/profile')) {
      // No actualizar aquí, se actualizará cuando naveguemos a otra ruta
    }
  }, [user?.id, isAuthenticated, router.asPath, router.pathname, userPosts.length])

  // Guardar scroll periódicamente mientras el usuario está en la página
  useEffect(() => {
    if (!user?.id) return

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        saveScrollPosition(user.id, window.scrollY)
      }
    }

    // Throttle para no guardar en cada pixel de scroll
    let scrollTimeout: NodeJS.Timeout | null = null
    const throttledScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        handleScroll()
        scrollTimeout = null
      }, 500) // Guardar cada 500ms
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [user?.id])

  // Función para manejar click en post (guardar scroll antes de navegar)
  const handlePostClick = useCallback((postId: string) => {
    // Guardar scroll antes de navegar
    if (user?.id && typeof window !== 'undefined') {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      if (currentScroll > 0) {
        logger.debug(`[ProfilePage] Guardando scroll antes de click en post: ${currentScroll}px`)
        saveScrollPosition(user.id, currentScroll)
        // Guardar la ruta a la que vamos para detectar el retorno
        previousPathRef.current = `/postDetail?postId=${postId}`
        logger.debug(`[ProfilePage] previousPathRef actualizado a: ${previousPathRef.current}`)
      }
    }
    // Navegar al post
    router.push(`/postDetail?postId=${postId}`)
  }, [user?.id, router])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    // Validar archivo usando el validador centralizado
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Error al validar el archivo')
      return
    }

    await handleAvatarUpload(file!)
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const { profileService } = await import('../services/profileService')
      const result = await profileService.uploadAvatar(file)
      if (user) {
        updateUser({ avatar: result.avatarUrl })
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      alert(axiosError.response?.data?.message || 'Error al subir la imagen')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }



  const handleUserTypeChange = (newType: 'user' | 'artist') => {
    if (user) {
      updateUser({ userType: newType })
    }
  }
  // Optimizado: solo depende de userType, no del objeto completo user
  // Esto evita recálculos innecesarios cuando otros campos de user cambian
  const isArtist = useMemo(() => {
    if (!user?.userType) return false
    const userType = user.userType
    return userType === 'artist' || 
           (typeof userType === 'string' && userType.toLowerCase() === 'artist')
  }, [user?.userType])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const stats = {
    followers: 1200,
    rating: 4.5,
    completedAppointments: 150,
    responseRate: 98
  }

  const userRewards = {
    points: 1250,
    level: 'Gold',
    nextReward: 1500,
    badges: [
      { id: 1, name: 'Compartió 10 veces', icon: Share2, earned: true },
      { id: 2, name: 'Super Fan', icon: Star, earned: true },
      { id: 3, name: 'Embajador', icon: Award, earned: false },
    ]
  }

  const badges = [
    { icon: Award, label: 'Explorador de estilos', color: 'bg-yellow-500' },
    { icon: Star, label: 'Comentarista estrella', color: 'bg-blue-500' },
  ]

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Head>
        <title>Perfil - Inkedin</title>
      </Head>

      <header className="sticky top-0 z-50 bg-transparent pointer-events-none">
        <div className="px-4 pt-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg"
              aria-label="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold pointer-events-none opacity-0">Perfil</h1>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors pointer-events-auto shadow-lg"
              aria-label="Opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 pt-6 max-w-md mx-auto">
        {isArtist ? (
          <div className="mb-6">
            <div className="flex items-start gap-4">
              <div className="relative group flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1 hover:from-orange-500 hover:to-orange-700 transition-all"
                >
                  <div className="w-full h-full rounded-full bg-black p-1">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={200}
                        height={200}
                        className="w-full h-full rounded-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                  <Camera className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1 truncate">
                      {user?.fullName || user?.username || 'Usuario'}
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                      Tatuador/a
                    </p>
                  </div>
                  <div className="text-center ml-3 flex items-center gap-2">
                    <div>
                      <div className="text-lg font-bold">
                        {stats.followers < 1000 ? stats.followers : `${(stats.followers / 1000).toFixed(1)}K`}
                      </div>
                      <div className="text-[10px] text-gray-500">Seguidores</div>
                    </div>
                    <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                      <Share2 className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(stats.rating)
                            ? 'fill-yellow-500 text-yellow-500'
                            : i < stats.rating
                            ? 'fill-yellow-500/50 text-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {stats.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1 hover:from-orange-500 hover:to-orange-700 transition-all"
                >
                  <div className="w-full h-full rounded-full bg-black p-1">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={200}
                        height={200}
                        className="w-full h-full rounded-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">
                {user.fullName || user.username}
              </h2>
              <p className="text-gray-400">
                Usuario
              </p>
            </div>
          </>
        )}

        {isArtist && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900 rounded-xl py-3 px-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-blue-400">{stats.completedAppointments}+</div>
                  <div className="text-xs text-gray-400 truncate">Citas completadas</div>
                </div>
              </div>
              
              <div className="bg-neutral-900 rounded-xl py-3 px-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-green-400">{stats.responseRate}%</div>
                  <div className="text-xs text-gray-400 truncate">Tasa de respuesta</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isArtist && (
          <>
            <div className="mb-8">
              <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-pink-600/20 rounded-2xl p-5 border border-yellow-600/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Recompensas por Compartir</h3>
                      <p className="text-xs text-gray-400">Nivel {userRewards.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{userRewards.points}</div>
                    <p className="text-xs text-gray-400">puntos</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Progreso al siguiente nivel</span>
                    <span>{userRewards.points}/{userRewards.nextReward}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(userRewards.points / userRewards.nextReward) * 100}%` }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {userRewards.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        badge.earned
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      <badge.icon
                        className={`w-5 h-5 ${
                          badge.earned ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      />
                      <p className={`text-[10px] text-center leading-tight ${
                        badge.earned ? 'text-yellow-400' : 'text-gray-500'
                      }`}>
                        {badge.name}
                      </p>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Ganar más puntos
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Insignias y Logros</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 text-center"
                  >
                    <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center mb-2`}>
                      <badge.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-gray-400 max-w-[80px] leading-tight">
                      {badge.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {isArtist ? 'Portafolio' : 'Publicaciones Guardadas'}
            </h3>
          </div>
          
          {isArtist ? (
            loadingPosts ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {userPosts.map((post, index) => (
                    <div
                      key={post.id}
                      data-post-item
                      onClick={() => handlePostClick(post.id)}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 cursor-pointer"
                    >
                      {post.mediaUrl && (
                        <>
                          {post.type === 'video' ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={post.thumbnailUrl || post.mediaUrl}
                                alt={post.description || 'Post'}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay con icono de play para videos */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={post.mediaUrl}
                              alt={post.description || 'Post'}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover"
                              priority={index < 4}
                              loading={index < 4 ? 'eager' : 'lazy'}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                <InfiniteScrollTrigger
                  loading={loadingPosts}
                  hasMore={hasMore}
                  error={postsError?.message || null}
                  onRetry={loadMore}
                />
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tienes publicaciones aún</h3>
                <p className="text-gray-400 mb-4">Comparte tu trabajo con la comunidad</p>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Crear publicación
                </button>
              </div>
            )
          ) : (
            loadingSavedPosts ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : savedPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {savedPosts.slice(0, 6).map((post, index) => (
                  <div
                    key={post.id}
                    data-post-item
                    onClick={() => handlePostClick(post.id)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 cursor-pointer"
                  >
                    {post.mediaUrl && (
                      <>
                        {post.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={post.thumbnailUrl || post.mediaUrl}
                              alt={post.description || 'Post'}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay con icono de play para videos */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={post.mediaUrl}
                            alt={post.description || 'Post'}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </>
                    )}
                    <div className="absolute top-2 right-2">
                      <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tienes publicaciones guardadas</h3>
                <p className="text-gray-400 mb-4">Guarda publicaciones que te gusten para verlas aquí</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Explorar publicaciones
                </button>
              </div>
            )
          )}
        </div>
      </div>


      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLogout={handleLogout}
        userName={user.username}
        userEmail={user.email}
        userType={user.userType as 'user' | 'artist'}
        onUserTypeChange={handleUserTypeChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploadingAvatar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-black p-6 rounded-2xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            <span className="text-white font-medium">Subiendo foto...</span>
          </div>
        </div>
      )}

      <BottomNavigation currentPath="/profile" />
    </div>
  )
}

