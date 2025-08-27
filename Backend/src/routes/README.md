# 🗺️ Rutas de ArteNis API

## 🔐 Autenticación (`/api/auth`)
- `POST /register` - Crear cuenta
- `POST /login` - Iniciar sesión  
- `POST /refresh` - Renovar token
- `POST /logout` - Cerrar sesión

## 👤 Perfil (`/api/profile`)
- `GET /me` - Ver mi perfil
- `PUT /me` - Editar mi perfil
- `POST /me/avatar` - Cambiar foto
- `GET /:id` - Ver perfil de otro usuario

## 🔍 Búsqueda (`/api/search`)
- `GET /` - Búsqueda general
- `GET /users` - Buscar usuarios
- `GET /artists` - Buscar artistas
- `GET /posts` - Buscar publicaciones
- `GET /boards` - Buscar tableros
- `GET /trending` - Contenido popular
- `GET /nearby` - Artistas cercanos

## 👥 Seguimiento (`/api/follow`)
- `POST /` - Seguir usuario
- `DELETE /:userId` - Dejar de seguir
- `GET /following` - Ver a quién sigo

## 📝 Publicaciones (`/api/posts`)
- `GET /` - Ver todas las publicaciones
- `GET /following` - Posts de usuarios que sigo
- `GET /user/:userId` - Posts de un usuario
- `GET /user/me` - Mis posts
- `POST /` - Crear post
- `POST /upload` - Subir imagen/video
- `PUT /:id` - Editar post
- `DELETE /:id` - Eliminar post
- `POST /:id/like` - Dar/quitar like
- `POST /track-views` - Registrar vistas
- `GET /saved` - Posts guardados
- `POST /:id/save` - Guardar post
- `DELETE /:id/save` - Quitar de guardados
- `GET /:id/comments` - Ver comentarios
- `POST /:id/comments` - Crear comentario

## 💬 Comentarios (`/api/comments`)
- `POST /:id/like` - Dar/quitar like a comentario

## 🎯 Tableros (`/api/boards`)
- `GET /` - Ver todos los tableros
- `POST /` - Crear tablero
- `GET /:id` - Ver tablero específico
- `PUT /:id` - Editar tablero
- `DELETE /:id` - Eliminar tablero

## 🏥 Sistema
- `GET /` - Documentación de la API
- `GET /health` - Estado del sistema
