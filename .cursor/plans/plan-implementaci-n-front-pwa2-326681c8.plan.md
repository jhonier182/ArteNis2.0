<!-- 326681c8-f189-4dee-9dd3-180327cfe7f8 1ac05739-65b7-464c-a6a2-e6147532eab4 -->
# Plan de Implementación - Front_pwa2 (Inkedin)

## Estado Actual

- ✅ Feature Auth (completo)
- ✅ Feature Profile (completo)
- ✅ BottomNavigation
- ⚠️ Feature Posts (estructura básica, falta implementación completa)
- ⚠️ Feature Appointments (solo servicio, falta UI)
- ❌ Feature Search
- ❌ Feature Boards/Collections
- ❌ Feature Follow
- ❌ Feature Notifications (contexto y UI)
- ❌ Contexto Theme (sistema de temas)
- ❌ Componente global Alert
- ❌ Componentes Posts adicionales (PostMenu, PostFilters, CommentItem)
- ❌ Hooks Posts adicionales (useLikePost, useSavePost, usePostFilters)
- ❌ Página edit.tsx (editor de imagen con filtros)

## FASE 1: Feature Posts Completo

### 1.1 Servicio PostService - Actualizar

**Archivo:** `Front_pwa2/src/features/posts/services/postService.ts`

Añadir métodos faltantes del backend:

- `getFeed()` - `/api/posts` (feed principal con filtros: type, style, bodyPart, location, featured, sortBy)
- `getFollowingPosts()` - `/api/posts/following`
- `getSavedPosts()` - `/api/posts/saved`
- `uploadPostMedia()` - `/api/posts/upload` (FormData)
- `getComments()` - `/api/posts/:id/comments` (soporta parentId para replies)
- `addComment()` - `/api/posts/:id/comments` (soporta parentId para respuestas anidadas)
- `likeComment()` - `/api/comments/:id/like`
- `getLikeInfo()` - `/api/posts/:id/likes`
- `toggleSave()` - `/api/posts/:id/save` (reemplazar save/unsave separados)
- Verificar si existe endpoint para editar/eliminar comentarios (no encontrado en backend, puede ser funcionalidad futura)

Actualizar interfaces:

- Agregar `mediaUrl`, `thumbnailUrl`, `type: 'image' | 'video' | 'reel'`
- Agregar `comments`, `author` completo
- Agregar `viewsCount`
- Agregar `isLiked`, `isSaved` para estado del usuario actual
- Agregar `style` (string), `bodyPart` (string) - Filtros de tatuaje
- Agregar `isFeatured` (boolean), `isPremiumContent` (boolean)
- Agregar `status: 'draft' | 'published' | 'archived'`
- Agregar `allowComments` (boolean), `publishedAt` (Date)
- Agregar `tags` (array) - Ya existe pero verificar estructura

### 1.2 Hooks Posts - Actualizar y Nuevos

**Actualizar:** `Front_pwa2/src/features/posts/hooks/usePosts.ts`

- Mejorar para usar el servicio completo con nuevas interfaces
- Integrar con scroll infinito

**Nuevo:** `Front_pwa2/src/features/posts/hooks/usePostFeed.ts`

- Hook específico para feed principal con scroll infinito
- Manejo de paginación
- Filtros opcionales: type, style, bodyPart, location, featured, sortBy

**Nuevo:** `Front_pwa2/src/features/posts/hooks/usePostComments.ts`

- Hook para gestionar comentarios de un post
- Cargar comentarios paginados (solo principales, luego replies)
- Agregar nuevo comentario (con soporte para `parentId` para respuestas)
- Editar comentario propio
- Eliminar comentario propio
- Like a comentarios
- Soporte para comentarios anidados (replies)

### 1.3 Componentes Posts

**Archivo:** `Front_pwa2/src/features/posts/components/PostCard.tsx`

Implementar componente completo con:

- Preview de imagen/video
- Interacciones (like, comment, save, share)
- Información del autor
- Contador de likes/comentarios
- Link a detalle del post

**Nuevo:** `Front_pwa2/src/features/posts/components/PostForm.tsx`

