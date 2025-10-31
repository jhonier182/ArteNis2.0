# Inkedin

# Documento de Análisis Técnico - ArteNis 2.0

## 1. Resumen General

**ArteNis 2.0** es una aplicación web tipo Pinterest/Instagram especializada para tatuadores y aficionados al arte del tatuaje. La plataforma permite a los artistas mostrar sus trabajos, crear colecciones (boards), interactuar mediante likes y comentarios, y gestionar perfiles profesionales.

### Arquitectura General

- **Backend**: Node.js + Express con arquitectura MVC/Service Layer
- **Frontend**: Next.js 14 (React 18) como Progressive Web App (PWA)
- **Base de Datos**: MySQL con Sequelize ORM
- **Almacenamiento**: Cloudinary para imágenes/videos
- **Comunicación**: REST API con autenticación JWT

### Tecnologías Principales

**Backend:**

- Express 4.18.2
- Sequelize 6.35.1
- MySQL2 3.6.5
- JWT (jsonwebtoken 9.0.2)
- Cloudinary 1.41.3
- bcryptjs 2.4.3
- Winston 3.11.0 (logging)
- Helmet, CORS, Compression

**Frontend:**

- Next.js 14.0.4
- React 18.2.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.0
- Axios 1.6.2
- Framer Motion 10.16.16
- Lucide React (iconos)

---

## 2. Estructura Detectada

### Backend (`/Backend`)

```
Backend/
├── src/
│   ├── app.js                    # Configuración Express
│   ├── server.js                 # Punto de entrada
│   ├── config/
│   │   ├── db.js                 # Configuración Sequelize/MySQL
│   │   ├── cloudinary.js         # Configuración Cloudinary
│   │   ├── dbOptimization.js     # Optimizaciones DB
│   │   └── performanceOptimization.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── boardController.js
│   │   ├── profileController.js
│   │   ├── followController.js
│   │   └── searchController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Like.js
│   │   ├── Follow.js
│   │   ├── Board.js
│   │   ├── BoardPost.js
│   │   ├── BoardCollaborator.js
│   │   ├── BoardFollow.js
│   │   ├── RefreshToken.js
│   │   └── index.js             # Asociaciones de modelos
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── boardRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── followRoutes.js
│   │   └── searchRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── postService.js
│   │   ├── boardService.js
│   │   ├── profileService.js
│   │   ├── followService.js
│   │   └── searchService.js
│   ├── middlewares/
│   │   ├── auth.js              # verifyToken, optionalAuth
│   │   ├── validation.js        # Validaciones generales
│   │   ├── boardValidation.js
│   │   ├── searchValidation.js
│   │   ├── upload.js            # Multer + Cloudinary
│   │   ├── errorHandler.js
│   │   ├── httpCache.js
│   │   └── devRateLimit.js
│   └── utils/
│       ├── logger.js
│       └── taskQueue.js
├── logs/
├── package.json
└── scripts/
```

### Frontend (`/Front_pwa`)

```
Front_pwa/
├── pages/                        # Next.js Pages Router
│   ├── _app.tsx                 # Wrapper principal
│   ├── _document.tsx
│   ├── index.tsx                 # Home/Feed
│   ├── login.tsx
│   ├── register.tsx
│   ├── profile.tsx
│   ├── user/[id].tsx            # Perfil de otro usuario
│   ├── post/[id].tsx            # Detalle de post
│   ├── create.tsx               # Crear post
│   ├── create/edit.tsx
│   ├── search.tsx
│   ├── collections.tsx
│   ├── appointments/book.tsx
│   ├── offline.tsx
│   ├── 404.tsx
│   └── 500.tsx
├── components/
│   ├── Alert.tsx
│   ├── LoadingIndicator.tsx
│   ├── IntroScreen.tsx
│   ├── PostFilters.tsx
│   ├── PostMenu.tsx
│   ├── FollowButton.tsx
│   ├── EditProfileModal.tsx
│   └── SettingsModal.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── UserContext.tsx
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useInfiniteScroll.ts
│   ├── useFollowing.ts
│   ├── usePostFilters.ts
│   ├── useSearchPosts.ts
│   ├── useIntroScreen.ts
│   └── useEndpointLogger.ts
├── services/
│   ├── apiClient.ts             # Cliente Axios configurado
│   ├── authService.ts
│   ├── postService.ts
│   └── userService.ts
├── utils/
│   ├── config.ts
│   ├── apiClient.ts
│   ├── validators.ts
│   ├── formatters.ts
│   ├── dateUtils.ts
│   ├── persistentStorage.ts
│   └── endpointLogger.ts
├── styles/
│   └── globals.css
├── public/
│   ├── manifest.json
│   ├── sw.js                    # Service Worker
│   ├── icon-*.svg
│   └── intro.mp4
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── ARCHITECTURE.md
└── README.md
```

