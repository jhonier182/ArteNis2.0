import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, CreatePostDto, UpdatePostDto, PostResponse } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'http://192.168.1.2:3000/api';

  constructor() {}

  /**
   * Obtener posts con paginación
   */
  getPosts(page = 1, limit = 10, filters?: any): Observable<any> {
    // TODO: Implementar llamada real
    const mockPosts = this.generateMockPosts();
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { posts: mockPosts, total: mockPosts.length } });
      subscriber.complete();
    });
  }

  /**
   * Obtener posts de usuarios que sigues
   */
  getFollowingPosts(page = 1, limit = 10): Observable<any> {
    // TODO: Implementar llamada real
    return this.getPosts(page, limit, { following: true });
  }

  /**
   * Obtener un post por ID
   */
  getPostById(id: string): Observable<PostResponse> {
    // TODO: Implementar llamada real
    const mockPost = this.generateMockPost(id);
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { post: mockPost } });
      subscriber.complete();
    });
  }

  /**
   * Crear un nuevo post
   */
  createPost(postData: CreatePostDto): Observable<PostResponse> {
    // TODO: Implementar llamada real
    const newPost = {
      id: Date.now().toString(),
      ...postData,
      author: {} as any,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { post: newPost } });
      subscriber.complete();
    });
  }

  /**
   * Actualizar un post
   */
  updatePost(id: string, postData: UpdatePostDto): Observable<PostResponse> {
    // TODO: Implementar llamada real
    const updatedPost = {
      ...this.generateMockPost(id),
      ...postData
    };
    return new Observable(subscriber => {
      subscriber.next({ success: true, data: { post: updatedPost }, message: 'Post actualizado' });
      subscriber.complete();
    });
  }

  /**
   * Eliminar un post
   */
  deletePost(id: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ success: true, message: 'Post eliminado' });
      subscriber.complete();
    });
  }

  /**
   * Dar like/unlike a un post
   */
  toggleLike(postId: string): Observable<{ success: boolean; data: { isLiked: boolean; likesCount: number } }> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ 
        success: true, 
        data: { isLiked: true, likesCount: Math.floor(Math.random() * 100) } 
      });
      subscriber.complete();
    });
  }

  /**
   * Obtener comentarios de un post
   */
  getComments(postId: string, page = 1, limit = 10): Observable<any> {
    // TODO: Implementar llamada real
    return new Observable(subscriber => {
      subscriber.next({ 
        success: true, 
        data: { comments: [], total: 0 } 
      });
      subscriber.complete();
    });
  }

  /**
   * Genera posts mock para desarrollo
   */
  private generateMockPosts(): Post[] {
    const posts: Post[] = [];
    for (let i = 0; i < 10; i++) {
      posts.push(this.generateMockPost(i.toString()));
    }
    return posts;
  }

  private generateMockPost(id: string): Post {
    return {
      id,
      title: `Post ${id}`,
      description: 'Este es un post de ejemplo',
      mediaUrl: `https://picsum.photos/400/600?random=${id}`,
      thumbnailUrl: `https://picsum.photos/200/200?random=${id}`,
      type: 'image',
      author: {
        id: '1',
        username: 'tatuador_artista',
        fullName: 'Tatuador Artista',
        email: 'artista@email.com',
        avatar: 'https://i.pravatar.cc/150?img=3',
        bio: 'Artista del tatuaje',
        userType: 'artist',
        isVerified: true,
        isPremium: false,
        rating: '4.85',
        reviewsCount: 150,
        isActive: true,
        followersCount: 1234,
        followingCount: 456,
        postsCount: 89,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      likesCount: Math.floor(Math.random() * 1000),
      commentsCount: Math.floor(Math.random() * 100),
      viewsCount: Math.floor(Math.random() * 5000),
      sharesCount: Math.floor(Math.random() * 50),
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString(),
      isLiked: false,
      isSaved: false
    };
  }
}
