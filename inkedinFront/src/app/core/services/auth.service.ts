import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

export interface AuthenticatedUser extends User {
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api'; // Ajustar según tu backend
  
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
    // TODO: Implementar llamada real a la API
    // Por ahora retorna un observable mock
    const mockUser: AuthenticatedUser = {
      id: '1',
      name: 'Usuario Test',
      email: email,
      token: 'mock-token-123'
    };
    
    this.setAuthState(mockUser);
    return of(mockUser);
  }
  
  /**
   * Registra un nuevo usuario
   */
  register(name: string, email: string, password: string): Observable<AuthenticatedUser> {
    // TODO: Implementar llamada real a la API
    const mockUser: AuthenticatedUser = {
      id: '2',
      name: name,
      email: email,
      token: 'mock-token-register'
    };
    
    this.setAuthState(mockUser);
    return of(mockUser);
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
}
