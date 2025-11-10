<!-- df8db34a-ff7b-4a58-8bd8-d990287e344b a34e668c-50a8-4957-8a4f-7dbb817f1657 -->
# Documentación Completa del Proyecto Frontend - ArteNis 2.0 / Inkedin 2.0

## Información General del Proyecto

### Nombre y Versión

- **Nombre del proyecto**: ArteNis Frontend V2 (referencia interna), Inkedin 2.0 (nombre mostrado en UI)
- **Versión**: 2.0.0
- **Descripción**: Frontend moderno y escalable para ArteNis - Pinterest para tatuadores
- **Ubicación**: `Front_pwa2/`
- **Puerto de desarrollo**: 3002
- **Puerto del backend**: 3000 (según configuración por defecto)

### Estado Actual

- Proyecto completamente inicializado con estructura base
- Configuraciones listas para desarrollo
- Features base implementadas (servicios, hooks, componentes ejemplo)
- Listo para instalar dependencias y comenzar desarrollo

---

## Stack Tecnológico Completo

### Dependencias Principales (package.json)

- **next**: ^14.1.0 (App Router preparado, Pages Router activo)
- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **axios**: ^1.6.8 (cliente HTTP)
- **next-i18next**: ^15.2.0 (internacionalización)
- **next-pwa**: ^5.6.0 (PWA support)
- **framer-motion**: ^11.0.5 (animaciones)
- **lucide-react**: ^0.344.0 (íconos)
- **zustand**: ^4.5.0 (preparado para migración de estado)

### DevDependencies

- **typescript**: ^5.3.3
- **tailwindcss**: ^3.4.1
- **eslint**: ^8.56.0 + plugins (TypeScript, React, Prettier)
- **prettier**: ^3.2.4 + plugins (tailwindcss, import-sort)
- **@testing-library/react**: ^14.1.2 (testing configurado)
- **jest**: ^29.7.0

### Requisitos del Sistema

- Node.js >= 18.0.0
- npm >= 9.0.0

---

## Estructura del Proyecto (Feature-Based Architecture)

### Directorio Raíz

```
Front_pwa2/
├── src/                       # Código fuente
├── public/                    # Archivos estáticos
├── .vscode/                    # Configuración VS Code
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración TypeScript
├── next.config.js             # Configuración Next.js + PWA
├── tailwind.config.js         # Configuración TailwindCSS
├── postcss.config.js          # Configuración PostCSS
├── .eslintrc.json             # Reglas ESLint
├── .prettierrc.json           # Reglas Prettier
├── .gitignore                 # Archivos ignorados
├── .prettierignore            # Archivos ignorados por Prettier
├── .eslintignore              # Archivos ignorados por ESLint
├── next-i18next.config.js     # Configuración i18n
├── README.md                   # Documentación principal
├── ARCHITECTURE.md             # Documentación de arquitectura
└── PROJECT_SUMMARY.md         # Resumen del proyecto
```

### Estructura src/

