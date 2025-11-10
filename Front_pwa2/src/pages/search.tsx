/**
 * Página de búsqueda de Next.js
 * 
 * Esta es la página pública que Next.js renderiza en la ruta /search
 * Re-exporta el componente SearchPage del feature de búsqueda
 */

import SearchPage from '@/features/search/pages/SearchPage'

export default function Search() {
  return <SearchPage />
}

