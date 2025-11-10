/**
 * Página de crear post
 * Ruta: /create
 *
 * Esta es la página pública que Next.js renderiza
 * Re-exporta el componente CreatePostPage del feature de posts
 */

import CreatePostPage from '@/features/posts/pages/CreatePostPage'

export default function Create() {
  return <CreatePostPage />
}
