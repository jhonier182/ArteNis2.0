import { apiClient } from '@/services/apiClient'
import {
  SearchType,
  SearchFilters,
  SearchResponse,
  SearchUser,
  SearchPost,
  SearchBoard,
  SearchSuggestions,
  PaginationInfo
} from '../types'

/**
 * Servicio para manejo de búsquedas
 */
export const searchService = {
  /**
   * Búsqueda general unificada
   * @param query Término de búsqueda (opcional si type es específico)
   * @param filters Filtros de búsqueda
   * @returns Resultados de búsqueda
   */
  async search(
    query: string = '',
    filters: SearchFilters = {}
  ): Promise<SearchResponse> {
    const { type = 'all', city, page = 1, limit = 20 } = filters

    // El middleware del backend requiere 'q' con al menos 2 caracteres
    // Si hay query válido (>= 2 caracteres), usarlo
    // Si type es específico y no hay query válido, usar el type como query mínimo
    const queryParam = query && query.trim().length >= 2 
      ? query.trim() 
      : type !== 'all' 
      ? type // Usar el type como query mínimo para pasar validación del middleware
      : 'all' // Para type='all' sin query, usar 'all' como query mínimo
    
    const params = new URLSearchParams({
      q: queryParam,
      type,
      page: page.toString(),
      limit: limit.toString(),
      ...(city && { city })
    })

    const response = await apiClient.getClient().get<{
      success: boolean
      message?: string
      data: {
        artists?: SearchUser[]
        posts?: SearchPost[]
        boards?: SearchBoard[]
        pagination: PaginationInfo
      }
    }>(`/search?${params}`)

    const responseData = response.data.data || response.data

    // Normalizar posts (el backend puede devolver 'author' o 'User')
    const normalizedPosts = (responseData.posts || []).map((post: any) => ({
      ...post,
      User: post.author || post.User,
      // Asegurar que type tenga un valor por defecto
      type: post.type || 'image'
    }))

    return {
      artists: responseData.artists || [],
      posts: normalizedPosts,
      boards: responseData.boards || [],
      pagination: responseData.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false
      }
    }
  },

  /**
   * Buscar solo usuarios/artistas
   */
  async searchUsers(
    query: string,
    filters: Omit<SearchFilters, 'type'> = {}
  ): Promise<{ users: SearchUser[]; pagination: PaginationInfo }> {
    const results = await this.search(query, { ...filters, type: 'artists' })
    return {
      users: results.artists,
      pagination: results.pagination
    }
  },

  /**
   * Buscar solo posts
   */
  async searchPosts(
    query: string = '',
    filters: Omit<SearchFilters, 'type'> = {}
  ): Promise<{ posts: SearchPost[]; pagination: PaginationInfo }> {
    const results = await this.search(query, { ...filters, type: 'posts' })
    return {
      posts: results.posts,
      pagination: results.pagination
    }
  },

  /**
   * Obtener sugerencias de búsqueda
   * @param query Término de búsqueda (mínimo 2 caracteres)
   */
  async getSuggestions(query: string): Promise<SearchSuggestions> {
    if (!query || query.trim().length < 2) {
      return { suggestions: [] }
    }

    const response = await apiClient.getClient().get<{
      success: boolean
      data: { suggestions: string[] }
    }>(`/search/suggestions?q=${encodeURIComponent(query.trim())}`)

    const responseData = response.data.data || response.data
    return {
      suggestions: responseData.suggestions || []
    }
  },

  /**
   * Obtener posts públicos para descubrir (sin filtro de búsqueda)
   * @param limit Cantidad de posts a obtener
   */
  async getDiscoverPosts(limit: number = 50): Promise<SearchPost[]> {
    // El middleware del backend requiere 'q' con al menos 2 caracteres
    // Enviamos un query mínimo que el backend puede ignorar cuando type es específico
    const results = await this.search('posts', { type: 'posts', limit })
    return results.posts
  }
}

