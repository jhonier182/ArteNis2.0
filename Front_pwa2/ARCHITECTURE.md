# 🏗️ Documentación de Arquitectura - ArteNis 2.0

## Visión General

ArteNis 2.0 utiliza una **arquitectura feature-based modular** combinada con principios de **Atomic Design**, diseñada para escalar de manera sostenible mientras mantiene el código organizado y mantenible.

---

## Principios Arquitectónicos

### 1. **Feature-Based Organization**

Cada dominio funcional (auth, posts, profile, appointments) es un módulo independiente que contiene todo lo necesario para funcionar:

- **Páginas**: Rutas y vistas específicas
- **Componentes**: UI específica de la feature
- **Hooks**: Lógica reutilizable
- **Servicios**: Llamadas al API
- **Tipos**: Interfaces TypeScript (opcional)

**Beneficios:**
- Fácil localización de código relacionado
- Módulos independientes y testeable
- Escalabilidad sin afectar otras features

### 2. **Separación de Concerns**

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Components, Pages, Hooks)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Business Logic              │
│      (Services, Context)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Data Layer                   │
│    (apiClient, Storage, Utils)      │
└─────────────────────────────────────┘
```

### 3. **Composición sobre Herencia**

- Componentes pequeños y reutilizables
- Composición de componentes para crear features más complejas
- Evitar componentes "Dios"

---

## Capas de la Arquitectura

### Capa 1: Entry Point (`/src/app`)

**Responsabilidad**: Configuración global, providers, layouts.

**Componentes:**
- `layout.tsx`: Layout raíz con providers
- `page.tsx`: Página principal
- `providers.tsx`: Wrapper de contextos

### Capa 2: Features (`/src/features`)

**Responsabilidad**: Lógica de negocio y UI por dominio.

**Estructura típica:**
```
feature/
├── pages/          # Páginas específicas (opcional si usas App Router)
├── components/     # Componentes específicos de la feature
├── hooks/          # Hooks personalizados (ej: usePosts)
├── services/       # Servicios API (ej: postService)
└── types/          # Tipos TypeScript (opcional)
```

**Ejemplo - Feature Posts:**
- `services/postService.ts`: Llamadas al API
- `hooks/usePosts.ts`: Hook que usa el servicio
- `components/PostCard.tsx`: Componente UI
- `pages/feed.tsx`: Página del feed (si usa Pages Router)

### Capa 3: Shared Components (`/src/components/ui`)

**Responsabilidad**: Componentes UI reutilizables sin lógica de negocio.

**Principios:**
- Componentes "tontos" (presentational)
- Props bien definidas
- Sin dependencias de features específicas

**Ejemplos:**
- `Button`, `Input`, `Card`, `Modal`, `LoadingSpinner`

### Capa 4: Global State (`/src/context`)

**Responsabilidad**: Estado global compartido entre features.

**Contextos incluidos:**
- `AuthContext`: Autenticación global
- `ThemeContext`: Tema (light/dark)

**Cuándo usar Context vs Estado Local:**
- **Context**: Datos compartidos globalmente (usuario, tema)
- **Estado Local**: Datos específicos de un componente

### Capa 5: Services (`/src/services`)

**Responsabilidad**: Servicios base reutilizables.

**Servicios:**
- `apiClient.ts`: Cliente HTTP con interceptores

### Capa 6: Utilities (`/src/utils`)

**Responsabilidad**: Funciones puras y helpers.

**Utilidades:**
- `config.ts`: Configuración centralizada
- `storage.ts`: Wrapper de localStorage
- `formatters.ts`: Formateo de datos
- `validators.ts`: Validación

---

## Flujo de Datos

### 1. Componente → Hook → Service → API

```
Component (PostCard)
    ↓
Hook (usePosts)
    ↓
Service (postService)
    ↓
apiClient.getClient()
    ↓
Backend API
```

**Ejemplo:**

```typescript
// Component
function PostList() {
  const { posts, loading } = usePosts()
  // ...
}

// Hook
function usePosts() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    postService.getPosts().then(setPosts)
  }, [])
}

// Service
export const postService = {
  getPosts: () => apiClient.getClient().get('/posts')
}
```

### 2. Componente → Context → Service → API

```
Component
    ↓
useAuth (Context)
    ↓
authService
    ↓
apiClient
    ↓
Backend API
```

---

## Gestión de Estado

### Estado Local (useState)

Para datos que solo importan a un componente:

```typescript
const [isOpen, setIsOpen] = useState(false)
```

### Estado Compartido (Context)

Para datos compartidos globalmente:

```typescript
const { user, login } = useAuth()
```

### Estado del Servidor (SWR/React Query - Futuro)

Para datos del servidor con caché:
- Considerar SWR o React Query para mejor gestión
- Actualmente se usa fetch directo en hooks

---

## Manejo de Errores

### Niveles de Manejo

1. **Servicio**: Captura errores del API
2. **Hook**: Maneja estados de error
3. **Componente**: Muestra UI de error

**Ejemplo:**

```typescript
// Service
async getPosts() {
  try {
    return await apiClient.getClient().get('/posts')
  } catch (error) {
    throw new Error('Error al cargar posts')
  }
}

// Hook
const { error, loading, posts } = usePosts()

// Component
{error && <ErrorMessage message={error.message} />}
```

---

## Routing

### Next.js Pages Router (Actual)

Rutas basadas en archivos en `/pages`:
- `/pages/login.tsx` → `/login`
- `/pages/posts/[id].tsx` → `/posts/:id`

### Next.js App Router (Futuro)

Migración preparada a `/src/app`:
- `/app/login/page.tsx` → `/login`
- `/app/posts/[id]/page.tsx` → `/posts/:id`

---

## Internacionalización (i18n)

### Estructura

Archivos JSON en `/src/locales/`:
- `es.json`: Español
- `en.json`: Inglés

### Uso (cuando se implemente)

```typescript
import { useTranslation } from 'next-i18next'

const { t } = useTranslation('common')
return <h1>{t('loading')}</h1>
```

---

## Testing Strategy (Futuro)

### Niveles de Testing

1. **Unit Tests**: Utils, hooks, funciones puras
2. **Component Tests**: Componentes UI
3. **Integration Tests**: Features completas
4. **E2E Tests**: Flujos críticos

### Ubicación de Tests

```
feature/
├── components/
│   ├── PostCard.tsx
│   └── PostCard.test.tsx  # Test junto al componente
```

---

## Escalabilidad

### Añadir Nueva Feature

1. Crear carpeta en `/src/features/new-feature/`
2. Seguir estructura estándar (services, hooks, components)
3. Integrar con apiClient para llamadas API
4. Añadir rutas en `/pages` o `/app`

### Migración a Monorepo

Si el proyecto crece:
- **Turborepo**: Para compartir código entre frontend/backend
- **Nx**: Alternativa más compleja pero potente

### Micro-frontends (Lejano Futuro)

Si el proyecto escala masivamente:
- Considerar Module Federation
- Dividir por features grandes (posts, appointments)

---

## Mejores Prácticas

### ✅ DO

- Usar alias `@/` para imports
- Mantener features independientes
- Documentar hooks con JSDoc
- Usar TypeScript estricto
- Seguir convenciones de nomenclatura

### ❌ DON'T

- Crear componentes "Dios"
- Mezclar lógica de negocio en componentes UI
- Usar imports relativos profundos
- Ignorar errores de TypeScript
- Acoplar features entre sí

---

**Arquitectura diseñada para escalar de 1 a 100 desarrolladores manteniendo el código limpio y mantenible.**

