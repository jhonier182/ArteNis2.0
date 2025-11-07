/**
 * EJEMPLOS DE USO DEL SISTEMA DE CACHÉ CENTRALIZADO
 * 
 * Este archivo muestra cómo usar el sistema de caché genérico
 * para diferentes casos de uso. NO se importa en producción.
 */

import { createCache, ScrollCache } from './cache'

// ============================================
// EJEMPLO 1: Caché de Posts Individuales
// ============================================
interface Post {
  id: string
  title: string
  content: string
}

const postCache = createCache<Post>('post', {
  duration: 10 * 60 * 1000, // 10 minutos
  keyPrefix: 'post_cache_'
})

// Guardar un post
const myPost: Post = { id: '123', title: 'Mi Post', content: 'Contenido...' }
postCache.set('post-123', myPost)

// Obtener un post
const cachedPost = postCache.get('post-123')
if (cachedPost) {
  console.log('Post encontrado:', cachedPost.title)
}

// Eliminar un post específico
postCache.delete('post-123')

// Limpiar todo el caché de posts
postCache.clear()

// ============================================
// EJEMPLO 2: Caché de Usuarios
// ============================================
interface User {
  id: string
  name: string
  email: string
}

const userCache = createCache<User>('user', {
  duration: 5 * 60 * 1000, // 5 minutos
  keyPrefix: 'user_cache_'
})

// Uso similar al ejemplo anterior
userCache.set('user-456', { id: '456', name: 'Juan', email: 'juan@example.com' })
const cachedUser = userCache.get('user-456')

// ============================================
// EJEMPLO 3: Caché de Listas/Arrays
// ============================================
interface Product {
  id: string
  name: string
  price: number
}

const productsCache = createCache<Product[]>('products', {
  duration: 15 * 60 * 1000, // 15 minutos
  keyPrefix: 'products_cache_'
})

// Guardar una lista de productos
const products: Product[] = [
  { id: '1', name: 'Producto 1', price: 100 },
  { id: '2', name: 'Producto 2', price: 200 }
]
productsCache.set('featured', products)

// Obtener la lista
const cachedProducts = productsCache.get('featured')

// ============================================
// EJEMPLO 4: Caché de Objetos Complejos
// ============================================
interface SearchResults {
  query: string
  results: any[]
  total: number
  page: number
}

const searchCache = createCache<SearchResults>('search', {
  duration: 2 * 60 * 1000, // 2 minutos (búsquedas se invalidan rápido)
  keyPrefix: 'search_cache_'
})

// Guardar resultados de búsqueda
const searchResults: SearchResults = {
  query: 'tatuajes',
  results: [],
  total: 0,
  page: 1
}
searchCache.set('tatuajes', searchResults)

// ============================================
// EJEMPLO 5: Caché sin Persistencia (Solo Memoria)
// ============================================
const tempCache = createCache<string>('temp', {
  duration: 60 * 1000, // 1 minuto
  persist: false // Solo en memoria, no en sessionStorage
})

// Útil para datos temporales que no necesitan persistir entre recargas

// ============================================
// EJEMPLO 6: Scroll Position Cache
// ============================================
// Ya está implementado como utilidad separada

// Guardar posición de scroll
ScrollCache.save('user-123', 500)

// Obtener posición de scroll
const scrollY = ScrollCache.get('user-123')

// Limpiar posición de scroll
ScrollCache.clear('user-123')

// ============================================
// MEJORES PRÁCTICAS
// ============================================
/*
1. Usa nombres descriptivos para el cacheName
2. Ajusta la duración según la frecuencia de actualización de los datos
3. Usa prefijos únicos para evitar colisiones de claves
4. Limpia el caché cuando los datos se actualizan externamente
5. Considera usar persist: false para datos muy temporales
6. Siempre verifica si el dato existe antes de usarlo (puede ser null)
*/

