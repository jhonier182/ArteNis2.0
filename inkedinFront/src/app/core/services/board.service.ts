import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Board, CreateBoardDto, UpdateBoardDto, BoardResponse, BoardsResponse } from '../models/board.model';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private readonly API_URL = 'http://192.168.1.2:3000/api';

  constructor() {}

  /**
   * Obtener todas las boards del usuario actual
   */
  getMyBoards(): Observable<BoardsResponse> {
    // TODO: Implementar llamada real
    const mockBoards: Board[] = [
      {
        id: '1',
        name: 'Mis Favoritos',
        description: 'Publicaciones que me gustan',
        isPrivate: false,
        postsCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Inspiración',
        description: 'Trabajos que me inspiran',
        isPrivate: false,
        postsCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return of({
      success: true,
      data: {
        boards: mockBoards,
        total: mockBoards.length
      }
    });
  }

  /**
   * Obtener una board por ID
   */
  getBoardById(id: string): Observable<BoardResponse> {
    // TODO: Implementar llamada real
    const mockBoard: Board = {
      id,
      name: 'Board Mock',
      description: 'Descripción de la board',
      isPrivate: false,
      postsCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return of({
      success: true,
      data: { board: mockBoard }
    });
  }

  /**
   * Obtener posts de una board
   */
  getBoardPosts(boardId: string, page = 1, limit = 20): Observable<any> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      data: {
        posts: [],
        total: 0,
        page,
        limit
      }
    });
  }

  /**
   * Crear una nueva board
   */
  createBoard(boardData: CreateBoardDto): Observable<BoardResponse> {
    // TODO: Implementar llamada real
    const newBoard: Board = {
      id: Date.now().toString(),
      name: boardData.name,
      description: boardData.description,
      isPrivate: boardData.isPrivate ?? false,
      postsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return of({
      success: true,
      data: { board: newBoard },
      message: 'Board creada exitosamente'
    });
  }

  /**
   * Actualizar una board
   */
  updateBoard(id: string, boardData: UpdateBoardDto): Observable<BoardResponse> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      data: { board: {} as Board },
      message: 'Board actualizada exitosamente'
    });
  }

  /**
   * Eliminar una board
   */
  deleteBoard(id: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      message: 'Board eliminada exitosamente'
    });
  }

  /**
   * Agregar un post a una board
   */
  addPostToBoard(boardId: string, postId: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      message: 'Post agregado a la board'
    });
  }

  /**
   * Remover un post de una board
   */
  removePostFromBoard(boardId: string, postId: string): Observable<{ success: boolean; message: string }> {
    // TODO: Implementar llamada real
    return of({
      success: true,
      message: 'Post removido de la board'
    });
  }
}