---

## 3. Backend

### 3.1 Modelos de Datos

**User** (users)

- Campos: id (UUID), username, email, password (hasheado), fullName, bio, avatar, userType (user/artist/admin), isVerified, isPremium, ubicación (city, state, country, lat/lng), especialidades, portafolio, pricePerHour, rating, reviewsCount, followersCount, followingCount, postsCount

**Post** (posts)

- Campos: id (UUID), userId, title, description, type (image/video/reel), mediaUrl, thumbnailUrl, cloudinaryPublicId, tags (JSON), likesCount, commentsCount, viewsCount, savesCount, isFeatured, isPremiumContent, isPublic, status (draft/published/archived), style, bodyPart, size, isColorTattoo, timeToComplete, healingTime, difficulty, clientAge, location, publishedAt

**Comment** (comments)

- Campos: id (UUID), postId, userId, parentId (respuestas), content, likesCount, repliesCount, isEdited, editedAt

**Like** (likes)

- Campos: id (UUID), userId, postId (nullable), commentId (nullable), type (like/love/wow/fire)

**Follow** (follows)

- Campos: id (UUID), followerId, followingId

**Board** (boards)

- Campos: id (UUID), userId, name, description, coverImage, isPublic, isPinned, style, category (traditional/realistic/minimalist/etc), postsCount, followersCount, collaboratorsCount, tags (JSON), settings (JSON), sortOrder

**BoardPost** (board_posts)

- Campos: id (UUID), boardId, postId, addedBy

**BoardCollaborator** (board_collaborators)

- Campos: id (UUID), boardId, userId

**BoardFollow** (board_follows)

- Campos: id (UUID), boardId, userId

**RefreshToken** (refresh_tokens)

- Campos: id (UUID), userId, token, expiresAt

### 3.2 Endpoints API

### Autenticación (`/api/auth`)

- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `POST /refresh` - Renovar token
- `POST /logout` - Cerrar sesión (protegida)
- `GET /me` - Obtener perfil (protegida, temporal)

### Perfil (`/api/profile`)

- `GET /me` - Perfil del usuario autenticado (protegida)
- `PUT /me` - Actualizar perfil (protegida)
- `POST /me/avatar` - Subir avatar (protegida)
- `GET /:id` - Perfil por ID (pública con auth opcional)

### Publicaciones (`/api/posts`)

- `GET /` - Feed de publicaciones (protegida)
- `GET /following` - Posts de usuarios seguidos (protegida)
- `GET /user/me` - Mis posts (protegida)
- `GET /user/:userId` - Posts de un usuario (pública)
- `GET /:id` - Post por ID (pública)
- `POST /upload` - Subir imagen/video (protegida)
- `POST /` - Crear post (protegida)
- `PUT /:id` - Editar post (protegida)
- `DELETE /:id` - Eliminar post (protegida)
- `POST /:id/like` - Toggle like (protegida)
- `GET /:id/likes` - Info de likes (pública)
- `DELETE /:id/like` - Quitar like (protegida, compatibilidad)
- `GET /:id/comments` - Comentarios (pública)
- `POST /:id/comments` - Crear comentario (protegida)
- `POST /comments/:id/like` - Like en comentario (protegida)
- `POST /track-views` - Trackear vistas (no-op)

### Tableros (`/api/boards`)

- `GET /search` - Buscar tableros (pública)
- `GET /categories` - Categorías disponibles (pública)
- `GET /me/boards` - Mis tableros (protegida)
- `GET /user/:userId` - Tableros de usuario (pública)
- `GET /:id` - Tablero por ID (pública)
- `GET /:id/posts` - Posts del tablero (pública)
- `POST /` - Crear tablero (protegida)
- `PUT /:id` - Editar tablero (protegida)
- `DELETE /:id` - Eliminar tablero (protegida)
- `POST /:id/posts` - Agregar post a tablero (protegida)
- `DELETE /:id/posts/:postId` - Remover post (protegida)
- `POST /:id/follow` - Seguir tablero (protegida)
- `DELETE /:id/follow` - Dejar de seguir (protegida)

### Seguimiento (`/api/follow`)

- `POST /` - Seguir usuario (protegida)
- `DELETE /:userId` - Dejar de seguir (protegida)
- `GET /following` - Usuarios que sigo (protegida)
- `GET /status/:userId` - Verificar si sigo a usuario (protegida)

### Búsqueda (`/api/search`)