```
src/
├── app/                        # Next.js App Router (preparado)
│   ├── layout.tsx             # Layout global con metadata
│   └── providers.tsx          # Wrapper de providers (client component)
│
├── pages/                      # Next.js Pages Router (activo)
│   ├── _app.tsx               # App wrapper con providers
│   └── index.tsx              # Página principal (muestra "Inkedin 2.0")
│
├── features/                   # Features organizados por dominio
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx  # Formulario de login funcional
│   │   ├── hooks/
│   │   │   └── useAuth.ts     # Re-export del hook del contexto
│   │   ├── pages/
│   │   │   └── login.tsx      # Página de login ejemplo
│   │   └── services/
│   │       └── authService.ts # Servicios API de autenticación
│   │
│   ├── posts/
│   │   ├── components/
│   │   │   └── PostCard.tsx   # Componente card de post funcional
│   │   ├── hooks/
│   │   │   └── usePosts.ts    # Hook para obtener posts
│   │   └── services/
│   │       └── postService.ts # Servicios API de posts
│   │
│   ├── profile/
│   │   └── services/
│   │       └── profileService.ts # Servicios API de perfiles
│   │
│   └── appointments/
│       └── services/
│           └── appointmentService.ts # Servicios API de citas
│
├── components/ui/              # Componentes UI reutilizables
│   ├── Button.tsx             # Botón con variantes (primary, secondary, danger, outline)
│   ├── Input.tsx              # Input con label y error
│   ├── Card.tsx               # Card container con padding configurable
│   ├── Modal.tsx              # Modal con portal, escape key, overlay
│   ├── LoadingSpinner.tsx     # Spinner de carga
│   └── index.ts               # Barrel export
│
├── context/                    # Contextos globales React
│   ├── AuthContext.tsx        # Autenticación: login, register, logout, updateUser
│   └── ThemeContext.tsx       # Tema: light/dark/system con persistencia
│
├── services/                   # Servicios base
│   └── apiClient.ts           # Cliente Axios con interceptores
│
├── hooks/                      # Hooks globales reutilizables
│   ├── useInfiniteScroll.ts  # Scroll infinito con Intersection Observer
│   ├── useDebounce.ts         # Debounce de valores
│   └── index.ts               # Barrel export
│
├── utils/                      # Utilidades
│   ├── config.ts              # Configuración centralizada de la app
│   ├── storage.ts             # Wrapper de localStorage con type-safety
│   ├── formatters.ts          # Formateadores (fechas relativas, números compactos)
│   ├── validators.ts          # Validadores (email, password, URL)
│   └── index.ts               # Barrel export
│
├── locales/                    # Archivos de traducción i18n
│   ├── es.json                # Traducciones en español
│   └── en.json                # Traducciones en inglés
│
├── styles/
│   └── globals.css             # Estilos globales Tailwind + clases custom
│
└── types/
    ├── index.ts                # Tipos globales (ApiResponse, PaginatedResponse)
    └── next-env.d.ts          # Tipos Next.js
```

---

## Configuraciones Detalladas

### TypeScript (tsconfig.json)

- **Target**: ES2020
- **Strict mode**: Activado
- **Module resolution**: bundler
- **JSX**: preserve
- **Paths alias configurados**:
  - `@/*` → `./src/*`
  - `@/components/*` → `./src/components/*`
  - `@/features/*` → `./src/features/*`
  - `@/services/*` → `./src/services/*`
  - `@/utils/*` → `./src/utils/*`
  - `@/context/*` → `./src/context/*`
  - `@/hooks/*` → `./src/hooks/*`
  - `@/styles/*` → `./src/styles/*`
  - `@/assets/*` → `./src/assets/*`
  - `@/types/*` → `./src/types/*`

### Next.js (next.config.js)

- **React Strict Mode**: Activado
- **SWC Minify**: Activado
- **PWA Config** (next-pwa):
  - Deshabilitado en desarrollo
  - Service worker en `/public`
  - Caché offline con NetworkFirst strategy
  - Max 200 entradas en caché
- **Image Optimization**:
  - Dominios permitidos: `res.cloudinary.com`, `localhost`
  - Formatos: AVIF, WebP
- **Package Optimization**: `lucide-react`, `framer-motion`

### TailwindCSS (tailwind.config.js)

- **Dark mode**: `class` (activado con clase en HTML)
- **Colors personalizados**:
  - Primary: escala roja (50-900)
  - Secondary: escala gris/azul (50-900)
- **Fonts**:
  - Sans: Inter, system-ui
  - Display: Poppins
- **Animaciones custom**:
  - `fade-in`: fadeIn 0.5s
  - `slide-up`: slideUp 0.3s
  - `scale-in`: scaleIn 0.2s
- **Content paths**: `./src/**/*.{js,ts,jsx,tsx,mdx}`, `./pages/**/*`, `./components/**/*`

