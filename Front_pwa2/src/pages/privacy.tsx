/**
 * Página de Política de Privacidad
 * Ruta: /privacy
 *
 * Esta es la página pública que Next.js renderiza
 * Re-exporta el componente PrivacyPage del feature de legal
 */

import PrivacyPage from '@/features/legal/pages/PrivacyPage'

export default function Privacy() {
  return <PrivacyPage />
}
