import { useState, useEffect, useCallback, useRef } from 'react'
import { profileService, Profile } from '../services/profileService'
import { cacheUserProfile, getCachedUserProfile } from '@/utils/profilePostsCache'

interface UsePublicUserProfileResult {
  profile: Profile | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener el perfil público de un usuario por ID
 * 
 * @param userId ID del usuario
 * @param options Opciones adicionales
 * 
 * @example
 * ```tsx
 * const { profile, loading, error } = usePublicUserProfile(userId)
 * ```
 */
export function usePublicUserProfile(
  userId: string | undefined,
  options: { enabled?: boolean } = {}
): UsePublicUserProfileResult {
  const { enabled = true } = options
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchingRef = useRef(false)
  const lastUserIdRef = useRef<string | undefined>(undefined)
  const profileRef = useRef<Profile | null>(null)
  const mountedRef = useRef(true)

  const fetchProfile = useCallback(async () => {
    if (!userId || !enabled) {
      return
    }

    // Protección robusta contra llamadas duplicadas:
    // 1. Si ya estamos cargando (fetchingRef.current = true), salir
    // 2. Si ya tenemos el perfil para este userId, salir
    if (fetchingRef.current) {
      console.log('[usePublicUserProfile] Ya hay una petición en curso, ignorando...')
      return
    }
    
    if (lastUserIdRef.current === userId && profileRef.current !== null) {
      console.log('[usePublicUserProfile] Perfil ya cargado para este userId, ignorando...')
      return
    }

    // Intentar cargar desde caché primero
    const cachedProfile = getCachedUserProfile(userId)
    if (cachedProfile) {
      console.log('[usePublicUserProfile] Perfil encontrado en caché para userId:', userId)
      if (mountedRef.current) {
        setProfile(cachedProfile)
        profileRef.current = cachedProfile
        setLoading(false)
        setError(null)
      }
      return
    }

    try {
      // Marcar inmediatamente que estamos cargando para evitar llamadas concurrentes
      fetchingRef.current = true
      lastUserIdRef.current = userId
      setLoading(true)
      setError(null)
      
      console.log('[usePublicUserProfile] Iniciando carga del perfil para userId:', userId)
      const result = await profileService.getProfile(userId)
      
      // Guardar en caché
      cacheUserProfile(userId, result)
      
      // Solo actualizar si el componente sigue montado y el userId no cambió
      if (mountedRef.current && lastUserIdRef.current === userId) {
        setProfile(result)
        profileRef.current = result
        console.log('[usePublicUserProfile] Perfil cargado exitosamente')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar perfil')
      if (mountedRef.current && lastUserIdRef.current === userId) {
        setError(error)
        setProfile(null)
        profileRef.current = null
      }
      // Solo resetear si el error es para el userId actual
      if (lastUserIdRef.current === userId) {
        lastUserIdRef.current = undefined
      }
      console.error('[usePublicUserProfile] Error cargando perfil público:', err)
    } finally {
      // Siempre resetear el flag de fetching
      fetchingRef.current = false
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [userId, enabled])

  useEffect(() => {
    mountedRef.current = true
    
    // Si el userId cambia, resetear el estado
    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = undefined
      profileRef.current = null
      setProfile(null)
      setError(null)
      fetchingRef.current = false
    }

    // Solo hacer fetch si:
    // 1. Tenemos userId y está habilitado
    // 2. No estamos ya cargando
    // 3. No tenemos ya el perfil cargado para este userId
    if (userId && enabled && !fetchingRef.current && !(lastUserIdRef.current === userId && profileRef.current !== null)) {
      fetchProfile()
    } else if (!userId || !enabled) {
      setProfile(null)
      profileRef.current = null
      setLoading(false)
      lastUserIdRef.current = undefined
      fetchingRef.current = false
    }

    // Cleanup: marcar como desmontado y cancelar cualquier fetch en curso
    return () => {
      mountedRef.current = false
      fetchingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, enabled])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  }
}

