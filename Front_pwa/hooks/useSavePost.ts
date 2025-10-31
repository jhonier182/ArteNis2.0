import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { boardService } from '../services/boardService';
import { useAlert } from '../components/Alert';

interface UseSavePostReturn {
  isSaved: boolean;
  isSaving: boolean;
  toggleSave: (postId: string) => Promise<void>;
  checkIfSaved: (postId: string) => Promise<void>;
}

/**
 * Hook para manejar la funcionalidad de guardar posts en boards
 * 
 * Este hook centraliza toda la lógica de guardar/remover posts de boards,
 * eliminando código duplicado entre componentes.
 * 
 * @param initialPostId - ID del post inicial (opcional)
 * @param initialIsSaved - Estado inicial de guardado (opcional)
 * @returns Objeto con estado y funciones para manejar guardados
 */
export function useSavePost(
  initialPostId?: string,
  initialIsSaved = false
): UseSavePostReturn {
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const { error: showAlert } = useAlert();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(initialPostId);

  /**
   * Verifica si un post está guardado en algún board
   */
  const checkIfSaved = useCallback(async (postId: string) => {
    if (!isAuthenticated || !postId) {
      setIsSaved(false);
      return;
    }

    try {
      const result = await boardService.isPostSaved(postId);
      setIsSaved(result.isSaved);
      setCurrentPostId(postId);
    } catch (err) {
      // Error silencioso - no bloquear la UI
      setIsSaved(false);
    }
  }, [isAuthenticated]);

  /**
   * Toggle para guardar o remover un post de los boards
   */
  const toggleSave = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      showAlert('Acceso denegado', 'Debes iniciar sesión para guardar publicaciones');
      router.push('/login');
      return;
    }

    if (isSaving) {
      return; // Evitar múltiples llamadas simultáneas
    }

    setIsSaving(true);
    setCurrentPostId(postId);

    try {
      if (isSaved && currentPostId === postId) {
        // Remover de guardados
        const savedInfo = await boardService.isPostSaved(postId);
        
        if (savedInfo.isSaved && savedInfo.boardId) {
          await boardService.removePostFromBoard(savedInfo.boardId, postId);
          setIsSaved(false);
        } else {
          // Si no encontramos el board, buscar manualmente
          const boards = await boardService.getMyBoards();
          const allBoards = boards.data?.boards || [];

          for (const board of allBoards) {
            const hasPost = board.Posts?.some((post) => post.id === postId);
            if (hasPost) {
              await boardService.removePostFromBoard(board.id, postId);
              setIsSaved(false);
              break;
            }
          }
        }
      } else {
        // Agregar a guardados
        const defaultBoard = await boardService.getOrCreateDefaultBoard();
        await boardService.addPostToBoard(defaultBoard.id, postId);
        setIsSaved(true);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'No se pudo guardar la publicación';
      showAlert('Error al guardar', errorMessage);
      
      // Revertir estado en caso de error
      setIsSaved(!isSaved);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, isSaved, isSaving, currentPostId, router, showAlert]);

  return {
    isSaved,
    isSaving,
    toggleSave,
    checkIfSaved
  };
}

export default useSavePost;