- Formulario para crear/editar posts
- Drag & drop de imágenes/videos
- Preview antes de publicar
- Validación de archivos

**Nuevo:** `Front_pwa2/src/features/posts/components/CommentSection.tsx`

- Lista de comentarios con scroll infinito
- Formulario para añadir comentario
- Soporte para respuestas anidadas (`parentId` - el backend lo soporta)
- Edición de comentarios (`isEdited`, `editedAt`)
- Like a comentarios
- Contador de respuestas (`repliesCount`)
- Vista de hilos de comentarios

### 1.4 Páginas Posts

**Actualizar:** `Front_pwa2/src/pages/index.tsx`

- Feed principal con scroll infinito
- Usar `usePostFeed()` hook
- PostCards con todas las interacciones
- Filtros y ordenamiento

**Nuevo:** `Front_pwa2/src/features/posts/pages/post-detail.tsx`

- Vista completa del post
- Sección de comentarios
- Acciones: like, save, share, delete (si es propio)
- Navegación al perfil del autor

**Nuevo:** `Front_pwa2/src/features/posts/pages/create.tsx`

- Página de creación de posts
- Subida de media (imagen/video)
- Guardado como draft en localStorage
- Redirección a página de edición
- Filtros de estilo (PostFilters)
- Configuración de visibilidad
- Preview antes de publicar

**Nuevo:** `Front_pwa2/src/features/posts/pages/edit.tsx`

- Página de edición de imagen antes de publicar
- Herramientas de edición: brightness, contrast, saturation, exposure, etc.
- Filtros predefinidos (vivid, bright, dark, vintage, cool, warm)
- Ajustes manuales (highlights, shadows, warmth, tint, sharpness, vignette)
- Rotación de imagen
- Editor de descripción, estilos, tags de cliente
- Configuración de visibilidad
- Publicar o guardar como draft

**Actualizar:** `Front_pwa2/src/pages/create.tsx` (wrapper)

**Nuevo:** `Front_pwa2/src/pages/create/edit.tsx` (wrapper)

## FASE 2: Feature Search

### 2.1 Servicio Search

**Nuevo:** `Front_pwa2/src/features/search/services/searchService.ts`

Métodos del backend:

- `search()` - `/api/search?q=...&type=...&city=...`
- `getSuggestions()` - `/api/search/suggestions?q=...`
- `getPopularFilters()` - `/api/search/filters`

Interfaces:

- `SearchResult` con `posts`, `users`, `boards`
- `SearchFilters` con `type`, `city`, etc.

### 2.2 Hooks Search

**Nuevo:** `Front_pwa2/src/features/search/hooks/useSearch.ts`

Hook principal con:

- Estado de búsqueda
- Resultados paginados
- Sugerencias en tiempo real
- Filtros aplicados

### 2.3 Página Search

**Nuevo:** `Front_pwa2/src/features/search/pages/search.tsx`

Implementar:

- Barra de búsqueda con autocompletado
- Tabs para resultados: Posts, Usuarios, Boards
- Filtros: ciudad, tipo (all|artists|posts|boards)
- Historial de búsquedas recientes
- Resultados con scroll infinito

**Actualizar:** `Front_pwa2/src/pages/search.tsx` (wrapper)

## FASE 3: Feature Boards/Collections

### 3.1 Servicio BoardService

**Nuevo:** `Front_pwa2/src/features/boards/services/boardService.ts`

Métodos del backend:

- `getMyBoards()` - `/api/boards/me/boards`
- `createBoard()` - `/api/boards`
- `updateBoard()` - `/api/boards/:id`
- `deleteBoard()` - `/api/boards/:id`
- `getBoardById()` - `/api/boards/:id`
- `getBoardPosts()` - `/api/boards/:id/posts` (paginado)
- `addPostToBoard()` - `/api/boards/:id/posts` (con note y sortOrder opcionales)
- `removePostFromBoard()` - `/api/boards/:id/posts/:postId`
- `followBoard()` - `/api/boards/:id/follow`
- `unfollowBoard()` - `/api/boards/:id/follow`
- `searchBoards()` - `/api/boards/search`
- `getCategories()` - `/api/boards/categories`

Interfaces:

