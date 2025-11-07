/**
 * Página de detalle de post
 * Ruta: /postDetail?postId=xxx
 *
 * Esta es la página pública que Next.js renderiza
 * Re-exporta el componente PostDetailPage del feature de posts
 */

import PostDetailPage from '@/features/posts/pages/PostDetailPage'

export default function PostDetail() {
  return <PostDetailPage />
}
