import { useAuth as useAuthContext } from '@/context/AuthContext'

/**
 * Hook para acceder al contexto de autenticación
 * Re-exporta useAuth del contexto para mantener consistencia en features
 */
export const useAuth = useAuthContext

