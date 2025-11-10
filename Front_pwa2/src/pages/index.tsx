/**
 * Página de inicio
 * Ruta: /
 *
 * Esta es la página pública que Next.js renderiza
 * Re-exporta el componente HomePage del feature de posts
 */

import HomePage from '@/features/posts/pages/HomePage'

export default function Home() {
  return <HomePage />
}