### ESLint (.eslintrc.json)

- **Extends**: next/core-web-vitals, TypeScript, React, React Hooks, Prettier
- **Plugins**: @typescript-eslint, react, react-hooks
- **Reglas importantes**:
  - `react/react-in-jsx-scope`: off (Next.js no requiere)
  - `react/prop-types`: off (usar TypeScript)
  - `@typescript-eslint/no-unused-vars`: error (ignora `_`)
  - `react-hooks/rules-of-hooks`: error
  - `react-hooks/exhaustive-deps`: warn

### Prettier (.prettierrc.json)

- **Semi**: false
- **Single quotes**: true
- **Tab width**: 2
- **Print width**: 100
- **Trailing comma**: es5
- **Arrow parens**: avoid
- **End of line**: lf
- **Plugins**: prettier-plugin-tailwindcss, @trivago/prettier-plugin-sort-imports
- **Import order**: react → next → @/* → relativos

### VS Code (.vscode/settings.json)

- Format on save habilitado
- ESLint auto-fix on save
- Prettier como formatter por defecto
- TypeScript workspace SDK

---

## Servicios y Utilidades

### apiClient.ts

Cliente HTTP centralizado con Axios:

**Características**:

- Base URL desde `NEXT_PUBLIC_API_URL` o `http://localhost:3000/api`
- Timeout: 30000ms
- Headers por defecto: `Content-Type: application/json`

**Interceptores**:

- **Request**: Añade token de autenticación desde localStorage
  - Header: `Authorization: Bearer ${token}`
- **Response**: Maneja errores 401
  - Limpia tokens y redirige a `/login`

**Métodos públicos**:

- `setAuthToken(token: string)`: Guarda token en localStorage
- `setRefreshToken(token: string)`: Guarda refresh token
- `getClient()`: Retorna instancia de Axios

### storage.ts

Wrapper de localStorage con type-safety:

- `get<T>(key, defaultValue)`: Obtiene valor tipado
- `set<T>(key, value)`: Guarda valor
- `remove(key)`: Elimina clave
- `clear()`: Limpia todo
- Validación de disponibilidad de localStorage

### formatters.ts

- `formatRelativeTime(date)`: "hace X minutos/horas/días" o fecha formateada
- `formatCompactNumber(num)`: 1.2K, 5.3M
- `truncateText(text, maxLength)`: Trunca texto con ellipsis

### validators.ts

- `isValidEmail(email)`: Validación con regex
- `isValidPassword(password)`: Mínimo 8 chars, letra y número
- `isValidUrl(url)`: Validación de URL

### config.ts

Configuración centralizada:

- `api.baseURL`: URL del API
- `api.timeout`: 30000
- `app.name`: "ArteNis"
- `app.version`: "2.0.0"
- `features.pwa.enabled`: basado en NODE_ENV
- `features.ai.enabled`: basado en NEXT_PUBLIC_AI_ENABLED

---

## Contextos Globales

### AuthContext.tsx

**Estado**:

- `user: User | null`
- `isAuthenticated: boolean`
- `isLoading: boolean`

**Métodos**:

- `login(email, password)`: Login y guarda tokens
- `register(username, email, password)`: Registro y guarda tokens
- `logout()`: Limpia sesión
- `updateUser(userData)`: Actualiza usuario localmente

**Persistencia**:

- Carga sesión desde localStorage al montar
- Guarda tokens en apiClient
- Sincroniza con localStorage

**Interfaz User**:

```typescript
{
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
}
```

### ThemeContext.tsx

**Estado**:

- `theme: 'light' | 'dark' | 'system'`
- `resolvedTheme: 'light' | 'dark'`

**Métodos**:

- `setTheme(theme)`: Establece tema y persiste
- `toggleTheme()`: Alterna entre light/dark

**Funcionalidad**:

- Detecta preferencia del sistema cuando `theme === 'system'`
- Aplica clase `dark` al HTML
- Persiste en localStorage

---

## Features Implementadas

### Feature: Auth

**Servicios** (authService.ts):

- `login(credentials)`: POST `/auth/login`
- `register(data)`: POST `/auth/register`
- `logout()`: POST `/auth/logout`
- `refreshToken(token)`: POST `/auth/refresh`

**Componentes**:

- `LoginForm.tsx`: Formulario completo con manejo de errores
  - Estados: email, password, error, loading
  - Valida y llama a `login()` del contexto

**Páginas**:

- `login.tsx`: Página de login con Card wrapper

**Hooks**:

- `useAuth.ts`: Re-export del hook del AuthContext

### Feature: Posts

**Servicios** (postService.ts):

- `getPosts(filters?)`: GET `/posts` con query params
- `getPostById(id)`: GET `/posts/:id`
- `createPost(data)`: POST `/posts`
- `updatePost(id, data)`: PUT `/posts/:id`
- `deletePost(id)`: DELETE `/posts/:id`
- `likePost(id)`: POST `/posts/:id/like`
- `unlikePost(id)`: DELETE `/posts/:id/like`
- `savePost(id)`: POST `/posts/:id/save`
- `unsavePost(id)`: DELETE `/posts/:id/save`

**Interfaces**:

```typescript
Post {
  id, title, description?, imageUrl, authorId,
  author: { id, username, avatar? },
  likesCount, commentsCount, isLiked, isSaved,
  tags: string[], createdAt, updatedAt
}
```

**Componentes**:

- `PostCard.tsx`: Muestra post con imagen, título, descripción, likes, saves
  - Usa `formatRelativeTime` para fechas
  - Callbacks `onLike` y `onSave` opcionales

**Hooks**:

- `usePosts(filters?)`: Hook con estados loading, error, posts, total
  - Refetch automático cuando cambian filtros
  - Método `refetch()` para recargar manual

### Feature: Profile

**Servicios** (profileService.ts):

- `getProfile(userId)`: GET `/profile/:userId`
- `getCurrentProfile()`: GET `/profile/me`
- `updateProfile(data)`: PUT `/profile/me`
- `followUser(userId)`: POST `/profile/:userId/follow`
- `unfollowUser(userId)`: DELETE `/profile/:userId/follow`

**Interfaces**:

```typescript
Profile {
  id, username, email, avatar?, bio?,
  followersCount, followingCount, postsCount,
  isFollowing, createdAt
}
```

### Feature: Appointments

**Servicios** (appointmentService.ts):

- `getAppointments(filters?)`: GET `/appointments`
- `getAppointmentById(id)`: GET `/appointments/:id`
- `createAppointment(data)`: POST `/appointments`
- `updateAppointment(id, data)`: PUT `/appointments/:id`
- `cancelAppointment(id)`: DELETE `/appointments/:id`

**Interfaces**:

```typescript
Appointment {
  id, userId, tattooArtistId,
  date, time, description?,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  createdAt
}
```

---

## Componentes UI Base

### Button.tsx

**Props**:

- `variant`: 'primary' | 'secondary' | 'danger' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- Props nativas de button

**Estilos**:

- Primary: bg-primary-600, hover-primary-700
- Secondary: bg-gray-200 dark:bg-gray-700
- Danger: bg-red-600, hover-red-700
- Outline: border-primary-600, hover:bg-primary-50

### Input.tsx

**Props**:

- `label`: string opcional
- `error`: string opcional (muestra mensaje de error)
- Props nativas de input
- Usa `forwardRef`

**Estilos**:

- Borde rojo cuando hay error
- Focus ring primary-500
- Soporte dark mode

### Card.tsx

**Props**:

- `padding`: 'sm' | 'md' | 'lg' | 'none' (default: 'md')
- Props nativas de div

**Estilos**:

- Clase `card` de globals.css (bg-white dark:bg-gray-800, rounded, shadow, border)

### Modal.tsx

**Props**:

- `isOpen`: boolean
- `onClose`: función
- `title`: string opcional
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `children`: ReactNode

**Funcionalidad**:

- Portal a document.body
- Cierra con Escape key
- Cierra al click en overlay
- Bloquea scroll del body cuando está abierto
- Animaciones: fade-in y scale-in

### LoadingSpinner.tsx

**Props**:

- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string opcional

**Estilos**:

- Spinner con borde primary-600
- Animación spin

---

## Hooks Personalizados

### useInfiniteScroll.ts

**Parámetros**:

- `hasMore`: boolean
- `loading`: boolean
- `onLoadMore`: función
- `threshold`: number (default: 200px)

**Funcionalidad**:

- Usa Intersection Observer API
- Observa elemento cuando `hasMore && !loading`
- Llama a `onLoadMore` cuando entra en viewport

### useDebounce.ts

**Parámetros**:

- `value`: T (valor a debounce)
- `delay`: number (default: 500ms)

**Retorna**: Valor debounced de tipo T

**Uso típico**: Búsquedas, validación de formularios

---

## Estilos Globales (globals.css)

### Tailwind Directives

- `@tailwind base`
- `@tailwind components`
- `@tailwind utilities`

### Base Layer

- Bordes grises con variantes dark
- Body con fonts Inter y antialiasing
- Headings con font-display (Poppins)

### Components Layer

- `.btn`: Base para botones (padding, rounded, font, transition)
- `.btn-primary`: Estilos primary
- `.btn-secondary`: Estilos secondary
- `.card`: Estilos para cards
- `.input`: Estilos para inputs

### Utilities Layer

- `.scrollbar-hide`: Oculta scrollbar (webkit y Firefox)

---

## Internacionalización (i18n)

### Archivos de Traducción

**es.json** y **en.json** con secciones:

- `common`: loading, error, success, cancel, confirm, save, edit, delete, close, search, filter, noResults
- `auth`: login, logout, register, email, password, username, forgotPassword, etc.
- `posts`: title, create, edit, delete, like, unlike, save, unsave, share, comments, noPosts
- `profile`: title, edit, followers, following, posts, follow, unfollow, bio
- `appointments`: title, book, pending, confirmed, completed, cancelled

**Nota**: Configuración i18n base creada pero no completamente integrada. Requiere setup adicional de next-i18next.

---

## PWA Configuration

### manifest.json

- **Name**: "ArteNis - Pinterest para tatuadores"
- **Short name**: "ArteNis"
- **Start URL**: "/"
- **Display**: standalone
- **Theme color**: #dc2626 (rojo primary)
- **Background color**: #ffffff
- **Icons**: icon-192x192.png, icon-512x512.png (requieren creación)
- **Shortcuts**: Crear post → /create

### Service Worker

- Generado automáticamente por next-pwa
- Deshabilitado en desarrollo
- Caché offline con estrategia NetworkFirst
- Máximo 200 entradas

---

## Variables de Entorno

### Requeridas

- `NEXT_PUBLIC_API_URL`: URL base del backend (default: `http://localhost:3000/api`)

### Opcionales

- `NODE_ENV`: development | production
- `NEXT_PUBLIC_AI_ENABLED`: "true" | "false" (para features IA futuras)

### Archivo .env.example

Incluido con estructura básica (no se puede crear .env.local automáticamente)

---

## Scripts Disponibles (package.json)

### Desarrollo

- `npm run dev`: Inicia servidor desarrollo en puerto 3002
- `npm run build`: Build para producción
- `npm run start`: Inicia servidor producción en puerto 3002

### Calidad de Código

- `npm run lint`: Ejecuta ESLint
- `npm run lint:fix`: ESLint con auto-fix
- `npm run format`: Prettier con write
- `npm run format:check`: Prettier check-only
- `npm run type-check`: TypeScript check sin compilar

### Testing

- `npm run test`: Ejecuta Jest
- `npm run test:watch`: Jest en modo watch

### PWA

- `npm run pwa`: Build + export (obsoleto para App Router)

---

## Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase → `PostCard.tsx`, `LoginForm.tsx`
- **Hooks**: camelCase con prefijo `use` → `useAuth.ts`, `usePosts.ts`
- **Funciones/Variables**: camelCase → `getUser()`, `isLoading`
- **Archivos**: kebab-case.tsx o camelCase.ts → `api-client.ts`, `LoginForm.tsx`
- **Constantes**: UPPER_SNAKE_CASE → `API_BASE_URL`

### Imports

- **Siempre usar alias `@/`** en lugar de rutas relativas
- Orden: react → next → @/* → relativos
- Separación automática con Prettier

### Estructura de Componentes

1. Imports externos
2. Imports internos (@/)
3. Tipos/interfaces
4. Componente
5. Export

### Documentación

- Hooks con JSDoc
- Servicios con comentarios descriptivos
- Tipos complejos documentados

---

## Decisiones Arquitectónicas Clave

### 1. Feature-Based Organization

Razón: Facilita escalado y mantenimiento. Features independientes.

### 2. Pages Router Activo, App Router Preparado

Razón: Pages Router es más estable. Estructura App Router permite migración futura.

### 3. Context API con Zustand Preparado

Razón: Context suficiente para inicio. Zustand disponible para migración.

### 4. Axios con Cliente Centralizado

Razón: Interceptores facilitan autenticación y manejo de errores global.

### 5. TailwindCSS con Modo Oscuro Nativo

Razón: Utility-first con mejor DX. Modo oscuro integrado con clase.

---

## Estado Actual del Proyecto

### Completado

✅ Estructura completa del proyecto

✅ Configuraciones (TypeScript, ESLint, Prettier, Tailwind, Next.js)

✅ Servicios base (apiClient, storage, formatters, validators)

✅ Contextos globales (Auth, Theme)

✅ Features base (auth, posts, profile, appointments)

✅ Componentes UI base (Button, Input, Card, Modal, LoadingSpinner)

✅ Hooks personalizados (useInfiniteScroll, useDebounce)

✅ Internacionalización base (archivos JSON)

✅ PWA configurado (manifest, service worker)

✅ Documentación completa (README, ARCHITECTURE, PROJECT_SUMMARY)

### Pendiente de Implementar

- Tests unitarios e integración
- Páginas completas de cada feature
- Más componentes UI (Textarea, Select, Checkbox, Toast, etc.)
- Integración completa de i18n
- Optimizaciones avanzadas de rendimiento
- Storybook para documentación de componentes
- Migración completa a App Router (opcional)

---

## Notas Importantes

1. **Nombre en UI**: El proyecto muestra "Inkedin 2.0" en la página principal (index.tsx), pero internamente se refiere como "ArteNis 2.0"

2. **Puerto**: El proyecto corre en puerto 3002 para evitar conflictos con otros proyectos

3. **Backend**: Se asume backend en puerto 3000. Configurar `NEXT_PUBLIC_API_URL` para cambiar.

4. **PWA Icons**: Los iconos referenciados en manifest.json (icon-192x192.png, icon-512x512.png) deben crearse manualmente

5. **i18n**: Archivos de traducción creados pero requiere setup adicional de next-i18next en páginas

6. **Testing**: Jest configurado pero sin tests implementados aún

---

## Archivos Clave de Referencia

- **Configuración**: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`
- **Arquitectura**: `ARCHITECTURE.md`
- **Uso**: `README.md`
- **Resumen**: `PROJECT_SUMMARY.md`
- **Servicios**: `src/services/apiClient.ts`
- **Contextos**: `src/context/AuthContext.tsx`, `src/context/ThemeContext.tsx`
- **Estilos**: `src/styles/globals.css`