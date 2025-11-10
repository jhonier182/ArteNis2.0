<!-- 7fb7341f-5ea5-40af-82e4-0188cee983bf edc852ca-c301-414c-a315-914f183f7a06 -->
# Solución: Parpadeo Doble en Posts del Perfil de Usuario

## Problema Identificado

Los posts del perfil de usuario parpadeaban dos veces al cargar, causando una experiencia visual deficiente. Los logs mostraban que `fetchPosts` se ejecutaba dos veces simultáneamente, resultando en:

- Dos llamadas API duplicadas
- Dos actualizaciones de estado (`setNextCursor` y `setPosts`)
- Múltiples re-renders del componente

## Causa Raíz

**Condición de carrera en el useEffect**: Cuando el `useEffect` se ejecutaba múltiples veces (por React StrictMode o re-mounts), ambas ejecuciones pasaban la verificación `!isFetchingRef.current` ANTES de que ninguna pudiera marcarlo como `true`. Esto permitía que ambas ejecuciones llamaran a `fetchPosts` simultáneamente.

## Solución Implementada

### 1. Prevención de Condición de Carrera (Hook useUserPosts.ts)

**Ubicación**: `Front_pwa2/src/features/profile/hooks/useUserPosts.ts`

**Cambio crítico**: Marcar `isFetchingRef.current = true` INMEDIATAMENTE en el `useEffect` ANTES de llamar a `fetchPosts`:

```typescript
// Líneas 217-228
if (userId && !hasLoadedRef.current && !isFetchingRef.current && fetchPostsRef.current) {
  // MARCAR INMEDIATAMENTE para prevenir ejecuciones duplicadas
  isFetchingRef.current = true
  // NO marcar hasLoadedRef aquí - se marcará cuando la carga se complete exitosamente
  
  console.log('[useUserPosts] 🚀 Iniciando carga inicial de posts (isFetching marcado)')
  
  // Llamar a fetchPosts después de marcar el flag
  fetchPostsRef.current(null)
}
```

**Por qué funciona**: Al marcar el flag ANTES de la llamada, cualquier ejecución posterior del `useEffect` verá `isFetchingRef.current === true` y omitirá la carga.

### 2. Verificación Mejorada en fetchPosts

**Ubicación**: `Front_pwa2/src/features/profile/hooks/useUserPosts.ts`

**Cambio**: Verificación adicional para casos donde `cursor === null` (carga inicial):

```typescript
// Líneas 53-65
if (isFetchingRef.current && cursor === null) {
  console.log('[useUserPosts] ⚠️ fetchPosts: Ya está cargando (cursor=null), ignorando')
  return
}
```

### 3. No Limpiar Posts Antes de Cargar Nuevos

**Ubicación**: `Front_pwa2/src/features/profile/hooks/useUserPosts.ts`

**Cambio**: Cuando cambia el `userId`, NO limpiar posts en el `useEffect` para evitar flickering:

```typescript
// Líneas 199-215
if (lastUserIdRef.current !== userId) {
  // NO limpiar posts aquí - se reemplazarán cuando lleguen los nuevos
  // Esto evita que los posts desaparezcan y reaparezcan (flickering)
  lastUserIdRef.current = userId
  // ... otros estados se limpian pero posts se mantienen
}
```

**Por qué funciona**: Los posts antiguos se mantienen visibles hasta que los nuevos datos lleguen, luego se reemplazan atómicamente en `fetchPosts` (línea 98).

### 4. Actualización Atómica de Estados

**Ubicación**: `Front_pwa2/src/features/profile/hooks/useUserPosts.ts`

**Cambio**: Actualizar `setNextCursor` y `setPosts` en el mismo tick para evitar parpadeo:

```typescript
// Líneas 92-98 (primera carga)
setNextCursor(result.nextCursor)
setPosts(result.posts)
```

React 18 agrupa automáticamente estas actualizaciones cuando están en el mismo tick, pero al hacerlas secuencialmente garantizamos que se ejecuten juntas.

### 5. Carga Silenciosa de Páginas Siguientes

**Ubicación**: `Front_pwa2/src/features/profile/hooks/useUserPosts.ts`

**Cambio**: Solo mostrar `loading` si es la primera carga o no hay posts:

```typescript
// Líneas 68-75
const shouldShowLoading = cursor === null || !hasPostsRef.current
if (shouldShowLoading) {
  setLoading(true)
} else {
  // Carga silenciosa - no mostrar spinner
}
```

### 6. Optimización del Componente (PublicUserProfilePage.tsx)

**Ubicación**: `Front_pwa2/src/features/profile/pages/PublicUserProfilePage.tsx`

**Cambios**:

- Memoización de `uniquePosts` con `useMemo` (líneas 53-71)
- Memoización de `showInitialLoading` con `useMemo` (líneas 82-86)
- Memoización de `handlePostClick` con `useCallback` (líneas 74-76)

Estas optimizaciones reducen re-renders innecesarios del componente.

## Configuración Adicional

### Deshabilitar React StrictMode

**Ubicación**: `Front_pwa2/next.config.js`

**Cambio**: `reactStrictMode: false` para evitar ejecuciones dobles en desarrollo.

## Resultado

- Una sola llamada a `fetchPosts` por carga inicial
- Una sola llamada API
- Una sola actualización de estado
- Sin parpadeo visual
- Transición suave entre perfiles
- Carga silenciosa de páginas siguientes

## Notas de Implementación

1. Los logs de depuración están presentes en el código actual. Pueden removerse en producción.
2. La solución usa refs para estado que no debe causar re-renders.
3. El patrón de "marcar antes de llamar" es crítico para prevenir condiciones de carrera.
4. La carga silenciosa mejora la UX al no mostrar spinners durante el scroll infinito.