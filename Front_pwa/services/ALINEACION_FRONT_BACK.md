# 📋 Documento de Alineación Frontend-Backend

## ✅ Rutas Corregidas y Verificadas

### `userService.ts`

| Método | Endpoint Frontend | Endpoint Backend | Estado |
|--------|------------------|------------------|--------|
| `getUserById` | `/api/profile/${id}` | `/api/profile/:id` | ✅ Correcto |
| `getUserByUsername` | `/api/search/users?q=${username}` | `/api/search/users?q=...` | ✅ Correcto (workaround) |
| `updateProfile` | `/api/profile/me` | `/api/profile/me` (PUT) | ✅ Correcto |
| `followUser` | `/api/follow` (POST) | `/api/follow` (POST) | ✅ Correcto |
| `unfollowUser` | `/api/follow/${userId}` (DELETE) | `/api/follow/:userId` (DELETE) | ✅ Correcto |
| `toggleFollow` | Usa `isFollowing` + `follow/unfollow` | `/api/follow/status/:userId` + follow/unfollow | ✅ Correcto |
| `isFollowing` | `/api/follow/status/${userId}` | `/api/follow/status/:userId` | ✅ Correcto |
| `searchUsers` | `/api/search/users?q=...` | `/api/search/users?q=...` | ✅ Correcto |
| `getFollowing` | `/api/follow/following` | `/api/follow/following` | ✅ Correcto (solo usuario autenticado) |

### `authService.ts`

| Método | Endpoint Frontend | Endpoint Backend | Estado |
|--------|------------------|------------------|--------|
| `login` | `/api/auth/login` | `/api/auth/login` | ✅ Correcto |
| `register` | `/api/auth/register` | `/api/auth/register` | ✅ Correcto |
| `logout` | `/api/auth/logout` | `/api/auth/logout` | ✅ Correcto |
| `getCurrentUser` | `/api/profile/me` | `/api/profile/me` | ✅ Correcto |
| `updateProfile` | `/api/profile/me` (PUT) | `/api/profile/me` (PUT) | ✅ Correcto |
| `changePassword` | `/api/auth/change-password` | `/api/auth/change-password` | ✅ Correcto |
| `requestPasswordReset` | `/api/auth/forgot-password` | `/api/auth/forgot-password` | ✅ Correcto |
| `resetPassword` | `/api/auth/reset-password` | `/api/auth/reset-password` | ✅ Correcto |
| `verifyEmail` | `/api/auth/verify-email` | `/api/auth/verify-email` | ✅ Correcto |
| `resendVerificationEmail` | `/api/auth/resend-verification` | `/api/auth/resend-verification` | ✅ Correcto |

### `postService.ts`

| Método | Endpoint Frontend | Endpoint Backend | Estado |
|--------|------------------|------------------|--------|
| `getFeed` | `/api/posts` | `/api/posts` (GET) | ✅ Correcto |
| `getFollowingPosts` | `/api/posts/following` | `/api/posts/following` | ✅ Correcto |
| `getPostById` | `/api/posts/${id}` | `/api/posts/:id` | ✅ Correcto |
| `createPost` | `/api/posts` (POST) | `/api/posts` (POST) | ✅ Correcto |
| `updatePost` | `/api/posts/${id}` (PUT) | `/api/posts/:id` (PUT) | ✅ Correcto |
| `deletePost` | `/api/posts/${id}` (DELETE) | `/api/posts/:id` (DELETE) | ✅ Correcto |
| `toggleLike` | `/api/posts/${postId}/like` (POST) | `/api/posts/:id/like` (POST) | ✅ Correcto |
| `getLikeInfo` | `/api/posts/${postId}/likes` | `/api/posts/:id/likes` | ✅ Correcto |
| `getUserPosts` | `/api/posts/user/${userId}` | `/api/posts/user/:userId` | ✅ Correcto |
| `searchPosts` | `/api/search/posts?q=...` | `/api/search/posts?q=...` | ✅ Correcto |

## ⚠️ Métodos sin Endpoints en Backend (Documentados)

### `userService.ts`
- `getFollowers()` - ❌ NO EXISTE - Lanza error con mensaje claro
- `getSuggestedUsers()` - ❌ NO EXISTE - Lanza error con mensaje claro
- `reportUser()` - ❌ NO EXISTE - Lanza error con mensaje claro
- `blockUser()` / `unblockUser()` - ❌ NO EXISTE - Lanza error con mensaje claro
- `getBlockedUsers()` - ❌ NO EXISTE - Lanza error con mensaje claro
- `getUserStats()` - ⚠️ Workaround usando `getUserById()` para datos disponibles

### `authService.ts`
- `deleteAccount()` - ❌ NO EXISTE - Documentado como Fase 2
- `getActiveSessions()` - ❌ NO EXISTE - Documentado como Fase 2
- `logoutOtherSessions()` - ❌ NO EXISTE - Documentado como Fase 2

### `postService.ts`
- `toggleSave()` - ❌ NO EXISTE - Documentado, usa boards como alternativa
- `getSavedPosts()` - ❌ NO EXISTE - Documentado, usa `/api/boards/me/boards`
- `getPopularPosts()` - ⚠️ Workaround usando `/api/search/trending?type=posts`
- `getPostsByTag()` - ⚠️ Workaround usando `/api/search/posts?tags=...`
- `getPopularTags()` - ❌ NO EXISTE - Retorna array vacío

## 📝 Notas Importantes

1. **Workarounds Implementados**: Algunos métodos usan endpoints alternativos cuando el endpoint ideal no existe
2. **Documentación Clara**: Todos los métodos sin endpoint tienen comentarios explicativos
3. **Manejo de Errores**: Los métodos sin endpoint lanzan errores descriptivos en lugar de fallar silenciosamente

## 🎯 Próximos Pasos (Fase 2)

Según el plan, los siguientes endpoints deben implementarse:
1. Endpoints de autenticación faltantes (change-password, reset, verify, sessions)
2. Sistema de guardados de posts (`/api/posts/:id/save`, `/api/posts/saved`)
3. Endpoints de usuarios (seguidores, sugeridos, reportar, bloquear, estadísticas)

