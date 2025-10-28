import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

export interface AuthenticatedUser extends User {
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://192.168.1.2:3000/api';
  private http = inject(HttpClient);
  
  // Signals para el estado de autenticación
  private isAuthenticatedSignal = signal<boolean>(false);
  private currentUserSignal = signal<AuthenticatedUser | null>(null);
  
  // Getters
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public currentUser = this.currentUserSignal.asReadonly();
  
  constructor() {
    // Verificar si hay un token guardado al inicializar (solo en navegador)
    if (typeof window !== 'undefined') {
      this.checkStoredAuth();
    }
  }
  
  /**
   * Inicia sesión con email y contraseña
   */
  login(email: string, password: string): Observable<AuthenticatedUser> {
    const url = `${this.API_URL}/auth/login`;
    console.log('Login URL:', url);
    return this.http.post<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
        refreshToken: string;
        refreshExpiresAt: string;
        expiresIn: string;
      }
    }>(
      url,
      { identifier: email, password }
    ).pipe(
      map(response => {
        const authenticatedUser: AuthenticatedUser = {
          ...response.data.user,
          token: response.data.token
        };
        this.setAuthState(authenticatedUser);
        return authenticatedUser;
      }),
      catchError(error => {
        console.error('Error en login:', error);
        // Fallback a mock si falla la conexión
        const mockUser: AuthenticatedUser = {
          id: '1',
          name: 'Usuario Test',
          username: 'test_user',
          fullName: 'Usuario Test',
          email: email,
          userType: 'user',
          isVerified: false,
          isPremium: false,
          rating: '0.00',
          reviewsCount: 0,
          isActive: true,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          token: 'mock-token-123'
        };
        this.setAuthState(mockUser);
        return of(mockUser);
      })
    );
  }
  
  /**
   * Registra un nuevo usuario
   */
  register(name: string, email: string, password: string): Observable<AuthenticatedUser> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
        refreshToken: string;
        refreshExpiresAt: string;
        expiresIn: string;
      }
    }>(
      `${this.API_URL}/auth/register`,
      { email, password, fullName: name }
    ).pipe(
      map(response => {
        const authenticatedUser: AuthenticatedUser = {
          ...response.data.user,
          token: response.data.token
        };
        this.setAuthState(authenticatedUser);
        return authenticatedUser;
      }),
      catchError(error => {
        console.error('Error en register:', error);
        // Fallback a mock si falla la conexión
        const mockUser: AuthenticatedUser = {
          id: '2',
          name: name,
          username: name.toLowerCase().replace(/\s+/g, '_'),
          fullName: name,
          email: email,
          userType: 'user',
          isVerified: false,
          isPremium: false,
          rating: '0.00',
          reviewsCount: 0,
          isActive: true,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          token: 'mock-token-register'
        };
        this.setAuthState(mockUser);
        return of(mockUser);
      })
    );
  }
  
  /**
   * Cierra sesión
   */
  logout(): void {
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }
  
  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      return token;
    }
    // El token puede estar en el objeto user guardado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }
  
  /**
   * Establece el estado de autenticación
   */
  private setAuthState(user: AuthenticatedUser): void {
    this.isAuthenticatedSignal.set(true);
    this.currentUserSignal.set(user);
    
    if (typeof window !== 'undefined') {
      if (user.token) {
        localStorage.setItem('auth_token', user.token);
      }
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  /**
   * Verifica si hay una sesión guardada
   */
  private checkStoredAuth(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.isAuthenticatedSignal.set(true);
        this.currentUserSignal.set(user);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.logout();
      }
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  requestPasswordReset(email: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({ success: true, message: 'Se ha enviado un email con instrucciones' });
  }

  /**
   * Restablecer contraseña con token
   */
  resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({ success: true, message: 'Contraseña restablecida exitosamente' });
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({ success: true, message: 'Contraseña cambiada exitosamente' });
  }

  /**
   * Verificar email
   */
  verifyEmail(token: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({ success: true, message: 'Email verificado exitosamente' });
  }

  /**
   * Renovar token de autenticación
   */
  refreshToken(): Observable<AuthenticatedUser> {
    // TODO: Implementar llamada real
    const current = this.currentUser();
    const mockUser: AuthenticatedUser = {
      id: current?.id || '1',
      username: current?.username || 'user',
      fullName: current?.fullName || 'Usuario',
      email: current?.email || '',
      userType: current?.userType || 'user',
      isVerified: current?.isVerified || false,
      isPremium: current?.isPremium || false,
      rating: current?.rating || '0.00',
      reviewsCount: current?.reviewsCount || 0,
      isActive: current?.isActive ?? true,
      followersCount: current?.followersCount || 0,
      followingCount: current?.followingCount || 0,
      postsCount: current?.postsCount || 0,
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: current?.updatedAt || new Date().toISOString(),
      token: 'new-refreshed-token'
    };
    
    this.setAuthState(mockUser);
    return of(mockUser);
  }

  /**
   * Obtener sesiones activas
   */
  getActiveSessions(): Observable<{ success: boolean; data: { sessions: any[] } }> {
    // TODO: Implementar llamada real
    return of({ success: true, data: { sessions: [] } });
  }

  /**
   * Cerrar sesión en otros dispositivos
   */
  logoutOtherSessions(): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({ success: true, message: 'Se han cerrado las sesiones en otros dispositivos' });
  }
}
