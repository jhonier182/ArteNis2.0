# Estructura del Proyecto Angular

Este documento describe la organización del proyecto Angular usando la estructura **Core/Features/Shared**.

## 📁 Estructura de Carpetas

```
src/app/
├── core/                    # Elementos esenciales de la aplicación
│   ├── guards/             # Guards de rutas (auth, admin)
│   ├── interceptors/       # Interceptores HTTP (auth, error handling)
│   ├── models/             # Interfaces y tipos globales
│   └── services/           # Servicios globales (auth, API)
│
├── features/                # Módulos funcionales de la aplicación
│   ├── auth/               # Módulo de autenticación
│   ├── user/               # Módulo de usuarios
│   └── admin/              # Módulo administrativo (futuro)
│
├── shared/                  # Elementos reutilizables
│   ├── components/         # Componentes compartidos
│   ├── directives/         # Directivas personalizadas
│   └── pipes/              # Pipes de transformación
│
├── app.config.ts           # Configuración de la aplicación
├── app.routes.ts           # Rutas principales
└── app.ts                  # Componente raíz
```

## 🎯 Core

Contiene servicios, interceptores, guards y modelos que son utilizados en toda la aplicación.

### Servicios (`core/services/`)

- **auth.service.ts**: Maneja la autenticación de usuarios (login, registro, logout, tokens)

### Interceptors (`core/interceptors/`)

- **auth.interceptor.ts**: Añade automáticamente el token de autenticación a las peticiones HTTP
- **error.interceptor.ts**: Maneja errores HTTP globales (401, 403, 404, 500, etc.)

### Guards (`core/guards/`)

- **auth.guard.ts**: Protege rutas que requieren autenticación

### Models (`core/models/`)

- **user.model.ts**: Interfaces para usuarios (`User`, `LoginDto`, `CreateUserDto`, `AuthResponse`)
- **api-response.model.ts**: Interfaces para respuestas de la API (`ApiResponse`, `PaginatedResponse`, `ApiError`)

## 🚀 Features

Contiene módulos específicos por funcionalidad. Cada feature es autónomo e incluye sus propios componentes y servicios.

### Auth (`features/auth/`)

- **login/login.component.ts**: Componente de inicio de sesión
- **register/register.component.ts**: Componente de registro
- **auth.config.ts**: Configuración de rutas de autenticación

### User (`features/user/`)

- **profile/profile.component.ts**: Página de perfil de usuario
- **dashboard/dashboard.component.ts**: Dashboard del usuario
- **user.config.ts**: Configuración de rutas de usuario (con guard de autenticación)

## 🔧 Shared

Elementos reutilizables que pueden ser utilizados en múltiples partes de la aplicación.

### Components (`shared/components/`)

- **button/button.component.ts**: Botón personalizado reutilizable con variantes y tamaños

**Ejemplo de uso:**
```typescript
<app-button 
  label="Clickeame"
  variant="primary"
  size="lg"
  [loading]="isLoading"
  (onClick)="handleClick($event)"
/>
```

### Directives (`shared/directives/`)

- **autofocus.directive.ts**: Aplica focus automáticamente a un elemento

**Ejemplo de uso:**
```html
<input appAutofocus type="text" />
```

### Pipes (`shared/pipes/`)

- **safe-html.pipe.ts**: Sanitiza HTML para renderizado seguro

**Ejemplo de uso:**
```html
<div [innerHTML]="htmlContent | safeHtml"></div>
```

## 🔑 Configuración Principal

### app.config.ts

Configuración de la aplicación incluyendo:
- Router con lazy loading
- Http client con interceptores
- Service worker
- Client hydration para SSR

### app.routes.ts

Rutas principales con lazy loading:
- `/auth/*` - Módulo de autenticación (lazy loaded)
- `/user/*` - Módulo de usuario (lazy loaded, requiere autenticación)

## 📝 Convenciones

### Naming

- **Componentes**: kebab-case para archivos (`button.component.ts`)
- **Services**: kebab-case para archivos (`auth.service.ts`)
- **Models/Interfaces**: PascalCase para tipos (`User`, `ApiResponse`)
- **Directives**: kebab-case con prefijo (selector: `appAutofocus`)

### Estructura de un Feature

Cada feature debe seguir esta estructura:
```
feature-name/
├── components/           # Componentes específicos del feature
├── services/            # Servicios específicos del feature (opcional)
├── models/              # Interfaces específicas del feature (opcional)
└── feature.config.ts    # Configuración de rutas
```

## 🛠️ Uso de Guards

Para proteger rutas que requieren autenticación:

```typescript
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [authGuard]
  }
];
```

## 🌐 Interceptores

Los interceptores están configurados automáticamente en `app.config.ts`:

- **authInterceptor**: Añade el header `Authorization: Bearer <token>` a todas las peticiones
- **errorInterceptor**: Maneja y loguea errores HTTP globales

## 📚 Importaciones

Para facilitar las importaciones, se han creado archivos de índice:

```typescript
// Desde core
import { AuthService, authGuard } from '@app/core';

// Desde shared
import { ButtonComponent } from '@app/shared';
```

## ✅ Best Practices

1. **Core**: Solo elementos globales que se usan en toda la app
2. **Features**: Autónomos, con su propia lógica y componentes
3. **Shared**: Reutilizables y genéricos, sin lógica de negocio
4. **Lazy Loading**: Todas las features cargan de forma diferida
5. **Standalone Components**: Usar componentes standalone (Angular 15+)

## 🚦 Estado Actual

- ✅ Estructura de carpetas creada
- ✅ Servicios base implementados (auth)
- ✅ Interceptores configurados
- ✅ Guards implementados
- ✅ Componentes de ejemplo creados
- ✅ Rutas con lazy loading configuradas
- ✅ Componentes compartidos de ejemplo

## 🎯 Próximos Pasos

- [ ] Implementar llamadas reales a la API
- [ ] Agregar más componentes compartidos según necesidad
- [ ] Implementar feature de admin
- [ ] Agregar tests unitarios
- [ ] Configurar variables de entorno

