import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly API_URL = 'http://192.168.1.2:3000/api';

  constructor() {}

  /**
   * Buscar usuarios
   */
  searchUsers(query: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    const mockUsers = this.generateMockUsers();
    
    return of({
      success: true,
      data: {
        users: mockUsers.filter(u => 
          u.username.includes(query) || 
          u.fullName.includes(query)
        ),
        total: 0,
        page,
        limit
      }
    }).pipe(delay(300));
  }

  /**
   * Buscar posts
   */
  searchPosts(query: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      data: {
        posts: [],
        total: 0,
        page,
        limit
      }
    }).pipe(delay(300));
  }

  /**
   * Búsqueda combinada (usuarios y posts)
   */
  searchAll(query: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      data: {
        users: [],
        posts: [],
        total: 0,
        page,
        limit
      }
    }).pipe(delay(300));
  }

  /**
   * Genera usuarios mock para desarrollo
   */
  private generateMockUsers(): any[] {
    return [
      {
        id: '1',
        username: 'tatuador_pro',
        fullName: 'Tatuador Pro',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'Especializado en realismo',
        userType: 'artist',
        isVerified: true,
        followersCount: 5000,
        followingCount: 1200,
        postsCount: 234
      },
      {
        id: '2',
        username: 'ink_artista',
        fullName: 'Artista Ink',
        avatar: 'https://i.pravatar.cc/150?img=2',
        bio: 'Arte y tatuajes',
        userType: 'artist',
        isVerified: true,
        followersCount: 3200,
        followingCount: 890,
        postsCount: 156
      },
      {
        id: '3',
        username: 'estudio_moderno',
        fullName: 'Estudio Moderno',
        avatar: 'https://i.pravatar.cc/150?img=3',
        bio: 'Estudio de tatuajes profesional',
        userType: 'gallery',
        isVerified: true,
        followersCount: 8900,
        followingCount: 450,
        postsCount: 567
      }
    ];
  }
}
