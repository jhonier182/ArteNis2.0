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

// Componentes
export { LikeButton } from './components/LikeButton'
export type { LikeButtonProps } from './components/LikeButton'

// Tipos
export type { LikeInfo, ToggleLikeResponse } from './types'