- `GET /` - Búsqueda global (pública)
- `GET /users` - Buscar usuarios (pública)
- `GET /artists` - Buscar artistas (pública)
- `GET /posts` - Buscar posts (pública)
- `GET /boards` - Buscar tableros (pública)
- `GET /trending` - Contenido trending (pública)
- `GET /nearby` - Artistas cercanos (pública)
- `GET /suggestions` - Sugerencias de búsqueda (pública)
- `GET /filters` - Filtros populares (pública)
- `POST /voice` - Búsqueda por voz (pública)
- `POST /advanced` - Búsqueda avanzada (pública)

### Sistema

- `GET /` - Documentación API (raíz)
- `GET /health` - Health check

### 3.3 Servicios

**authService.js**: Registro, login, refresh token, logout, gestión de tokens

**postService.js**: CRUD posts, likes, comentarios, feed, filtros

**boardService.js**: CRUD boards, agregar/quitar posts, seguir boards

**profileService.js**: Obtener/actualizar perfiles, subir avatar

**followService.js**: Seguir/dejar de seguir, obtener following/followers

**searchService.js**: Búsquedas globales, por tipo, trending, nearby, voz, avanzada

### 3.4 Middlewares

- **auth.js**: verifyToken (JWT), optionalAuth
- **validation.js**: Validaciones generales (Joi/express-validator), sanitizeQuery
- **boardValidation.js**: Validaciones específicas de boards
- **searchValidation.js**: Validaciones de búsqueda
- **upload.js**: Multer + Cloudinary para imágenes/videos
- **errorHandler.js**: Manejo centralizado de errores
- **httpCache.js**: Cache HTTP inteligente
- **devRateLimit.js**: Rate limiting por entorno

### 3.5 Configuración de Base de Datos

- **Sequelize ORM** con MySQL
- Pool de conexiones configurado (max: 20, min: 5)
- Índices optimizados en tablas clave
- Timezone: Colombia (-05:00)
- Charset: utf8mb4
- Auto-sync en desarrollo (force: false, alter: false)

---

## 4. Frontend

### 4.1 Páginas y Rutas

**Páginas Principales:**

- `/` (index.tsx) - Feed principal (posts de usuarios seguidos)
- `/login` - Inicio de sesión
- `/register` - Registro
- `/profile` - Perfil del usuario autenticado
- `/user/[id]` - Perfil de otro usuario
- `/post/[id]` - Detalle de post
- `/create` - Crear nuevo post
- `/create/edit` - Editar post
- `/search` - Búsqueda
- `/collections` - Colecciones/Boards del usuario
- `/appointments/book` - Reservar cita (funcionalidad parcial)
- `/offline` - Página offline
- `404.tsx`, `500.tsx` - Páginas de error

### 4.2 Componentes

**Componentes Globales:**

- `Alert.tsx` - Sistema de alertas/notificaciones
- `LoadingIndicator.tsx` - Indicadores de carga, InfiniteScrollTrigger
- `IntroScreen.tsx` - Pantalla de introducción
- `PostFilters.tsx` - Filtros de posts
- `PostMenu.tsx` - Menú de opciones de post
- `FollowButton.tsx` - Botón seguir/dejar de seguir
- `EditProfileModal.tsx` - Modal edición de perfil
- `SettingsModal.tsx` - Configuraciones

### 4.3 Contextos

**AuthContext.tsx**: Gestión de autenticación

- Estado: user, isAuthenticated, isLoading
- Métodos: login, register, logout, updateProfile, refreshUser
- Persistencia en localStorage

**UserContext.tsx**: Contexto adicional de usuario (datos extendidos)

**ThemeContext.tsx**: Gestión de temas (claro/oscuro)

**NotificationContext.tsx**: Sistema de notificaciones

### 4.4 Hooks Personalizados

- `useInfiniteScroll.ts` / `useInfinitePosts` - Scroll infinito para posts
- `useFollowing.ts` - Gestión de usuarios seguidos
- `usePostFilters.ts` - Filtros de posts
- `useSearchPosts.ts` - Búsqueda de posts
- `useIntroScreen.ts` - Control de pantalla intro
- `useEndpointLogger.ts` - Logging de endpoints

### 4.5 Servicios Frontend

**apiClient.ts**: Cliente Axios configurado

- Interceptores para token JWT
- Refresh token automático
- Reintentos con backoff exponencial
- Manejo de errores centralizado

**authService.ts**: Métodos de autenticación

- login, register, logout
- getCurrentUser, updateProfile
- changePassword, requestPasswordReset, resetPassword
- verifyEmail, resendVerificationEmail
- deleteAccount, getActiveSessions, logoutOtherSessions

**postService.ts**: Métodos de posts