- `Board` con campos: name, description, isPublic, coverImage, category, etc.
- `BoardCollaborator` (futuro - modelo existe pero no hay endpoints aún):
  - Invitaciones a colaborar
  - Roles: collaborator, moderator
  - Permisos: canAddPosts, canRemovePosts, canEditBoard, etc.
  - Estados: pending, accepted, declined

### 3.2 Hooks Boards

**Nuevo:** `Front_pwa2/src/features/boards/hooks/useBoards.ts`

Hook para:

- Cargar boards del usuario
- Crear/actualizar/eliminar boards
- Agregar/quitar posts de boards

### 3.3 Componentes Boards

**Nuevo:** `Front_pwa2/src/features/boards/components/BoardCard.tsx`

- Tarjeta de board con preview
- Nombre, descripción, cantidad de posts
- Acciones: ver, editar, eliminar

**Nuevo:** `Front_pwa2/src/features/boards/components/BoardModal.tsx`

- Modal para crear/editar board
- Selección de posts para agregar
- Configuración de privacidad

### 3.4 Página Collections

**Nuevo:** `Front_pwa2/src/features/boards/pages/collections.tsx`

Implementar:

- Grid de boards del usuario
- Búsqueda/filtro de boards
- Crear nuevo board
- Vista de posts guardados (similar a Front_pwa)

**Actualizar:** `Front_pwa2/src/pages/collections.tsx` (wrapper)

## FASE 4: Feature Follow

### 4.1 Servicio FollowService

**Nuevo:** `Front_pwa2/src/features/follow/services/followService.ts`

Métodos del backend:

- `followUser()` - `/api/follow` (POST)
- `unfollowUser()` - `/api/follow/:userId` (DELETE)
- `getFollowingUsers()` - `/api/follow/following`
- `checkFollowingStatus()` - `/api/follow/status/:userId`

### 4.2 Hooks Follow

**Nuevo:** `Front_pwa2/src/features/follow/hooks/useFollowing.ts`

Adaptar de Front_pwa:

- Estado de seguimiento
- Lista de usuarios seguidos
- Toggle follow/unfollow
- Verificar si sigue a usuario

### 4.3 Componente FollowButton

**Nuevo:** `Front_pwa2/src/features/follow/components/FollowButton.tsx`

Adaptar de Front_pwa:

- Botón seguir/dejar de seguir
- Estados: loading, seguido, no seguido
- Feedback visual

### 4.4 Página User Profile

**Nuevo:** `Front_pwa2/src/features/profile/pages/user-profile.tsx`

Para ver perfiles públicos:

- Información del usuario
- Posts del usuario
- Botón de seguir
- Stats (seguidores, seguidos, posts)

**Nuevo:** `Front_pwa2/src/pages/user/[id].tsx` (wrapper)

## FASE 5: Feature Appointments

### 5.1 Actualizar Servicio Appointments

**Archivo:** `Front_pwa2/src/features/appointments/services/appointmentService.ts`

Completar métodos del backend (verificar rutas):

- `createAppointment()` - POST `/api/appointments`
- `getMyAppointments()` - GET `/api/appointments/me`
- `updateAppointment()` - PUT `/api/appointments/:id`
- `cancelAppointment()` - DELETE `/api/appointments/:id`

### 5.2 Componentes Appointments

**Nuevo:** `Front_pwa2/src/features/appointments/components/AppointmentCalendar.tsx`

- Calendario de disponibilidad
- Selección de fecha/hora
- Tipo: presencial/videollamada

**Nuevo:** `Front_pwa2/src/features/appointments/components/AppointmentCard.tsx`

- Tarjeta de cita con información
- Estado de la cita
- Acciones según estado

### 5.3 Página Book Appointment

**Nuevo:** `Front_pwa2/src/features/appointments/pages/book.tsx`

Adaptar de Front_pwa:

- Formulario de reserva
- Selección de fecha/hora
- Tipo de cita
- Descripción
- Confirmación

**Nuevo:** `Front_pwa2/src/pages/appointments/book.tsx` (wrapper)

## FASE 6: Feature Posts - Componentes e Hooks Adicionales

