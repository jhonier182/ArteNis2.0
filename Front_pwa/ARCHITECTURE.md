# Arquitectura de ArteNis 2.0 PWA

## 📁 Estructura del Proyecto

```
src/
├── assets/                 # Archivos estáticos globales
│   ├── icons/             # Iconos SVG
│   ├── images/            # Imágenes globales
│   └── fonts/             # Fuentes personalizadas
│
├── components/             # Componentes globales reutilizables
│   ├── ui/                # Componentes atómicos
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingIndicator.tsx
│   ├── layout/            # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── shared/            # Componentes compartidos
│       ├── Avatar.tsx
│       ├── PostCard.tsx
│       └── UserCard.tsx
│
├── features/               # Módulos independientes por funcionalidad
│   ├── auth/              # Autenticación
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   └── services/
│   │       └── authService.ts
│   ├── posts/             # Publicaciones
│   │   ├── components/
│   │   │   ├── PostList.tsx
│   │   │   ├── PostForm.tsx
│   │   │   └── PostFilters.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── PostDetailPage.tsx
│   │   │   └── CreatePostPage.tsx
│   │   ├── hooks/
│   │   │   ├── usePosts.ts
│   │   │   └── useInfiniteScroll.ts
│   │   └── services/
│   │       └── postService.ts
│   ├── users/             # Usuarios
│   │   ├── components/
│   │   │   ├── UserProfile.tsx
│   │   │   ├── UserCard.tsx
│   │   │   └── FollowButton.tsx
│   │   ├── pages/
│   │   │   ├── ProfilePage.tsx
│   │   │   └── UserProfilePage.tsx
│   │   ├── hooks/
│   │   │   ├── useUser.ts
│   │   │   └── useFollowing.ts
│   │   └── services/
│   │       └── userService.ts
│   └── notifications/      # Notificaciones
│       ├── components/
│       │   ├── NotificationList.tsx
│       │   └── NotificationItem.tsx
│       ├── pages/
│       │   └── NotificationsPage.tsx
│       ├── hooks/
│       │   └── useNotifications.ts
│       └── services/
│           └── notificationService.ts
│
├── contexts/               # Contextos globales de React
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
│
├── hooks/                  # Custom hooks globales
│   ├── useApi.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useOnlineStatus.ts
│
├── services/               # Servicios de API
│   ├── apiClient.ts
│   ├── authService.ts
│   ├── postService.ts
│   └── userService.ts
│
├── routes/                 # Configuración de rutas
│   ├── AppRouter.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
│
├── store/                  # Estado global (opcional)
│   ├── index.ts
│   ├── authSlice.ts
│   └── postsSlice.ts
│
├── utils/                  # Utilidades y helpers
│   ├── validators.ts
│   ├── formatters.ts
│   ├── dateUtils.ts
│   └── constants.ts
│
├── config/                 # Configuración de la app
│   ├── constants.ts
│   ├── endpoints.ts
│   └── env.ts
│
├── pwa/                    # Archivos específicos del PWA
│   ├── manifest.json
│   ├── service-worker.js
│   └── registerServiceWorker.js
│
├── styles/                 # Estilos globales
│   ├── globals.css
│   └── components.css
│
├── App.tsx                 # Componente raíz
├── index.tsx              # Punto de entrada
└── types/                 # Tipos TypeScript globales
    └── global.d.ts
```

## 🏗️ Principios Arquitectónicos

### 1. **Separación por Features**
- Cada funcionalidad principal tiene su propio módulo
- Evita imports cruzados entre features
- Facilita el mantenimiento y escalabilidad

### 2. **Componentes Atómicos**
- Componentes UI reutilizables en `components/ui/`
- Componentes de layout en `components/layout/`
- Componentes compartidos en `components/shared/`

### 3. **Contextos Globales**
- `AuthContext`: Manejo de autenticación
- `ThemeContext`: Gestión de temas (claro/oscuro)
- `NotificationContext`: Sistema de notificaciones

