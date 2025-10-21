import { api } from './apiClient';

// Tipos para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  userType: 'artist' | 'collector' | 'gallery';
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token: string;
    refreshToken: string;
  };
}

export interface UserProfile {
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
  createdAt: string;
  updatedAt: string;
}

// Servicio de autenticación
export const authService = {
  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      return response;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Registrarse
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', userData);
      return response;
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  // Cerrar sesión
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/auth/logout');
      return response;
    } catch (error: any) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  // Obtener perfil del usuario actual
  async getCurrentUser(): Promise<{ success: boolean; data: { user: UserProfile } }> {
    try {
      const response = await api.get<{ success: boolean; data: { user: UserProfile } }>('/api/profile/me');
      return response;
    } catch (error: any) {
      console.error('Error obteniendo usuario actual:', error);
      throw error;
    }
  },

  // Actualizar perfil
  async updateProfile(userData: Partial<UserProfile>): Promise<{ success: boolean; message: string; data?: { user: UserProfile } }> {
    try {
      const response = await api.put<{ success: boolean; message: string; data?: { user: UserProfile } }>('/api/auth/profile', userData);
      return response;
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put<{ success: boolean; message: string }>('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  },

  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/auth/forgot-password', {
        email
      });
      return response;
    } catch (error: any) {
      console.error('Error solicitando restablecimiento:', error);
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/auth/reset-password', {
        token,
        newPassword
      });
      return response;
    } catch (error: any) {
      console.error('Error restableciendo contraseña:', error);
      throw error;
    }
  },

  // Verificar email
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/auth/verify-email', {
        token
      });
      return response;
    } catch (error: any) {
      console.error('Error verificando email:', error);
      throw error;
    }
  },

  // Reenviar verificación de email
  async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/auth/resend-verification');
      return response;
    } catch (error: any) {
      console.error('Error reenviando verificación:', error);
      throw error;
    }
  },

  // Eliminar cuenta
  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('/api/auth/account', {
        data: { password }
      });
      return response;
    } catch (error: any) {
      console.error('Error eliminando cuenta:', error);
      throw error;
    }
  },

  // Obtener sesiones activas
  async getActiveSessions(): Promise<{ success: boolean; data: { sessions: any[] } }> {
    try {
      const response = await api.get<{ success: boolean; data: { sessions: any[] } }>('/api/auth/sessions');
      return response;
    } catch (error: any) {
      console.error('Error obteniendo sesiones:', error);
      throw error;
    }
  },

  // Cerrar sesión en otros dispositivos
  async logoutOtherSessions(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/auth/logout-others');
      return response;
    } catch (error: any) {
      console.error('Error cerrando otras sesiones:', error);
      throw error;
    }
  }
};

export default authService;
