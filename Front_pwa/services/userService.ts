import { api } from './apiClient';

// Tipos para usuarios
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  userType: 'artist' | 'collector' | 'gallery' | 'admin';
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  website?: string;
  location?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    privacy: 'public' | 'followers' | 'private';
  };
}

export interface FollowUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  userType: string;
  isFollowing: boolean;
  followersCount: number;
  postsCount: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Servicio de usuarios
export const userService = {
  // Obtener perfil de usuario por ID
  async getUserById(id: string): Promise<{ success: boolean; data: { user: UserProfile } }> {
    try {
      const response = await api.get<{ success: boolean; data: { user: UserProfile } }>(`/api/profile/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Obtener perfil de usuario por username (endpoint no disponible actualmente)
  async getUserByUsername(username: string): Promise<{ success: boolean; data: { user: UserProfile } }> {
    try {
      // Usar búsqueda general unificada con filtro de artistas
      const response = await api.get<{ success: boolean; data: { artists: UserProfile[] } }>(`/api/search?q=${encodeURIComponent(username)}&type=artists&limit=20`);
      const user = response.data.artists?.find(u => u.username === username);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return { success: true, data: { user } };
    } catch (error: any) {
      console.error('Error obteniendo usuario por username:', error);
      throw error;
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(userData: Partial<UserProfile>): Promise<{ success: boolean; message: string; data: { user: UserProfile } }> {
    try {
      const response = await api.put<{ success: boolean; message: string; data: { user: UserProfile } }>('/api/profile/me', userData);
      return response;
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  // Seguir a un usuario
  async followUser(userId: string): Promise<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }>('/api/follow', { userId });
      return response;
    } catch (error: any) {
      console.error('Error siguiendo usuario:', error);
      throw error;
    }
  },

  // Dejar de seguir a un usuario
  async unfollowUser(userId: string): Promise<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }> {
    try {
      const response = await api.delete<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }>(`/api/follow/${userId}`);
      return response;
    } catch (error: any) {
      console.error('Error dejando de seguir usuario:', error);
      throw error;
    }
  },

  // Toggle follow/unfollow (usando endpoint de verificación de estado)
  async toggleFollow(userId: string): Promise<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }> {
    try {
      // Primero verificar si ya está siguiendo
      const statusResponse = await api.get<{ success: boolean; data: { isFollowing: boolean } }>(`/api/follow/status/${userId}`);
      const isFollowing = statusResponse.data.isFollowing;
      
      // Hacer follow o unfollow según el estado actual
      if (isFollowing) {
        return this.unfollowUser(userId);
      } else {
        return this.followUser(userId);
      }
    } catch (error: any) {
      console.error('Error toggleando follow:', error);
      throw error;
    }
  },

  // Obtener seguidores de un usuario
  // NOTA: Este endpoint no existe en el backend actual (Fase 2 - Media Prioridad)
  // El backend no tiene `/api/users/:userId/followers` o `/api/profile/:userId/followers`
  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<UsersResponse> {
    throw new Error('Endpoint de seguidores no implementado en el backend. Pendiente implementación en Fase 2.');
  },

  // Obtener usuarios seguidos
  // NOTA: El endpoint `/api/follow/following` solo retorna usuarios seguidos del usuario autenticado
  // Si se requiere obtener usuarios seguidos de otro usuario, el endpoint no existe (Fase 2)
  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<UsersResponse> {
    try {
      // El backend solo soporta obtener following del usuario autenticado
      // Si userId es diferente, no hay endpoint disponible actualmente
      const response = await api.get<{ success: boolean; data: { followingUsers: User[] } }>('/api/follow/following');
      if (response.success && response.data.followingUsers) {
        return {
          success: true,
          data: {
            users: response.data.followingUsers,
            pagination: {
              page: 1,
              limit: response.data.followingUsers.length,
              total: response.data.followingUsers.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false
            }
          }
        };
      }
      throw new Error('No se pudieron obtener los usuarios seguidos');
    } catch (error: any) {
      console.error('Error obteniendo seguidos:', error);
      throw error;
    }
  },

  // Buscar usuarios
  // Endpoint: GET /api/search?q=query&type=artists&city=...&limit=limit
  async searchUsers(query: string, page: number = 1, limit: number = 20, city?: string): Promise<UsersResponse> {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('La búsqueda debe tener al menos 2 caracteres');
      }

      const params = new URLSearchParams({
        q: query.trim(),
        type: 'artists',
        page: page.toString(),
        limit: limit.toString(),
        ...(city && { city })
      });

      // El backend retorna: { success: true, data: { artists: [...], posts: [], boards: [], pagination: {...} } }
      const response = await api.get<{ success: boolean; data: { artists: User[]; pagination: { totalItems: number; currentPage: number; totalPages: number; itemsPerPage: number } } }>(`/api/search?${params}`);
      
      if (response.success && response.data) {
        const users = response.data.artists || [];
        const total = response.data.pagination?.totalItems || users.length;
        
        return {
          success: true,
          data: {
            users,
            pagination: {
              page: response.data.pagination?.currentPage || page,
              limit: response.data.pagination?.itemsPerPage || limit,
              total,
              totalPages: response.data.pagination?.totalPages || Math.ceil(total / limit),
              hasNext: (response.data.pagination?.currentPage || page) < (response.data.pagination?.totalPages || Math.ceil(total / limit)),
              hasPrev: (response.data.pagination?.currentPage || page) > 1
            }
          }
        };
      }
      throw new Error('Error en la búsqueda');
    } catch (error: any) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  },

  // Obtener usuarios sugeridos
  // NOTA: Este endpoint no existe en el backend actual (Fase 2 - Media Prioridad)
  // No existe `/api/users/suggested` en el backend
  async getSuggestedUsers(limit: number = 10): Promise<{ success: boolean; data: { users: User[] } }> {
    throw new Error('Endpoint de usuarios sugeridos no implementado en el backend. Pendiente implementación en Fase 2.');
  },

  // Obtener usuarios populares
  // NOTA: Este endpoint no existe, pero se usa `/api/search/trending` como workaround
  async getPopularUsers(limit: number = 10): Promise<{ success: boolean; data: { users: User[] } }> {
    try {
      // Workaround: Usar búsqueda de trending como alternativa
      // El endpoint ideal `/api/users/popular` no existe en el backend
      const response = await api.get<{ success: boolean; data: { artists?: User[] } }>(`/api/search/trending?limit=${limit}`);
      if (response.success && response.data.artists) {
        return { success: true, data: { users: response.data.artists } };
      }
      throw new Error('No se pudieron obtener usuarios populares');
    } catch (error: any) {
      console.error('Error obteniendo usuarios populares:', error);
      throw error;
    }
  },

  // Reportar usuario
  // NOTA: Este endpoint no existe en el backend actual (Fase 2 - Baja Prioridad)
  // No existe `/api/users/:userId/report` en el backend
  async reportUser(userId: string, reason: string, description?: string): Promise<{ success: boolean; message: string }> {
    throw new Error('Endpoint de reportar usuario no implementado en el backend. Pendiente implementación en Fase 2.');
  },

  // Bloquear usuario
  // NOTA: Este endpoint no existe en el backend actual (Fase 2 - Baja Prioridad)
  // No existe `/api/users/:userId/block` en el backend
  async blockUser(userId: string): Promise<{ success: boolean; message: string }> {
    throw new Error('Endpoint de bloquear usuario no implementado en el backend. Pendiente implementación en Fase 2.');
  },

  // Desbloquear usuario
  // NOTA: Este endpoint no existe en el backend actual (Fase 2 - Baja Prioridad)
  // No existe `/api/users/:userId/block` (DELETE) en el backend
  async unblockUser(userId: string): Promise<{ success: boolean; message: string }> {
    throw new Error('Endpoint de desbloquear usuario no implementado en el backend. Pendiente implementación en Fase 2.');
  },

  // Obtener usuarios bloqueados
  // NOTA: Este endpoint no existe en el backend actual (Fase 2 - Baja Prioridad)
  // No existe `/api/users/blocked` en el backend
  async getBlockedUsers(page: number = 1, limit: number = 20): Promise<UsersResponse> {
    throw new Error('Endpoint de usuarios bloqueados no implementado en el backend. Pendiente implementación en Fase 2.');
  },

  // Verificar si un usuario está siendo seguido
  async isFollowing(userId: string): Promise<{ success: boolean; data: { isFollowing: boolean } }> {
    try {
      const response = await api.get<{ success: boolean; data: { isFollowing: boolean } }>(`/api/follow/status/${userId}`);
      return response;
    } catch (error: any) {
      console.error('Error verificando follow:', error);
      throw error;
    }
  },

  // Obtener estadísticas del usuario
  // NOTA: El endpoint `/api/users/:userId/stats` no existe, pero se obtienen datos parciales del perfil
  // Workaround: Usar `getUserById()` que retorna postsCount, followersCount, followingCount
  // likesReceived y viewsReceived no están disponibles en el perfil actual
  async getUserStats(userId: string): Promise<{ 
    success: boolean; 
    data: { 
      postsCount: number;
      followersCount: number;
      followingCount: number;
      likesReceived: number;
      viewsReceived: number;
    } 
  }> {
    try {
      // Workaround: Obtener perfil que contiene algunos de estos datos
      const profileResponse = await this.getUserById(userId);
      if (profileResponse.success && profileResponse.data.user) {
        const user = profileResponse.data.user;
        return {
          success: true,
          data: {
            postsCount: user.postsCount || 0,
            followersCount: user.followersCount || 0,
            followingCount: user.followingCount || 0,
            likesReceived: 0, // No disponible en el perfil actual - Requiere endpoint específico
            viewsReceived: 0 // No disponible en el perfil actual - Requiere endpoint específico
          }
        };
      }
      throw new Error('No se pudo obtener el perfil del usuario');
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export default userService;
