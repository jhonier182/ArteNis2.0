import { useState, useEffect, useCallback, useRef } from 'react'
import { profileService, Profile } from '../services/profileService'

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

  const fetchProfile = useCallback(async () => {
    if (!userId || !enabled || fetchingRef.current) {
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)
      const result = await profileService.getProfile(userId)
      setProfile(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar perfil')
      setError(error)
      setProfile(null)
      console.error('Error cargando perfil público:', err)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [userId, enabled])

  useEffect(() => {
    if (userId && enabled) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [userId, enabled, fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  }
}

