/**
 * Feature de Likes - Exportaciones principales
 * 
 * Este feature proporciona toda la funcionalidad relacionada con likes
 * de forma modular y reutilizable.
 */

// Servicios
export { likeService } from './services/likeService'

// Hooks
export { useLikePost } from './hooks/useLikePost'

// Componentes (movido a @/components/ui/buttons para reutilización)
// Re-exportar desde la nueva ubicación para mantener compatibilidad
export { LikeButton } from '@/components/ui/buttons'
export type { LikeButtonProps } from '@/components/ui/buttons'

// Tipos
export type { LikeInfo, ToggleLikeResponse } from './types'

