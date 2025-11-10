/**
 * Página de Términos y Condiciones
 * Ruta: /terms
 *
 * Esta es la página pública que Next.js renderiza
 * Re-exporta el componente TermsPage del feature de legal
 */

import TermsPage from '@/features/legal/pages/TermsPage'

export default function Terms() {
  return <TermsPage />
}
