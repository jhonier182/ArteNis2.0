/**
 * Página de perfil público de usuario
 * Ruta: /userProfile?userId=xxx
 * 
 * Esta es la página pública que Next.js renderiza
 * Re-exporta el componente PublicUserProfilePage del feature de profile
 */

import { useRouter } from 'next/router'
import PublicUserProfilePage from '@/features/profile/pages/PublicUserProfilePage'

export default function UserProfile() {
  const router = useRouter()
  const { userId } = router.query

  // Si no hay userId, mostrar error o redirigir
  if (!userId || typeof userId !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Usuario no encontrado</h2>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 mt-4"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return <PublicUserProfilePage userId={userId} />
}