### 4. **Servicios Modulares**
- Cada feature tiene su propio servicio
- Cliente API centralizado con interceptores
- Manejo de errores y reintentos automáticos

### 5. **Routing Modular**
- Lazy loading de páginas
- Rutas protegidas y públicas
- Navegación basada en roles

## 🚀 PWA Features

### Service Worker
- Cache de assets estáticos
- Cache de respuestas de API
- Funcionamiento offline
- Actualizaciones automáticas

### Manifest
- Configuración de instalación
- Iconos adaptativos
- Temas y colores
- Shortcuts de aplicación

### Offline Support
- Página offline personalizada
- Cache de datos críticos
- Sincronización cuando vuelve la conexión

## 🎨 Sistema de Temas

### Tema Claro/Oscuro
- Detección automática de preferencias del sistema
- Persistencia en localStorage
- Transiciones suaves entre temas

### Variables CSS
- Colores semánticos
- Espaciado consistente
- Tipografía escalable

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Componentes Adaptativos
- Navegación móvil
- Grids responsivos
- Imágenes optimizadas

## 🔧 Configuración

### Variables de Entorno
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NAME=ArteNis 2.0
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### TypeScript
- Tipos estrictos
- Interfaces bien definidas
- Declaraciones globales

### ESLint + Prettier
- Reglas de código consistentes
- Formateo automático
- Integración con IDE

## 🧪 Testing

### Estructura de Tests
```
__tests__/
├── components/
├── features/
├── services/
└── utils/
```

### Herramientas
- Jest para unit tests
- React Testing Library para componentes
- Cypress para e2e tests

## 📦 Build y Deploy

### Scripts Disponibles
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:e2e": "cypress run"
}
```

### Optimizaciones
- Code splitting automático
- Lazy loading de rutas
- Optimización de imágenes
- Minificación de CSS/JS

## 🔄 Flujo de Datos

### 1. **Autenticación**
```
Login → AuthContext → API → LocalStorage → Redirect
```

### 2. **Posts**
```
User Action → Service → API → Context → Component Update
```

### 3. **Notificaciones**
```
API → NotificationContext → Toast/Modal → User
```

## 🚦 Estado de la Aplicación

### Contextos Globales
- **AuthContext**: Usuario, tokens, permisos
- **ThemeContext**: Tema actual, preferencias
- **NotificationContext**: Notificaciones, alertas

### Estado Local
- Componentes manejan su propio estado
- Hooks personalizados para lógica reutilizable
- Persistencia en localStorage cuando necesario

## 🔐 Seguridad

### Autenticación
- JWT tokens con refresh
- Interceptores automáticos
- Logout automático en errores 401

### Validación
- Validación en frontend y backend
- Sanitización de inputs
- Protección XSS

### HTTPS
- Solo conexiones seguras en producción
- Headers de seguridad
- CSP configurado

## 📊 Performance

### Optimizaciones
- Lazy loading de componentes
- Memoización con React.memo
- useCallback para funciones
- useMemo para cálculos costosos

### Monitoring
- Métricas de rendimiento
- Error tracking
- Analytics de uso

## 🛠️ Desarrollo

### Comandos Útiles
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Linting
npm run lint

# Tests
npm run test
```

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

## 📈 Escalabilidad

### Nuevas Features
1. Crear carpeta en `features/`
2. Implementar componentes, hooks, servicios
3. Agregar rutas en `AppRouter.tsx`
4. Documentar cambios

### Nuevos Componentes UI
1. Crear en `components/ui/`
2. Exportar desde `components/ui/index.ts`
3. Documentar props y uso
4. Agregar tests

### Nuevos Servicios
1. Crear en `services/`
2. Usar `apiClient` base
3. Manejar errores consistentemente
4. Documentar endpoints

Esta arquitectura está diseñada para ser mantenible, escalable y fácil de entender, siguiendo las mejores prácticas de React y PWA.
