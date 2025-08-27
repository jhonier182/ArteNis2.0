# Estructura de Rutas de ArteNis API

## 📁 Organización de Rutas

Las rutas han sido separadas en archivos especializados para mejorar la mantenibilidad y organización del código. **Cada controlador tiene sus propias rutas**.

### 🔐 Rutas de Autenticación (`/api/auth`)
**Archivo:** `authRoutes.js`
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar tokens
- `POST /api/auth/logout` - Cerrar sesión

### 👤 Rutas de Perfil (`/api/profile`)
**Archivo:** `profileRoutes.js`
- `GET /api/profile/me` - Obtener perfil del usuario autenticado
- `PUT /api/profile/me` - Actualizar perfil del usuario
- `POST /api/profile/me/avatar` - Subir avatar del usuario
- `GET /api/profile/:id` - Obtener usuario por ID

### 🔍 Rutas de Búsqueda (`/api/search`)
**Archivo:** `searchRoutes.js`
- `GET /api/search` - Búsqueda global
- `GET /api/search/users` - Buscar usuarios
- `GET /api/search/artists` - Buscar artistas
- `GET /api/search/posts` - Buscar publicaciones
- `GET /api/search/boards` - Buscar tableros
- `GET /api/search/trending` - Contenido trending
- `GET /api/search/nearby` - Artistas cercanos
- `GET /api/search/suggestions` - Sugerencias de búsqueda
- `GET /api/search/filters` - Filtros populares
- `POST /api/search/voice` - Búsqueda por voz
- `POST /api/search/advanced` - Búsqueda avanzada

### 👥 Rutas de Seguimiento (`/api/follow`)
**Archivo:** `followRoutes.js`
- `POST /api/follow` - Seguir usuario
- `DELETE /api/follow/:userId` - Dejar de seguir usuario
- `GET /api/follow/following` - Obtener usuarios que sigues

## 🔄 Compatibilidad Total

### Rutas Originales (Mantenidas)
Todas las rutas originales siguen funcionando exactamente igual:
- `POST /api/users/register` → Redirige a `POST /api/auth/register`
- `POST /api/users/login` → Redirige a `POST /api/auth/login`
- `GET /api/users/me/profile` → Redirige a `GET /api/profile/me`
- `PUT /api/users/me/profile` → Redirige a `PUT /api/profile/me`
- `POST /api/users/me/avatar` → Redirige a `POST /api/profile/me/avatar`
- `GET /api/users/:id` → Redirige a `GET /api/profile/:id`
- `GET /api/users/search` → Redirige a `GET /api/search/users`
- `POST /api/users/follow` → Redirige a `POST /api/follow`
- `DELETE /api/users/:userId/follow` → Redirige a `DELETE /api/follow/:userId`
- `GET /api/users/following` → Redirige a `GET /api/follow/following`
- `POST /api/users/logout` → Redirige a `POST /api/auth/logout`

### Nuevas Rutas Organizadas
También puedes usar las nuevas rutas organizadas directamente:
- `POST /api/auth/register` (en lugar de `/api/users/register`)
- `GET /api/profile/me` (en lugar de `/api/users/me/profile`)
- `POST /api/follow` (en lugar de `/api/users/follow`)

## 🏗️ Estructura de Archivos

```
📁 routes/
├── 🔐 authRoutes.js      → Rutas de autenticación
├── 👤 profileRoutes.js   → Rutas de perfil
├── 🔍 searchRoutes.js    → Rutas de búsqueda
├── 👥 followRoutes.js    → Rutas de seguimiento
└── 📖 README.md          → Esta documentación
```

## 🎯 Beneficios de la Separación

✅ **Mantenibilidad**: Cada archivo maneja un dominio específico
✅ **Organización**: Código más limpio y fácil de navegar
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
✅ **Testabilidad**: Cada conjunto de rutas puede ser testeado independientemente
✅ **Compatibilidad Total**: Las rutas existentes siguen funcionando sin cambios

## 🔧 Uso en el Frontend

### Opción 1: Usar rutas originales (recomendado para compatibilidad)
```javascript
// Estas seguirán funcionando exactamente igual
const response = await fetch('/api/users/login', {
  method: 'POST',
  body: JSON.stringify({ identifier, password })
});
```

### Opción 2: Usar nuevas rutas organizadas
```javascript
// Nuevas rutas más organizadas
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ identifier, password })
});
```

## 📝 Notas Importantes

1. **No hay cambios en la funcionalidad**: Todas las respuestas y comportamientos son idénticos
2. **No hay cambios en los middlewares**: Se mantienen las mismas validaciones y autenticación
3. **No hay cambios en los controladores**: Se mantiene la misma lógica de negocio
4. **Compatibilidad total**: El frontend existente no necesita modificaciones
5. **Rutas duplicadas eliminadas**: Ya no hay confusión entre rutas

## 🚀 Migración

La migración es **automática y transparente**. No se requiere ningún cambio en el frontend o en las aplicaciones que consuman la API.

## 🔍 Verificación de Rutas

Puedes verificar que todas las rutas funcionan igual:

```bash
# Autenticación (rutas originales)
POST /api/users/register     → Funciona
POST /api/users/login        → Funciona
POST /api/users/logout       → Funciona

# Perfil (rutas originales)
GET /api/users/me/profile    → Funciona
PUT /api/users/me/profile    → Funciona
GET /api/users/:id           → Funciona

# Búsqueda (rutas originales)
GET /api/users/search        → Funciona

# Seguimiento (rutas originales)
POST /api/users/follow       → Funciona
DELETE /api/users/:id/follow → Funciona
GET /api/users/following     → Funciona

# Nuevas rutas organizadas
POST /api/auth/register      → Funciona
GET /api/profile/me          → Funciona
POST /api/follow             → Funciona
GET /api/search/users        → Funciona
```

**Todas estas rutas mantienen exactamente la misma funcionalidad y comportamiento.**
