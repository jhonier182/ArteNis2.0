# 🔧 Ajustes Frontend-Backend

## ✅ Análisis de Sincronización

### Backend Endpoints Disponibles:
- ✅ POST `/api/auth/register`
- ✅ POST `/api/auth/login`
- ✅ POST `/api/auth/refresh`
- ✅ POST `/api/auth/logout`
- ✅ GET `/api/profile/me`
- ✅ PUT `/api/profile/me`
- ✅ POST `/api/profile/me/avatar`
- ✅ GET `/api/posts` (Feed)
- ✅ POST `/api/posts/:id/like`
- ✅ DELETE `/api/posts/:id/like`
- ✅ GET `/api/posts/:id/comments`
- ✅ POST `/api/posts/:id/comments`

## 🔄 Ajustes Necesarios en el Frontend

### 1. Modelo de Usuario
**Backend espera:**
- `userType`: 'user' | 'artist' | 'admin' (ENUM)

**Frontend envía:**
- `userType`: 'artist' | 'tattoo_artist' | 'client'

**ACCIÓN:** Mapear tipos de usuario correctamente

### 2. Estructura de Respuestas
**Backend devuelve:**
```json
{
  "success": true,
  "message": "...",
  "data": {
    "user": {...},
    "token": "...",
    "refreshToken": "..."
  }
}
```

**Frontend espera:** ✅ Compatible

### 3. Posts
**Backend devuelve en GET /api/posts:**
- Incluye información del autor completa
- Campos: `likesCount`, `commentsCount`, `viewsCount`

**Frontend necesita:**
- Mapear `content` → `description` o `title`
- Mapear `imageUrl` → `mediaUrl`

### 4. Campos Adicionales del Usuario
**Backend tiene campos que no usamos:**
- `city`, `state`, `country`
- `latitude`, `longitude`
- `specialties` (JSON)
- `portfolioImages` (JSON)
- `rating`, `experience`
- `socialLinks`

**Oportunidad:** Podemos agregar estos campos al perfil
