import { useState, useEffect } from 'react'
import { profileService, Profile } from '../services/profileService'

interface UseProfileResult {
  profile: Profile | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener el perfil del usuario actual
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await profileService.getCurrentProfile()
      setProfile(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar perfil'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}