- getFeed, getFollowingPosts, getPostById
- createPost, updatePost, deletePost
- toggleLike, getLikeInfo, toggleSave
- getSavedPosts, getUserPosts
- searchPosts, getPopularPosts, getPostsByTag, getPopularTags

**userService.ts**: Métodos de usuarios

- getUserById, getUserByUsername
- updateProfile
- followUser, unfollowUser, toggleFollow
- getFollowers, getFollowing
- searchUsers, getSuggestedUsers, getPopularUsers
- reportUser, blockUser, unblockUser, getBlockedUsers
- isFollowing, getUserStats

### 4.6 Estado Global

- **Context API** (no Redux/Zustand)
- AuthContext para autenticación
- UserContext para datos de usuario
- ThemeContext para temas
- NotificationContext para notificaciones
- Estado local con useState/useReducer en componentes

### 4.7 PWA Features

- **Service Worker** (`public/sw.js`)
- **Manifest** (`public/manifest.json`)
- Configuración en `next.config.js`
- Instalación en dispositivos móviles
- Funcionamiento offline
- Cache de recursos estáticos

### 4.8 Styling

- **Tailwind CSS 3.4.0**
- Configuración en `tailwind.config.js`
- Estilos globales en `styles/globals.css`
- Diseño responsive (mobile-first)
- Tema oscuro por defecto (#0f1419)

---

## 5. Sincronización Front–Back

### 5.1 Endpoints Utilizados por el Frontend

**Autenticación:**

- ✅ `POST /api/auth/login` - Usado en AuthContext
- ✅ `POST /api/auth/register` - Usado en AuthContext
- ✅ `POST /api/auth/logout` - Usado en AuthContext
- ✅ `POST /api/auth/refresh` - Usado en apiClient interceptor
- ✅ `GET /api/profile/me` - Usado en AuthContext

**Posts:**

- ✅ `GET /api/posts/following` - Usado en index.tsx (feed)
- ✅ `GET /api/posts/:id` - Usado en post/[id].tsx
- ✅ `POST /api/posts/:id/like` - Usado en index.tsx
- ✅ `GET /api/posts/user/:userId` - Potencialmente usado
- ✅ `POST /api/posts` - Usado en create.tsx
- ❌ `PUT /api/posts/:id` - Definido en postService pero no confirmado en uso
- ❌ `DELETE /api/posts/:id` - Definido en postService pero no confirmado en uso
- ❌ `GET /api/posts/:id/comments` - Definido en postService pero no confirmado en uso
- ❌ `POST /api/posts/:id/comments` - Definido en postService pero no confirmado en uso
- ❌ `POST /api/posts/:id/save` - Referenciado en postService pero endpoint no existe en backend
- ❌ `GET /api/posts/saved` - Referenciado en postService pero endpoint no existe en backend
- ❌ `GET /api/posts/popular` - Referenciado en postService pero endpoint no existe
- ❌ `GET /api/posts/tag/:tag` - Referenciado en postService pero endpoint no existe
- ❌ `GET /api/posts/tags/popular` - Referenciado en postService pero endpoint no existe

**Boards:**

- ✅ `GET /api/boards/me/boards` - Usado en index.tsx para guardados
- ✅ `POST /api/boards` - Usado en index.tsx para crear board por defecto
- ✅ `POST /api/boards/:id/posts` - Usado en index.tsx para guardar post
- ✅ `DELETE /api/boards/:id/posts/:postId` - Usado en index.tsx para quitar guardado

**Usuarios/Perfil:**

- ✅ `GET /api/profile/:id` - Usado potencialmente en user/[id].tsx
- ✅ `PUT /api/profile/me` - Usado en AuthContext.updateProfile
- ✅ `POST /api/profile/me/avatar` - Potencialmente usado
- ❌ `GET /api/users/:id` - Referenciado en userService pero endpoint es `/api/profile/:id`
- ❌ `GET /api/users/username/:username` - Referenciado en userService pero no existe
- ❌ `PUT /api/users/profile` - Referenciado en userService pero endpoint es `/api/profile/me`
- ❌ `POST /api/users/:userId/follow` - Referenciado en userService pero endpoint es `/api/follow`
- ❌ `DELETE /api/users/:userId/follow` - Referenciado en userService pero endpoint es `/api/follow/:userId`
- ❌ `POST /api/users/:userId/toggle-follow` - Referenciado en userService pero no existe

**Seguimiento:**

- ✅ `POST /api/follow` - Probablemente usado en FollowButton
- ✅ `DELETE /api/follow/:userId` - Probablemente usado
- ✅ `GET /api/follow/following` - Usado en hooks
- ✅ `GET /api/follow/status/:userId` - Potencialmente usado

**Búsqueda:**

- ✅ `GET /api/search` - Potencialmente usado en search.tsx
- ✅ `GET /api/search/artists` - Potencialmente usado
- ✅ `GET /api/search/posts` - Potencialmente usado

### 5.2 Endpoints Backend No Usados en Frontend

- `GET /api/posts` (feed general) - Frontend usa `/following`
- `GET /api/posts/:id/likes` - No encontrado en uso
- `DELETE /api/posts/:id/like` - Frontend usa toggle POST
- `POST /api/posts/upload` - No encontrado en uso directo
- `POST /api/comments/:id/like` - No encontrado en uso
- `GET /api/boards/search` - No encontrado en uso
- `GET /api/boards/categories` - No encontrado en uso
- `GET /api/boards/:id` - No encontrado en uso
- `GET /api/boards/:id/posts` - No encontrado en uso
- `GET /api/boards/user/:userId` - No encontrado en uso
- `POST /api/boards/:id/follow` - No encontrado en uso
- `DELETE /api/boards/:id/follow` - No encontrado en uso
- Varios endpoints de búsqueda avanzada

### 5.3 Funcionalidades Frontend Sin Backend

- ✅ `authService.changePassword` - Endpoint `/api/auth/change-password` ✅ IMPLEMENTADO
- ✅ `authService.requestPasswordReset` - Endpoint `/api/auth/forgot-password` ✅ IMPLEMENTADO
- ✅ `authService.resetPassword` - Endpoint `/api/auth/reset-password` ✅ IMPLEMENTADO
- ✅ `authService.verifyEmail` - Endpoint `/api/auth/verify-email` ✅ IMPLEMENTADO
- ✅ `authService.resendVerificationEmail` - Endpoint `/api/auth/resend-verification` ✅ IMPLEMENTADO
- ✅ `authService.deleteAccount` - Endpoint `/api/auth/account` (DELETE) ✅ IMPLEMENTADO
- ✅ `authService.getActiveSessions` - Endpoint `/api/auth/sessions` ✅ IMPLEMENTADO
- ✅ `authService.logoutOtherSessions` - Endpoint `/api/auth/logout-others` ✅ IMPLEMENTADO
- ⚠️ `postService.toggleSave` - Endpoint `/api/posts/:id/save` no existe (se usa boards como workaround, documentado)
- ⚠️ `postService.getSavedPosts` - Endpoint `/api/posts/saved` no existe (se usa boards como workaround, documentado)
- ⚠️ `postService.getPopularPosts` - Endpoint `/api/posts/popular` no existe (usa `/api/search/trending` como workaround)
- ⚠️ `postService.getPostsByTag` - Endpoint `/api/posts/tag/:tag` no existe (usa `/api/search/posts?tags=...` como workaround)
- ⚠️ `postService.getPopularTags` - Endpoint `/api/posts/tags/popular` no existe (retorna array vacío, documentado)
- ✅ `userService` - ✅ Todas las rutas corregidas (0 rutas incorrectas, métodos sin endpoint documentados)

### 5.4 Plan de Alineación

**Prioridad Alta:**

1. ✅ **COMPLETADO** - Corregir rutas en `userService.ts` para usar `/api/profile` y `/api/follow`
2. ✅ **COMPLETADO** - Implementar endpoints faltantes de autenticación (cambio de contraseña, reset, verificación)
3. ✅ **COMPLETADO** - Documentar endpoints de `postService` que no existen (con workarounds donde es posible)
4. ⏳ **PENDIENTE (Fase 2)** - Implementar funcionalidad de guardar posts (actualmente usando boards como workaround - no crítico)

**Prioridad Media:**

1. Crear endpoint unificado `/api/posts/saved` si se quiere mantener funcionalidad de guardados
2. Implementar endpoints de posts populares y por tags si se necesitan
3. Revisar y alinear endpoints de búsqueda con uso real del frontend

**Prioridad Baja:**

1. Documentar endpoints no usados para posible uso futuro
2. Consolidar endpoints similares (ej: toggle follow vs follow/unfollow)

---

## 6. Plan Técnico Detallado

### 6.1 Prioridades

### **ALTA PRIORIDAD**

1. ✅ **COMPLETADO** - Corrección de Rutas en Servicios Frontend

    - **Archivo**: `Front_pwa/services/userService.ts`
    - **Estado**: ✅ Todas las rutas corregidas (0 rutas incorrectas)
    - **Fecha**: Completado en Fase 1
    - **Verificación**: Ver `Front_pwa/services/VERIFICACION_FINAL.md`

2. ✅ **COMPLETADO** - Implementación de Endpoints de Autenticación

    - **Estado**: ✅ Todos los endpoints están implementados en backend
    - **Archivos**: `Backend/src/routes/authRoutes.js` (líneas 47-97)
    - **Endpoints implementados**:
        - ✅ `PUT /api/auth/change-password` (línea 47)
        - ✅ `POST /api/auth/forgot-password` (línea 55)
        - ✅ `POST /api/auth/reset-password` (línea 62)
        - ✅ `POST /api/auth/verify-email` (línea 69)
        - ✅ `POST /api/auth/resend-verification` (línea 76)
        - ✅ `DELETE /api/auth/account` (línea 94)
        - ✅ `GET /api/auth/sessions` (línea 82)
        - ✅ `POST /api/auth/logout-others` (línea 88)
    - **Frontend**: `Front_pwa/services/authService.ts` - Todos los métodos implementados correctamente

3. ✅ **COMPLETADO** - Documentación de Endpoints Faltantes en postService

    - **Archivo**: `Front_pwa/services/postService.ts`
    - **Estado**: ✅ Todos los métodos sin endpoint documentados correctamente
    - **Workarounds implementados**:
        - `getPopularPosts()` usa `/api/search/trending?type=posts`
        - `getPostsByTag()` usa `/api/search/posts?tags=...`
    - **Métodos documentados**: `toggleSave()`, `getSavedPosts()`, `getPopularTags()`

4. **Implementación de Sistema de Guardados de Posts**

    - **Archivos**: Backend (nuevo endpoint), Frontend (postService)
    - **Problema**: Actualmente se usa boards como workaround
    - **Solución**: Crear endpoints dedicados `/api/posts/:id/save` y `/api/posts/saved`
    - **Estimación**: 6-8 horas
    - **Dependencias**: Modelo de datos (tabla `saved_posts` o similar)

### **MEDIA PRIORIDAD**

1. **Documentación de API Completa**

    - **Archivo**: Nuevo `Backend/API_DOCUMENTATION.md`
    - **Contenido**: Todos los endpoints, parámetros, respuestas, códigos de error
    - **Estimación**: 8-10 horas
    - **Dependencias**: Finalización de correcciones de rutas

2. **Optimización de Queries de Base de Datos**

    - **Archivos**: `Backend/src/services/*Service.js`
    - **Acción**: Revisar y optimizar queries lentas, agregar índices faltantes
    - **Estimación**: 6-8 horas
    - **Dependencias**: Análisis de performance

3. **Implementación de Tests**

    - **Backend**: Tests unitarios de servicios, tests de integración de endpoints
    - **Frontend**: Tests de componentes, hooks, servicios
    - **Estimación**: 20-30 horas
    - **Dependencias**: Configuración de Jest/Vitest

4. **Mejora del Sistema de Notificaciones**

    - **Archivos**: Backend (nuevo módulo), Frontend (NotificationContext)
    - **Acción**: Implementar notificaciones en tiempo real (WebSocket o polling)
    - **Estimación**: 12-16 horas
    - **Dependencias**: WebSocket server o servicio de notificaciones push

### **BAJA PRIORIDAD**

1. **Refactorización de Código Duplicado**

    - **Archivos**: Varios en backend y frontend
    - **Acción**: Extraer lógica común a utilidades
    - **Estimación**: 10-15 horas

2. **Mejora de Manejo de Errores**

    - **Archivos**: Backend (errorHandler), Frontend (apiClient)
    - **Acción**: Estandarizar códigos de error, mejorar mensajes
    - **Estimación**: 6-8 horas

3. **Implementación de Caché Avanzado**

    - **Archivos**: Backend (middlewares), Frontend (service worker)
    - **Acción**: Mejorar estrategias de caché
    - **Estimación**: 8-12 horas

4. **Optimización de Imágenes**

    - **Archivos**: Backend (upload middleware), Frontend (Image component)
    - **Acción**: Implementar lazy loading, formatos modernos (WebP/AVIF)
    - **Estimación**: 6-8 horas

### 6.2 Tareas por Módulo

### **Módulo: Autenticación**

- ✅ Login/Register/Logout/Refresh (implementado)
- ✅ Cambio de contraseña (implementado)
- ✅ Reset de contraseña (implementado)
- ✅ Verificación de email (implementado)
- ✅ Gestión de sesiones (implementado)
- ✅ Eliminación de cuenta (implementado)

### **Módulo: Posts**

- ✅ CRUD básico (implementado)
- ✅ Likes y comentarios (implementado)
- ✅ Feed y filtros (implementado)
- ❌ Sistema de guardados dedicado (falta, usando boards)
- ❌ Posts populares (falta)
- ❌ Posts por tags (falta)
- ❌ Estadísticas avanzadas (falta)

### **Módulo: Usuarios/Perfiles**

- ✅ Ver/editar perfil (implementado)
- ✅ Subir avatar (implementado)
- ✅ Seguir/dejar de seguir (implementado)
- ⚠️ Estadísticas detalladas (parcial - usando getUserById como workaround)
- ❌ Bloqueo de usuarios (documentado - Fase 2)
- ❌ Reportar usuarios (documentado - Fase 2)

### **Módulo: Boards/Colecciones**

- ✅ CRUD de boards (implementado)
- ✅ Agregar/quitar posts (implementado)
- ✅ Seguir boards (implementado)
- ⚠️ Colaboradores (modelo existe, funcionalidad parcial)
- ❌ Compartir boards (falta)

### **Módulo: Búsqueda**

- ✅ Búsqueda global (implementado)
- ✅ Búsqueda por tipo (implementado)
- ✅ Búsqueda avanzada (implementado)
- ✅ Trending (implementado)
- ✅ Artistas cercanos (implementado)
- ⚠️ Búsqueda por voz (referenciado, implementación no confirmada)

### 6.3 Dependencias entre Tareas

```
Corrección de Rutas Frontend
    ↓
Implementación Endpoints Auth
    ↓
Sistema de Guardados
    ↓
Documentación API
    ↓
Optimización DB
    ↓
Tests
```

### 6.4 Recomendaciones de Refactorización

1. **Consolidar Rutas de Usuarios**

    - Unificar `/api/users/*` y `/api/profile/*` en una sola ruta base
    - Mantener compatibilidad hacia atrás durante transición

2. ✅ **COMPLETADO** - Separar Lógica de Negocio

    - ✅ Mover lógica compleja de controladores a servicios
    - ✅ Servicios independientes de Express
    - ✅ Controladores delgados (solo extraen datos y llaman servicios)
    - ✅ Manejo de errores consistente con clases de error personalizadas
    - ✅ Logging estructurado con Winston
    - ✅ Código limpio y mantenible
    - **Archivos creados/modificados**:
        - `Backend/src/utils/errors.js` (nuevo) - Clases de error personalizadas
        - `Backend/src/services/mediaService.js` (nuevo) - Lógica de upload centralizada
        - `Backend/src/middlewares/mediaValidation.js` (nuevo) - Validación de media
        - Todos los servicios refactorizados para lanzar excepciones en lugar de retornar errores
        - Todos los controladores simplificados

3. **Estandarizar Respuestas API**

    - Todas las respuestas deben seguir formato: `{ success, message?, data?, error? }`
    - Códigos HTTP consistentes

4. **Mejorar Manejo de Errores**

    - Clases de error personalizadas
    - Logging estructurado con Winston
    - Mensajes de error amigables al usuario

5. **Optimizar Queries**

    - Usar `include` de Sequelize con `attributes` para evitar over-fetching
    - Implementar paginación en todos los endpoints de listado
    - Agregar índices compuestos para queries frecuentes

6. **TypeScript en Backend**

    - Considerar migrar backend a TypeScript para mejor tipado
    - O al menos usar JSDoc para documentar tipos

7. **Validación Centralizada**

    - Consolidar validaciones en un solo lugar
    - Reutilizar schemas de validación

---

## 7. Contexto Completo del Proyecto

### 7.1 Propósito General

**ArteNis 2.0** es una plataforma social especializada para la comunidad de tatuajes que permite:

- **Tatuadores**: Mostrar su portafolio, gestionar su perfil profesional, recibir interacciones
- **Usuarios/Aficionados**: Descubrir arte, seguir artistas, guardar favoritos, buscar tatuadores cercanos
- **Todos**: Interactuar mediante likes, comentarios, compartir contenido

### 7.2 Actores Principales

1. **Usuario Estándar**: Consumidor de contenido, sigue artistas, guarda posts
2. **Artista (Artist)**: Crea contenido, gestiona portafolio, muestra especialidades y precios
3. **Administrador (Admin)**: Gestión de la plataforma (funcionalidad futura)

### 7.3 Flujo General de Uso

**Para Usuarios:**

1. Registro/Login
2. Explorar feed (posts de usuarios seguidos)
3. Buscar artistas/tatuajes
4. Seguir artistas de interés
5. Ver perfil de artista
6. Guardar posts en colecciones
7. Interactuar (like, comentar)

**Para Artistas:**

1. Registro como artista
2. Configurar perfil profesional (especialidades, precios, ubicación)
3. Subir trabajos (posts con imágenes/videos)
4. Crear colecciones temáticas (boards)
5. Gestionar interacciones
6. Ver estadísticas (views, likes)

### 7.4 Riesgos Técnicos

1. **Escalabilidad de Base de Datos**

    - **Riesgo**: Queries sin optimizar pueden causar lentitud con muchos usuarios
    - **Mitigación**: Implementar índices, usar caché, considerar read replicas

2. **Almacenamiento de Archivos**

    - **Riesgo**: Cloudinary puede ser costoso con alto volumen
    - **Mitigación**: Optimizar compresión, considerar CDN alternativo

3. **Autenticación JWT**

    - **Riesgo**: Tokens en localStorage vulnerables a XSS
    - **Mitigación**: Considerar httpOnly cookies para producción, implementar refresh tokens correctamente

4. **Rate Limiting**

    - **Riesgo**: API vulnerable a abuso sin rate limiting adecuado
    - **Mitigación**: Implementar rate limiting más estricto en producción

5. **Sincronización Front-Back**

    - **Riesgo**: Endpoints no alineados causan errores
    - **Mitigación**: Implementar plan de alineación priorizado

### 7.5 Oportunidades de Optimización

1. **Performance**

    - Lazy loading de imágenes
    - Code splitting en Next.js
    - Service Worker más agresivo para caché offline
    - Implementar GraphQL para reducir over-fetching

2. **UX/UI**

    - Mejorar feedback visual (loading states)
    - Implementar skeleton screens
    - Optimizar animaciones con Framer Motion
    - Mejorar diseño responsive

3. **SEO**

    - Meta tags dinámicos en Next.js
    - Sitemap y robots.txt
    - Open Graph tags para compartir

4. **Monitoreo**

    - Implementar logging estructurado
    - Métricas de performance (Web Vitals)
    - Error tracking (Sentry o similar)
    - Analytics de uso

5. **Seguridad**

    - Validación más estricta de inputs
    - Sanitización de contenido
    - HTTPS obligatorio en producción
    - CSP headers más restrictivos

### 7.6 Stack Tecnológico Completo

**Backend:**

- Runtime: Node.js 18+
- Framework: Express 4.18.2
- ORM: Sequelize 6.35.1
- DB: MySQL 5.7+/8.0+
- Auth: JWT (jsonwebtoken 9.0.2)
- Storage: Cloudinary 1.41.3
- Validation: Joi 17.11.0, express-validator 7.0.1
- Security: Helmet 7.1.0, bcryptjs 2.4.3
- Logging: Winston 3.11.0
- Upload: Multer 1.4.5-lts.1
- Performance: compression 1.7.4, memory-cache 0.2.0

**Frontend:**

- Framework: Next.js 14.0.4 (React 18.2.0)
- Language: TypeScript 5.3.3
- Styling: Tailwind CSS 3.4.0
- HTTP Client: Axios 1.6.2
- Animations: Framer Motion 10.16.16, GSAP 3.13.0
- Icons: Lucide React 0.303.0
- PWA: Service Worker, Manifest

**DevOps/Herramientas:**

- Package Manager: npm
- Code Quality: ESLint
- Version Control: Git
- Environment: dotenv

---

## 8. Conclusión y Próximos Pasos

### Estado Actual del Proyecto

El proyecto **ArteNis 2.0** está en un estado funcional avanzado con:

- ✅ Backend funcional con arquitectura sólida y separación de responsabilidades completa
- ✅ Frontend PWA implementado con Next.js
- ✅ Autenticación y autorización completa (todos los endpoints implementados)
- ✅ CRUD de posts, boards, usuarios
- ✅ **Fase 1 COMPLETADA**: Alineación front-back al 100% (todas las rutas corregidas)
- ✅ **Separación de lógica de negocio**: Completada y verificada
- ⚠️ Funcionalidades Fase 2 pendientes (no críticas, hay workarounds):
  - Sistema de guardados dedicado (actualmente usando boards)
  - Endpoints de usuarios (seguidores, bloqueo, reportes)

### Progreso por Fase

1. ✅ **Fase 1 COMPLETADA**: Corrección de rutas y alineación front-back

   - Verificación: `Front_pwa/services/VERIFICACION_FINAL.md`

2. ✅ **Fase 1.5 COMPLETADA**: Separación de lógica de negocio

   - Servicios independientes, manejo de errores estandarizado

3. **Fase 2 (Pendiente)**: Sistema de guardados dedicado (opcional, hay workaround)
4. **Fase 3 (Pendiente)**: Optimización, tests, documentación completa

### Notas Finales

- El código muestra buenas prácticas arquitectónicas (separación de responsabilidades, servicios)
- Hay oportunidades de mejora en sincronización y completitud de funcionalidades
- La base es sólida para escalar con las optimizaciones sugeridas