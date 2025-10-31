import { useState, useCallback } from 'react';
import { postService, Post } from '../services/postService';
import { useAlert } from '../components/Alert';

interface UseLikePostReturn {
  isLiked: boolean;
  likesCount: number;
  isToggling: boolean;
  toggleLike: (postId: string) => Promise<void>;
  updateLocalState: (postId: string, isLiked: boolean, likesCount: number) => void;
}

/**
 * Hook para manejar la funcionalidad de likes en posts
 * 
 * Este hook centraliza toda la lógica de likes con actualización optimista,
 * eliminando código duplicado entre componentes.
 * 
 * @param initialPostId - ID del post inicial (opcional)
 * @param initialIsLiked - Estado inicial de like (opcional)
 * @param initialLikesCount - Contador inicial de likes (opcional)
 * @returns Objeto con estado y funciones para manejar likes
 */
export function useLikePost(
  initialPostId?: string,
  initialIsLiked = false,
  initialLikesCount = 0
): UseLikePostReturn {
  const { error: showAlert } = useAlert();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isToggling, setIsToggling] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(initialPostId);

  /**
   * Actualiza el estado local del like (útil cuando el post viene del servidor)
   */
  const updateLocalState = useCallback((postId: string, liked: boolean, count: number) => {
    if (!currentPostId || currentPostId === postId) {
      setIsLiked(liked);
      setLikesCount(count);
      setCurrentPostId(postId);
    }
  }, [currentPostId]);

  /**
   * Toggle para dar/quitar like a un post con actualización optimista
   */
  const toggleLike = useCallback(async (postId: string) => {
    if (isToggling) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsToggling(true);
    setCurrentPostId(postId);

    // Guardar estado previo para poder revertir en caso de error
    const previousIsLiked = currentPostId === postId ? isLiked : false;
    const previousLikesCount = currentPostId === postId ? likesCount : 0;

    // Actualización optimista - actualizar UI inmediatamente
    const newIsLiked = !previousIsLiked;
    const newLikesCount = newIsLiked 
      ? previousLikesCount + 1 
      : Math.max(0, previousLikesCount - 1);

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      // Hacer la petición al backend (toggle)
      const response = await postService.toggleLike(postId);

      // Actualizar con la respuesta real del servidor
      if (response.success && response.data) {
        const { isLiked: serverIsLiked, likesCount: serverLikesCount } = response.data;
        setIsLiked(serverIsLiked);
        setLikesCount(serverLikesCount);
      } else {
        // Si la respuesta no tiene los datos esperados, mantener estado optimista
        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);
      }
    } catch (err) {
      // Revertir cambios en caso de error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);

      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'No se pudo actualizar el like';
      showAlert('Error', errorMessage);
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, currentPostId, isLiked, likesCount, showAlert]);

  return {
    isLiked,
    likesCount,
    isToggling,
    toggleLike,
    updateLocalState
  };
}

export default useLikePost;