### 6.1 Componentes Posts Adicionales

**Nuevo:** `Front_pwa2/src/features/posts/components/PostMenu.tsx`

- Menú contextual de posts (editar, eliminar, reportar)
- Solo visible para posts propios
- Integración con PostCard y PostDetail

**Nuevo:** `Front_pwa2/src/features/posts/components/PostFilters.tsx`

- `StyleFilter` - Filtro por estilos de tatuaje
- `VisibilityFilter` - Filtro por visibilidad  
- `ClientTagFilter` - Filtro por tags de cliente
- Usado en CreatePost y Feed

### 6.2 Hooks Posts Adicionales

**Nuevo:** `Front_pwa2/src/features/posts/hooks/useLikePost.ts`

- Toggle like/unlike post
- Estado optimista para mejor UX
- Actualización de contador de likes
- Manejo de errores y rollback

**Nuevo:** `Front_pwa2/src/features/posts/hooks/useSavePost.ts`

- Toggle save/unsave post
- Verificar si post está guardado
- Integración con boards (seleccionar board al guardar)
- Manejo de estados de guardado

**Nuevo:** `Front_pwa2/src/features/posts/hooks/usePostFilters.ts`

- Gestión de filtros de posts
- Estilos seleccionados (array de estilos)
- Visibilidad (public/private)
- Tags de cliente
- Validación de filtros según constraints

## FASE 7: Feature Notifications

### 7.1 Contexto de Notificaciones

**Nuevo:** `Front_pwa2/src/context/NotificationContext.tsx`

Sistema de notificaciones en cliente (sin backend aún):

- Tipos: 'like', 'comment', 'follow', 'mention', 'system'
- Notificaciones en memoria/localStorage
- Contador de no leídas
- Permisos de notificaciones del navegador
- Notificaciones push (cuando esté disponible backend)
- Hook `useNotifications()`

**Nuevo:** `Front_pwa2/src/features/notifications/components/NotificationList.tsx`

- Lista de notificaciones
- Marcar como leída
- Marcar todas como leídas
- Eliminar notificación

**Nuevo:** `Front_pwa2/src/features/notifications/components/NotificationItem.tsx`

- Item individual de notificación
- Diferentes estilos según tipo
- Acción según tipo (ir a post, perfil, etc.)
- Indicador de no leída

**Nuevo:** `Front_pwa2/src/features/notifications/pages/notifications.tsx`

- Página completa de notificaciones
- Filtros por tipo
- Scroll infinito si hay muchas

**Actualizar:** `Front_pwa2/src/app/providers.tsx`

- Integrar `NotificationProvider`

**Actualizar:** `Front_pwa2/src/components/BottomNavigation.tsx`

- Agregar badge de notificaciones no leídas al ícono de campana (si existe)

### 7.2 Sistema de Temas

**Nuevo:** `Front_pwa2/src/context/ThemeContext.tsx`

Sistema de temas (claro/oscuro/sistema):

- `ThemeProvider` para gestionar tema
- Hook `useTheme()`
- Persistencia en localStorage
- Detección de preferencia del sistema
- Aplicación automática de clases CSS

**Nota:** Este es un contexto global, no un feature, pero debe implementarse.

## FASE 8: Componente Compartido - Sistema de Alertas

### 8.1 Sistema de Alertas Global

**Nuevo:** `Front_pwa2/src/components/Alert.tsx`

Componente global para notificaciones:

- Componente `Alert` individual
- Hook `useAlert()` con métodos: `success()`, `error()`, `info()`, `warning()`
- `AlertContainer` para renderizar alerts
- Auto-dismiss configurable por tipo
- Stack de alerts múltiples
- Animaciones con framer-motion

## FASE 9: Mejoras y Complementos

### 9.1 Páginas de Error

**Actualizar:** `Front_pwa2/src/pages/404.tsx`

**Actualizar:** `Front_pwa2/src/pages/500.tsx`

Asegurar que existan y estén bien diseñadas.

### 9.2 Página Offline

**Nuevo:** `Front_pwa2/src/pages/offline.tsx`

Página para cuando no hay conexión:

- Mensaje informativo
- Botón para reintentar
- Service Worker status

