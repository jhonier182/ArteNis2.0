# 🎨 ArteNis 2.0 - Frontend Moderno y Escalable

> **Plataforma tipo Pinterest para tatuadores** - Frontend construido con Next.js, TypeScript, TailwindCSS y arquitectura feature-based.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Convenciones de Código](#convenciones-de-código)
- [Desarrollo](#desarrollo)
- [Despliegue](#despliegue)
- [Escalabilidad Futura](#escalabilidad-futura)

---

## ✨ Características

- ✅ **Next.js 14** con App Router (preparado para migración)
- ✅ **TypeScript** estricto para type-safety
- ✅ **TailwindCSS** con modo oscuro integrado
- ✅ **Arquitectura Feature-Based** modular y escalable
- ✅ **PWA Ready** con service worker y manifest
- ✅ **Internacionalización (i18n)** - Español e Inglés
- ✅ **Estado Global** con Context API (escalable a Zustand)
- ✅ **Cliente HTTP** centralizado con Axios e interceptores
- ✅ **ESLint + Prettier + Import Sort** configurados
- ✅ **Alias `@/`** para imports limpios
- ✅ **Componentes UI** reutilizables base
- ✅ **Hooks personalizados** documentados

---

## 🛠 Tecnologías

### Core
- **Next.js 14.1.0** - Framework React con SSR/SSG
- **React 18.2** - Biblioteca UI
- **TypeScript 5.3** - Type-safety
- **TailwindCSS 3.4** - Estilos utility-first

### Estado y Datos
- **Context API** - Estado global (migrable a Zustand)
- **Axios 1.6** - Cliente HTTP con interceptores

### UI y UX
- **Framer Motion 11** - Animaciones
- **Lucide React** - Íconos
- **Next-PWA 5.6** - Soporte PWA

### Internacionalización
- **next-i18next 15.2** - i18n para Next.js

### Desarrollo
- **ESLint** - Linter con reglas TypeScript/React
- **Prettier** - Formateador de código
- **Jest** - Testing (configurado)

---

## 🏗 Arquitectura

### Feature-Based Architecture + Atomic Design Híbrido

El proyecto sigue una **arquitectura modular por features** que facilita el escalado y mantenimiento:

```
src/
├── app/                    # Next.js App Router (entrypoint)
│   ├── layout.tsx          # Layout global con providers
│   ├── page.tsx            # Página principal
│   └── providers.tsx       # Providers globales
│
├── features/               # Features organizados por dominio
│   ├── auth/               # Módulo de autenticación
│   │   ├── pages/          # Páginas de auth
│   │   ├── components/     # Componentes específicos
│   │   ├── hooks/          # Hooks de auth
│   │   └── services/       # Servicios API
│   ├── posts/              # Módulo de publicaciones
│   ├── profile/            # Módulo de perfiles
│   └── appointments/       # Módulo de citas
│
├── components/ui/          # Componentes UI globales reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
│
├── context/                # Contextos globales
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                  # Hooks globales genéricos
│   ├── useInfiniteScroll.ts
│   └── useDebounce.ts
│
├── services/               # Servicios base
│   └── apiClient.ts        # Cliente HTTP centralizado
│
├── utils/                  # Utilidades
│   ├── config.ts           # Configuración centralizada
│   ├── storage.ts           # localStorage/sessionStorage
│   ├── formatters.ts       # Formateadores (fechas, números)
│   └── validators.ts       # Validadores
│
├── locales/                # Archivos de traducción i18n
│   ├── es.json
│   └── en.json
│
├── styles/                 # Estilos globales
│   └── globals.css          # Tailwind + estilos custom
│
├── types/                  # Tipos TypeScript globales
│   └── index.ts
│
└── assets/                 # Recursos estáticos (opcional)
```

### Principios de Diseño

1. **Feature-Based**: Cada dominio funcional (auth, posts, etc.) es independiente
2. **Colocación**: Todo lo relacionado con una feature está en su carpeta
3. **Reutilización**: Componentes UI compartidos en `/components/ui`
4. **Separación de Concerns**: Servicios, hooks, componentes y páginas separados
5. **Escalabilidad**: Fácil añadir nuevas features sin afectar existentes

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o yarn/pnpm)

### Pasos

1. **Clonar e instalar dependencias:**

```bash
cd Front_pwa2
npm install
```

2. **Configurar variables de entorno:**

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus valores:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

3. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3002`

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base del API backend | `http://localhost:3000/api` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `NEXT_PUBLIC_AI_ENABLED` | Habilitar features IA | `false` |

### Configuración TypeScript

El archivo `tsconfig.json` incluye:
- Alias `@/*` apuntando a `src/*`
- Alias específicos para cada carpeta principal
- Configuración estricta de tipos

### Configuración TailwindCSS

- **Modo oscuro**: Activado con `darkMode: 'class'`
- **Colores personalizados**: Primary y Secondary definidos
- **Animaciones**: Fade-in, slide-up, scale-in incluidos
- **Componentes base**: Clases utilitarias para botones, cards, inputs

### Configuración ESLint + Prettier

- **ESLint**: Configurado para Next.js, TypeScript y React
- **Prettier**: Reglas con comillas simples, sin punto y coma, ancho 100
- **Import Sort**: Orden automático de imports (React → Next → @/ → relativos)

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (puerto 3002)
npm run build            # Build para producción
npm run start            # Inicia servidor de producción

# Calidad de Código
npm run lint             # Ejecuta ESLint
npm run lint:fix          # Ejecuta ESLint y corrige errores
npm run format           # Formatea código con Prettier
npm run format:check     # Verifica formato sin modificar

# TypeScript
npm run type-check       # Verifica tipos sin compilar

# Testing (configurado, implementar tests)
npm run test             # Ejecuta tests
npm run test:watch       # Ejecuta tests en modo watch

# PWA
npm run pwa              # Build con optimización PWA
```

---

## 📁 Estructura del Proyecto (Detallada)

### `/src/app`

Punto de entrada de Next.js App Router:
- `layout.tsx`: Layout global con providers (Theme, Auth)
- `page.tsx`: Página principal
- `providers.tsx`: Wrapper de providers para client components

### `/src/features`

Cada feature es independiente y contiene:

```
feature-name/
├── pages/          # Páginas específicas de la feature
├── components/     # Componentes específicos de la feature
├── hooks/          # Hooks personalizados
├── services/       # Servicios API (llamadas al backend)
└── types/          # Tipos TypeScript específicos (opcional)
```

**Features incluidas:**
- `auth`: Login, registro, gestión de sesión
- `posts`: Feed, crear, editar, eliminar posts
- `profile`: Ver y editar perfil, seguir usuarios
- `appointments`: Reservar y gestionar citas

### `/src/components/ui`

Componentes UI base reutilizables:
- `Button`: Botón con variantes (primary, secondary, danger, outline)
- `Input`: Input de formulario con label y error
- `Card`: Contenedor con sombra y bordes
- `Modal`: Modal con overlay y animaciones
- `LoadingSpinner`: Spinner de carga

### `/src/context`

Contextos globales de React:
- `AuthContext`: Estado de autenticación y métodos (login, logout, etc.)
- `ThemeContext`: Tema (light/dark/system) y toggle

### `/src/services`

Servicios base:
- `apiClient.ts`: Cliente Axios configurado con interceptores para:
  - Añadir token de autenticación automáticamente
  - Manejar errores 401 (logout automático)
  - Configuración centralizada

### `/src/utils`

Utilidades generales:
- `config.ts`: Configuración centralizada de la app
- `storage.ts`: Wrapper para localStorage con type-safety
- `formatters.ts`: Formateo de fechas, números, texto
- `validators.ts`: Validadores (email, password, URL)

### `/src/hooks`

Hooks personalizados globales:
- `useInfiniteScroll`: Implementa scroll infinito con Intersection Observer
- `useDebounce`: Debounce de valores (útil para búsquedas)

---

## 📝 Convenciones de Código

### Nomenclatura

- **Componentes**: `PascalCase` → `PostCard.tsx`, `LoginForm.tsx`
- **Hooks**: `useCamelCase` → `useAuth.ts`, `usePosts.ts`
- **Funciones/Variables**: `camelCase` → `getUser()`, `isLoading`
- **Archivos**: `kebab-case.tsx` o `camelCase.ts` → `apiClient.ts`, `login-form.tsx`
- **Constantes**: `UPPER_SNAKE_CASE` → `API_BASE_URL`

### Imports

Usar alias `@/` en lugar de imports relativos:

```typescript
// ✅ Correcto
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/services/apiClient'

// ❌ Evitar
import { Button } from '../../../components/ui/Button'
```

### Estructura de Componentes

```typescript
// 1. Imports externos
import React from 'react'
import { Button } from 'lucide-react'

// 2. Imports internos (@/)
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

// 3. Tipos e interfaces
interface ComponentProps {
  title: string
}

// 4. Componente
export function Component({ title }: ComponentProps) {
  // ...
}
```

### Documentación

- Todos los hooks deben incluir JSDoc:
```typescript
/**
 * Hook para obtener y gestionar posts
 * @param filters - Filtros opcionales para la consulta
 */
export function usePosts(filters?: PostFilters) {
  // ...
}
```

---

## 💻 Desarrollo

### Añadir una Nueva Feature

1. Crear carpeta en `/src/features/new-feature/`
2. Crear estructura: `pages/`, `components/`, `hooks/`, `services/`
3. Crear servicios API en `services/newFeatureService.ts`
4. Crear hooks en `hooks/useNewFeature.ts`
5. Añadir tipos en `types/` si es necesario

### Añadir un Nuevo Componente UI

1. Crear archivo en `/src/components/ui/ComponentName.tsx`
2. Seguir estructura de componentes existentes
3. Exportar desde `index.ts` (opcional) para imports más limpios

### Trabajar con el API

```typescript
import { apiClient } from '@/services/apiClient'

// Ejemplo en un servicio
const response = await apiClient.getClient().get('/endpoint')
```

El token se añade automáticamente por el interceptor.

### Internacionalización

Los archivos de traducción están en `/src/locales/`:
- `es.json`: Español
- `en.json`: Inglés

Para usar i18n (cuando se implemente completamente):

```typescript
import { useTranslation } from 'next-i18next'

function Component() {
  const { t } = useTranslation('common')
  return <h1>{t('loading')}</h1>
}
```

---

## 🚢 Despliegue

### Build de Producción

```bash
npm run build
npm run start
```

### Variables de Entorno en Producción

Configurar en tu plataforma de despliegue (Vercel, Netlify, etc.):
- `NEXT_PUBLIC_API_URL`: URL del API en producción
- `NODE_ENV`: `production`

### Optimizaciones PWA

El proyecto está configurado con `next-pwa`. En producción:
- Service Worker se genera automáticamente
- Caché offline configurado
- Manifest.json incluido

---

## 🔮 Escalabilidad Futura

### Migración a App Router Completo

El proyecto está preparado para migrar a App Router completo de Next.js:
- Actualmente usa Pages Router por compatibilidad
- Estructura `/src/app` ya creada
- Migrar páginas progresivamente a `/src/app`

### Migración de Estado a Zustand

Context API está bien para inicio, pero si crece:
1. Instalar Zustand: `npm install zustand`
2. Crear stores en `/src/stores/`
3. Reemplazar Context API gradualmente

### Monorepo

Si el proyecto crece, considerar:
- **Turborepo** o **Nx** para monorepo
- Separar frontend, backend, shared en packages

### Testing

Testing configurado pero sin tests:
- Añadir tests con Jest + Testing Library
- Tests unitarios para utils y hooks
- Tests de integración para features críticas

### Storybook

Para documentación de componentes UI:
- Instalar Storybook
- Documentar cada componente en `/components/ui`

---

## 📚 Recursos y Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Patterns](https://reactpatterns.com/)

---

## 👥 Contribución

Este proyecto sigue principios de código limpio y buenas prácticas. Al contribuir:

1. Seguir convenciones de código establecidas
2. Ejecutar `npm run lint` y `npm run format` antes de commit
3. Añadir tests para nuevas features
4. Documentar cambios importantes

---

## 📄 Licencia

ISC

---

## 🎯 Estado del Proyecto

✅ **Completado:**
- Estructura base del proyecto
- Configuración de TypeScript, ESLint, Prettier
- Arquitectura feature-based
- Servicios base y apiClient
- Contextos globales (Auth, Theme)
- Componentes UI base
- Configuración PWA
- Internacionalización (i18n) base
- Documentación completa

🚧 **Pendiente de Implementar:**
- Tests unitarios e integración
- Migración completa a App Router
- Storybook para componentes UI
- Optimizaciones avanzadas de rendimiento
- Analytics y monitoreo

---

**Desarrollado con ❤️ para ArteNis 2.0**

