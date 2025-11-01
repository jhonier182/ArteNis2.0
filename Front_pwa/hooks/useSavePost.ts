import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { postService } from '../services/postService';
import { useAlert } from '../components/Alert';

interface UseSavePostReturn {
  isSaved: boolean;
  isSaving: boolean;
  toggleSave: (postId: string) => Promise<void>;
  checkIfSaved: (postId: string) => Promise<void>;
}

/**
 * Hook para manejar la funcionalidad de guardar posts
 * 
 * Este hook centraliza toda la lógica de guardar/remover posts usando
 * el endpoint dedicado de saved posts.
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
   * Verifica si un post está guardado consultando su estado
   * Nota: El campo isSaved viene en las respuestas de los posts,
   * pero podemos verificarlo directamente si es necesario
   */
  const checkIfSaved = useCallback(async (postId: string) => {
    if (!isAuthenticated || !postId) {
      setIsSaved(false);
      return;
    }

    try {
      // Los posts vienen con el campo isSaved en las respuestas
      // Si necesitamos verificarlo explícitamente, podemos usar getPostById
      const response = await postService.getPostById(postId);
      const isPostSaved = response.data?.post?.isSaved ?? false;
      setIsSaved(isPostSaved);
      setCurrentPostId(postId);
    } catch (err) {
      // Error silencioso - no bloquear la UI
      setIsSaved(false);
    }
  }, [isAuthenticated]);

  /**
   * Toggle para guardar o remover un post usando el endpoint dedicado
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
      // Usar el endpoint dedicado de saved posts
      const response = await postService.toggleSave(postId);
      
      if (response.success && response.data) {
        setIsSaved(response.data.saved);
        // Opcional: Actualizar savesCount si se necesita mostrar en UI
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
  }, [isAuthenticated, isSaved, isSaving, router, showAlert]);

  return {
    isSaved,
    isSaving,
    toggleSave,
    checkIfSaved
  };
}

export default useSavePost;