### 9.3 Auth Adicional

**Actualizar:** `Front_pwa2/src/features/auth/services/authService.ts`

Agregar métodos faltantes:

- `refreshToken()` - `/api/auth/refresh`
- `changePassword()` - `/api/auth/change-password`
- `forgotPassword()` - `/api/auth/forgot-password`
- `resetPassword()` - `/api/auth/reset-password`

Páginas:

- `Front_pwa2/src/features/auth/pages/forgot-password.tsx`
- `Front_pwa2/src/features/auth/pages/reset-password.tsx`
- `Front_pwa2/src/features/auth/pages/change-password.tsx`

### 9.4 Integración BottomNavigation

**Actualizar:** `Front_pwa2/src/components/BottomNavigation.tsx`

Asegurar que todas las rutas estén mapeadas:

- `/` - Home (feed)
- `/search` - Búsqueda
- `/create` - Crear post (solo artistas)
- `/profile` - Perfil
- `/collections` - Colecciones (opcional)

## FASE 10: Testing y Optimización

### 10.1 Testing

- Verificar todas las rutas
- Probar autenticación
- Validar formularios
- Probar scroll infinito
- Verificar errores de red

### 10.2 Optimización

- Lazy loading de componentes pesados
- Optimización de imágenes (Next Image)
- Cache de respuestas API
- Service Worker actualizado
- Performance monitoring

## Archivos Clave a Crear/Actualizar

### Servicios (7 archivos nuevos, 2 actualizar)

- `features/posts/services/postService.ts` (actualizar)
- `features/search/services/searchService.ts` (nuevo)
- `features/boards/services/boardService.ts` (nuevo)
- `features/follow/services/followService.ts` (nuevo)
- `features/appointments/services/appointmentService.ts` (actualizar)
- `features/auth/services/authService.ts` (actualizar)

### Hooks (10 archivos nuevos, 1 actualizar)

**Feature Posts:**

- `features/posts/hooks/usePosts.ts` (actualizar)
- `features/posts/hooks/usePostFeed.ts` (nuevo - FASE 1.2)
- `features/posts/hooks/usePostComments.ts` (nuevo - FASE 1.2)
- `features/posts/hooks/useLikePost.ts` (nuevo - FASE 6.2)
- `features/posts/hooks/useSavePost.ts` (nuevo - FASE 6.2)
- `features/posts/hooks/usePostFilters.ts` (nuevo - FASE 6.2)

**Otros Features:**

- `features/search/hooks/useSearch.ts` (nuevo - FASE 2.2)
- `features/boards/hooks/useBoards.ts` (nuevo - FASE 3.2)
- `features/follow/hooks/useFollowing.ts` (nuevo - FASE 4.2)

**Feature Notifications:**

- `features/notifications/hooks/useNotifications.ts` (nuevo - FASE 7.1)
  - Ya existe en `NotificationContext`, solo verificar si necesita hook separado

### Componentes (18 archivos nuevos, 1 actualizar)

**Feature Posts:**

- `features/posts/components/PostForm.tsx` (FASE 1.3)
- `features/posts/components/CommentSection.tsx` (FASE 1.3 - con respuestas anidadas)
- `features/posts/components/PostMenu.tsx` (FASE 6.1)
- `features/posts/components/PostFilters.tsx` (FASE 6.1)
- `features/posts/components/PostCard.tsx` (actualizar - FASE 1.3)
- `features/posts/components/CommentItem.tsx` (nuevo - para comentarios con replies)

**Feature Search:**

- `features/search/components/` (componentes específicos si se necesitan)

**Feature Boards:**

- `features/boards/components/BoardCard.tsx` (FASE 3.3)
- `features/boards/components/BoardModal.tsx` (FASE 3.3)

**Feature Follow:**

- `features/follow/components/FollowButton.tsx` (FASE 4.3)

**Feature Appointments:**

- `features/appointments/components/AppointmentCalendar.tsx` (FASE 5.2)
- `features/appointments/components/AppointmentCard.tsx` (FASE 5.2)

**Feature Notifications:**

- `features/notifications/components/NotificationList.tsx` (FASE 7.1)
- `features/notifications/components/NotificationItem.tsx` (FASE 7.1)

