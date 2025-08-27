# Estructura de Rutas de ArteNis API

## 📁 Organización de Rutas

Las rutas han sido separadas en archivos especializados para mejorar la mantenibilidad y organización del código, pero **las rutas principales mantienen exactamente los mismos endpoints**.

### 🔐 Controlador de Autenticación (`AuthController`)
**Archivo:** `authController.js`
- `POST /api/users/register` - Registrar nuevo usuario
- `POST /api/users/login` - Iniciar sesión
- `POST /api/users/refresh` - Refrescar tokens
- `POST /api/users/logout` - Cerrar sesión

### 👤 Controlador de Perfil (`ProfileController`)
**Archivo:** `profileController.js`
- `GET /api/users/me/profile` - Obtener perfil del usuario autenticado
- `PUT /api/users/me/profile` - Actualizar perfil del usuario
- `POST /api/users/me/avatar` - Subir avatar del usuario
- `GET /api/users/:id` - Obtener usuario por ID

### 🔍 Controlador de Búsqueda (`SearchController`)
**Archivo:** `searchController.js`
- `GET /api/users/search` - Buscar usuarios

### 👥 Controlador de Seguimiento (`FollowController`)
**Archivo:** `followController.js`
- `POST /api/users/follow` - Seguir usuario
- `DELETE /api/users/:userId/follow` - Dejar de seguir usuario
- `GET /api/users/following` - Obtener usuarios que sigues

## 🔄 Compatibilidad Total

### Rutas Originales (100% Idénticas)
Todas las rutas originales funcionan **exactamente igual**:
- `POST /api/users/register` → **Misma ruta, mismo comportamiento**
- `POST /api/users/login` → **Misma ruta, mismo comportamiento**
- `GET /api/users/me/profile` → **Misma ruta, mismo comportamiento**
- `POST /api/users/follow` → **Misma ruta, mismo comportamiento**
- `DELETE /api/users/:userId/follow` → **Misma ruta, mismo comportamiento**
- `GET /api/users/following` → **Misma ruta, mismo comportamiento**
- `GET /api/users/:id` → **Misma ruta, mismo comportamiento**
- `POST /api/users/logout` → **Misma ruta, mismo comportamiento**

## 🏗️ Estructura de Archivos

```
📁 routes/
├── 🔐 authRoutes.js      → Rutas de autenticación (para referencia)
├── 👤 profileRoutes.js   → Rutas de perfil (para referencia)
├── 🔍 searchRoutes.js    → Rutas de búsqueda (para referencia)
├── 👥 followRoutes.js    → Rutas de seguimiento (para referencia)
├── 🛣️ userRoutes.js      → Rutas principales (usa controladores especializados)
└── 📖 README.md          → Esta documentación
```

## 🎯 Beneficios de la Separación

✅ **Mantenibilidad**: Cada controlador maneja un dominio específico
✅ **Organización**: Código más limpio y fácil de navegar
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
✅ **Testabilidad**: Cada controlador puede ser testeado independientemente
✅ **Compatibilidad Total**: **0% de cambios en las rutas o funcionalidad**

## 🔧 Uso en el Frontend

### Sin Cambios (Recomendado)
```javascript
// Estas rutas funcionan exactamente igual que antes
const response = await fetch('/api/users/login', {
  method: 'POST',
  body: JSON.stringify({ identifier, password })
});

const profileResponse = await fetch('/api/users/me/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

const followResponse = await fetch('/api/users/follow', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ userId: '123' })
});
```

## 📝 Notas Importantes

1. **Rutas 100% idénticas**: No hay cambios en los endpoints
2. **Funcionalidad 100% idéntica**: No hay cambios en el comportamiento
3. **Middlewares idénticos**: Se mantienen las mismas validaciones y autenticación
4. **Controladores especializados**: La lógica está mejor organizada internamente
5. **Compatibilidad total**: El frontend existente no necesita modificaciones

## 🚀 Migración

**NO HAY MIGRACIÓN NECESARIA**. Las rutas funcionan exactamente igual que antes. Solo se mejoró la organización interna del código.

## 🔍 Verificación de Rutas

Puedes verificar que todas las rutas funcionan igual:

```bash
# Autenticación
POST /api/users/register
POST /api/users/login
POST /api/users/refresh
POST /api/users/logout

# Perfil
GET /api/users/me/profile
PUT /api/users/me/profile
POST /api/users/me/avatar
GET /api/users/:id

# Búsqueda
GET /api/users/search

# Seguimiento
POST /api/users/follow
DELETE /api/users/:userId/follow
GET /api/users/following
```

**Todas estas rutas mantienen exactamente la misma funcionalidad y comportamiento.**
