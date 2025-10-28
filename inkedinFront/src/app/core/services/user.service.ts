import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://192.168.1.2:3000/api';

  constructor() {}

  /**
   * Obtener perfil de un usuario por ID
   */
  getUserById(id: string): Observable<{ success: boolean; data: { user: User } }> {
    // TODO: Implementar llamada real
    const mockUser: User = {
      id,
      username: `usuario_${id}`,
      fullName: `Usuario ${id}`,
      email: `usuario${id}@email.com`,
      avatar: 'https://i.pravatar.cc/150?img=' + id,
      bio: 'Biografía del usuario',
      userType: 'user',
      isVerified: false,
      isPremium: false,
      rating: '0.00',
      reviewsCount: 0,
      isActive: true,
      followersCount: Math.floor(Math.random() * 1000),
      followingCount: Math.floor(Math.random() * 500),
      postsCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { user: mockUser } });
      subscriber.complete();
    });
  }

  /**
   * Obtener perfil del usuario actual
   */
  getCurrentUser(): Observable<{ success: boolean; data: { user: User } }> {
    // TODO: Implementar llamada real
    const mockUser: User = {
      id: 'current-user',
      username: 'mi_perfil',
      fullName: 'Mi Nombre',
      email: 'mi@email.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
      bio: 'Mi biografía',
      userType: 'user',
      isVerified: true,
      isPremium: false,
      rating: '0.00',
      reviewsCount: 0,
      isActive: true,
      followersCount: 500,
      followingCount: 200,
      postsCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { user: mockUser } });
      subscriber.complete();
    });
  }

  /**
   * Actualizar perfil del usuario actual
   */
  updateProfile(userData: Partial<User>): Observable<{ success: boolean; message: string; data?: { user: User } }> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, message: 'Perfil actualizado' });
      subscriber.complete();
    });
  }

  /**
   * Seguir a un usuario
   */
  followUser(userId: string): Observable<{ success: boolean; message?: string }> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, message: 'Usuario seguido' });
      subscriber.complete();
    });
  }

  /**
   * Dejar de seguir a un usuario
   */
  unfollowUser(userId: string): Observable<{ success: boolean; message?: string }> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, message: 'Ya no sigues a este usuario' });
      subscriber.complete();
    });
  }

  /**
   * Verificar si sigues a un usuario
   */
  isFollowing(userId: string): Observable<{ success: boolean; data: { isFollowing: boolean } }> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { isFollowing: false } });
      subscriber.complete();
    });
  }

  /**
   * Obtener seguidores de un usuario
   */
  getFollowers(userId: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { followers: [], total: 0 } });
      subscriber.complete();
    });
  }

  /**
   * Obtener usuarios que sigue un usuario
   */
  getFollowing(userId: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { following: [], total: 0 } });
      subscriber.complete();
    });
  }

  /**
   * Obtener posts de un usuario
   */
  getUserPosts(userId: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { posts: [], total: 0 } });
      subscriber.complete();
    });
  }
}