**Componente Global Compartido:**

- `components/Alert.tsx` (FASE 8.1 - componente realmente compartido)

**Contextos Globales:**

- `context/NotificationContext.tsx` (FASE 7.1)
- `context/ThemeContext.tsx` (FASE 7.2)

### Páginas (15 archivos nuevos, 3 actualizar)

**Wrappers en pages/ (14 archivos):**

- `pages/index.tsx` (actualizar - feed principal)
- `pages/create.tsx` (wrapper, nuevo)
- `pages/create/edit.tsx` (wrapper, nuevo - editor de imagen)
- `pages/search.tsx` (wrapper, nuevo)
- `pages/collections.tsx` (wrapper, nuevo)
- `pages/user/[id].tsx` (nuevo - perfil público)
- `pages/appointments/book.tsx` (wrapper, nuevo)
- `pages/notifications.tsx` (wrapper, nuevo)
- `pages/offline.tsx` (nuevo)
- `pages/post/[id].tsx` (wrapper, nuevo - detalle de post)
- `pages/404.tsx` (actualizar - asegurar que existe)
- `pages/500.tsx` (actualizar - asegurar que existe)

**Páginas en features/ (15 archivos):**

- `features/posts/pages/post-detail.tsx` (nuevo - FASE 1.4)
- `features/posts/pages/create.tsx` (nuevo - FASE 1.4)
- `features/posts/pages/edit.tsx` (nuevo - FASE 1.4)
- `features/search/pages/search.tsx` (nuevo - FASE 2.3)
- `features/boards/pages/collections.tsx` (nuevo - FASE 3.4)
- `features/profile/pages/user-profile.tsx` (nuevo - FASE 4.4)
- `features/appointments/pages/book.tsx` (nuevo - FASE 5.3)
- `features/notifications/pages/notifications.tsx` (nuevo - FASE 7.1)
- `features/auth/pages/forgot-password.tsx` (nuevo - FASE 9.3)
- `features/auth/pages/reset-password.tsx` (nuevo - FASE 9.3)
- `features/auth/pages/change-password.tsx` (nuevo - FASE 9.3)

## Estructura Final de Features

Todas las funcionalidades están organizadas en features dentro de `src/features/` siguiendo esta estructura:

```
src/features/
├── auth/                    ✅ COMPLETO
│   ├── services/
│   ├── hooks/
│   ├── components/
│   └── pages/
│
── profile/                 ✅ COMPLETO
│   ├── services/
│   ├── hooks/
│   ├── components/
│   └── pages/
│
── posts/                    ⚠️ EN DESARROLLO
│   ├── services/postService.ts (actualizar - FASE 1.1)
│   ├── hooks/
│   │   ├── usePosts.ts (actualizar)
│   │   ├── usePostFeed.ts (nuevo - FASE 1.2)
│   │   ├── usePostComments.ts (nuevo - FASE 1.2 - con replies)
│   │   ├── useLikePost.ts (nuevo - FASE 6.2)
│   │   ├── useSavePost.ts (nuevo - FASE 6.2)
│   │   └── usePostFilters.ts (nuevo - FASE 6.2)
│   ├── components/
│   │   ├── PostCard.tsx (actualizar - FASE 1.3)
│   │   ├── PostForm.tsx (nuevo - FASE 1.3)
│   │   ├── CommentSection.tsx (nuevo - FASE 1.3 - con respuestas anidadas)
│   │   ├── CommentItem.tsx (nuevo - FASE 1.3)
│   │   ├── PostMenu.tsx (nuevo - FASE 6.1)
│   │   └── PostFilters.tsx (nuevo - FASE 6.1)
│   └── pages/
│       ├── post-detail.tsx (nuevo - FASE 1.4)
│       ├── create.tsx (nuevo - FASE 1.4)
│       └── edit.tsx (nuevo - FASE 1.4 - editor de imagen)
│
── search/                   ❌ PENDIENTE
│   ├── services/searchService.ts (nuevo)
│   ├── hooks/useSearch.ts (nuevo)
│   └── pages/search.tsx (nuevo)
│
── boards/                   ❌ PENDIENTE
│   ├── services/boardService.ts (nuevo)
│   ├── hooks/useBoards.ts (nuevo)
│   ├── components/
│   │   ├── BoardCard.tsx (nuevo)
│   │   └── BoardModal.tsx (nuevo)
│   └── pages/collections.tsx (nuevo)
│
── follow/                   ❌ PENDIENTE
│   ├── services/followService.ts (nuevo)
│   ├── hooks/useFollowing.ts (nuevo)
│   └── components/FollowButton.tsx (nuevo)
│
── appointments/               ⚠️ PARCIAL
│   ├── services/appointmentService.ts (actualizar - FASE 5.1)
│   ├── components/
│   │   ├── AppointmentCalendar.tsx (nuevo - FASE 5.2)
│   │   └── AppointmentCard.tsx (nuevo - FASE 5.2)
│   └── pages/book.tsx (nuevo - FASE 5.3)
│
── notifications/             ❌ PENDIENTE
│   ├── components/
│   │   ├── NotificationList.tsx (nuevo - FASE 7.1)
│   │   └── NotificationItem.tsx (nuevo - FASE 7.1)
│   └── pages/notifications.tsx (nuevo - FASE 7.1)
│
src/components/             (Componentes globales realmente compartidos)
└── Alert.tsx               (FASE 8.1 - nuevo)

src/context/                (Contextos globales)
├── NotificationContext.tsx (FASE 7.1 - nuevo)
└── ThemeContext.tsx        (FASE 7.2 - nuevo)
```

