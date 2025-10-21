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
      const response = await api.get<{ success: boolean; data: { user: UserProfile } }>(`/api/users/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Obtener perfil de usuario por username
  async getUserByUsername(username: string): Promise<{ success: boolean; data: { user: UserProfile } }> {
    try {
      const response = await api.get<{ success: boolean; data: { user: UserProfile } }>(`/api/users/username/${username}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuario por username:', error);
      throw error;
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(userData: Partial<UserProfile>): Promise<{ success: boolean; message: string; data: { user: UserProfile } }> {
    try {
      const response = await api.put<{ success: boolean; message: string; data: { user: UserProfile } }>('/api/users/profile', userData);
      return response;
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  // Seguir a un usuario
  async followUser(userId: string): Promise<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }>(`/api/users/${userId}/follow`);
      return response;
    } catch (error: any) {
      console.error('Error siguiendo usuario:', error);
      throw error;
    }
  },

  // Dejar de seguir a un usuario
  async unfollowUser(userId: string): Promise<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }> {
    try {
      const response = await api.delete<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }>(`/api/users/${userId}/follow`);
      return response;
    } catch (error: any) {
      console.error('Error dejando de seguir usuario:', error);
      throw error;
    }
  },

  // Toggle follow/unfollow
  async toggleFollow(userId: string): Promise<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { following: boolean; followersCount: number } }>(`/api/users/${userId}/toggle-follow`);
      return response;
    } catch (error: any) {
      console.error('Error toggleando follow:', error);
      throw error;
    }
  },

  // Obtener seguidores de un usuario
  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<UsersResponse>(`/api/users/${userId}/followers?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo seguidores:', error);
      throw error;
    }
  },

  // Obtener usuarios seguidos
  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<UsersResponse>(`/api/users/${userId}/following?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo seguidos:', error);
      throw error;
    }
  },

  // Buscar usuarios
  async searchUsers(query: string, page: number = 1, limit: number = 20, userType?: string): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        ...(userType && { userType })
      });

      const response = await api.get<UsersResponse>(`/api/users/search?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  },

  // Obtener usuarios sugeridos
  async getSuggestedUsers(limit: number = 10): Promise<{ success: boolean; data: { users: User[] } }> {
    try {
      const response = await api.get<{ success: boolean; data: { users: User[] } }>(`/api/users/suggested?limit=${limit}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuarios sugeridos:', error);
      throw error;
    }
  },

  // Obtener usuarios populares
  async getPopularUsers(limit: number = 10): Promise<{ success: boolean; data: { users: User[] } }> {
    try {
      const response = await api.get<{ success: boolean; data: { users: User[] } }>(`/api/users/popular?limit=${limit}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuarios populares:', error);
      throw error;
    }
  },

  // Reportar usuario
  async reportUser(userId: string, reason: string, description?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(`/api/users/${userId}/report`, {
        reason,
        description
      });
      return response;
    } catch (error: any) {
      console.error('Error reportando usuario:', error);
      throw error;
    }
  },

  // Bloquear usuario
  async blockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(`/api/users/${userId}/block`);
      return response;
    } catch (error: any) {
      console.error('Error bloqueando usuario:', error);
      throw error;
    }
  },

  // Desbloquear usuario
  async unblockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/users/${userId}/block`);
      return response;
    } catch (error: any) {
      console.error('Error desbloqueando usuario:', error);
      throw error;
    }
  },

  // Obtener usuarios bloqueados
  async getBlockedUsers(page: number = 1, limit: number = 20): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<UsersResponse>(`/api/users/blocked?${params}`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuarios bloqueados:', error);
      throw error;
    }
  },

  // Verificar si un usuario está siendo seguido
  async isFollowing(userId: string): Promise<{ success: boolean; data: { isFollowing: boolean } }> {
    try {
      const response = await api.get<{ success: boolean; data: { isFollowing: boolean } }>(`/api/users/${userId}/is-following`);
      return response;
    } catch (error: any) {
      console.error('Error verificando follow:', error);
      throw error;
    }
  },

  // Obtener estadísticas del usuario
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
      const response = await api.get<{ 
        success: boolean; 
        data: { 
          postsCount: number;
          followersCount: number;
          followingCount: number;
          likesReceived: number;
          viewsReceived: number;
        } 
      }>(`/api/users/${userId}/stats`);
      return response;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export default userService;