### Notas de Arquitectura

- **Cada feature es independiente**: Tiene su propia carpeta con `services/`, `hooks/`, `components/`, `pages/`
- **No existe carpeta `shared/`**: Los componentes que parecían compartidos están en sus features correspondientes:
  - `PostMenu`, `PostFilters` → `features/posts/components/`
  - `useLikePost`, `useSavePost`, `usePostFilters` → `features/posts/hooks/`
  - `FollowButton` → `features/follow/components/`
- **Solo `Alert.tsx` es global**: Porque es usado por múltiples features, va en `src/components/`
- **Wrappers en `src/pages/`**: Solo wrappers mínimos que importan las páginas de features
- **Contextos en `src/context/`**: `NotificationContext` y `ThemeContext` son contextos globales
- **Board Collaborators**: Modelo existe en backend pero no hay endpoints aún - funcionalidad futura
- **Comentarios anidados**: El backend soporta `parentId` - implementar en CommentSection
- **Editor de imagen**: Página completa de edición antes de publicar con filtros y ajustes

### To-dos

- [ ] Actualizar PostService con métodos faltantes y campos adicionales (style, bodyPart, status, etc.)
- [ ] Crear hooks: usePostFeed, usePostComments (con replies), useLikePost, useSavePost, usePostFilters
- [ ] Crear componentes: PostForm, CommentSection (con respuestas anidadas), CommentItem, PostMenu, PostFilters
- [ ] Actualizar PostCard con nuevos campos
- [ ] Implementar páginas: post-detail, create, edit (editor de imagen)
- [ ] Implementar feature Search completo (servicio, hooks, página)
- [ ] Implementar feature Boards/Collections completo (servicio, hooks, componentes, página)
- [ ] Implementar feature Follow completo (servicio, hooks, componentes, página user profile)
- [ ] Completar feature Appointments (componentes UI, página book)
- [ ] Crear componentes de Posts: PostMenu, PostFilters (FASE 6.1)
- [ ] Crear hooks de Posts: useLikePost, useSavePost, usePostFilters (FASE 6.2)
- [ ] Implementar Feature Notifications (contexto, componentes, página) - FASE 7.1
- [ ] Implementar ThemeContext (sistema de temas) - FASE 7.2
- [ ] Crear componente global Alert (FASE 8.1)
- [ ] Agregar funcionalidades auth adicionales (forgot password, change password, refresh token)
- [ ] Crear páginas faltantes: offline.tsx, wrappers necesarios, 404, 500
- [ ] Actualizar providers para incluir NotificationProvider y ThemeProvider
- [ ] Testing y optimización final