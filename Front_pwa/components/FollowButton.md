# FollowButton Component

Un componente reutilizable para manejar el seguimiento de usuarios en toda la aplicación.

## Características

- ✅ **Estado automático**: Se sincroniza automáticamente con el hook `useFollowing`
- ✅ **Múltiples tamaños**: `sm`, `md`, `lg`
- ✅ **Múltiples variantes**: `primary`, `secondary`, `outline`
- ✅ **Estados de carga**: Muestra spinner durante las operaciones
- ✅ **Manejo de errores**: Revierte el estado en caso de error
- ✅ **Accesibilidad**: Soporte para teclado y screen readers
- ✅ **Personalizable**: Clases CSS personalizables

## Uso Básico

```tsx
import FollowButton from '@/components/FollowButton'

// Uso básico
<FollowButton userId="user-id-123" />

// Con personalización
<FollowButton 
  userId="user-id-123"
  username="usuario123"
  size="lg"
  variant="primary"
  showText={true}
  className="custom-class"
  onFollowChange={(isFollowing) => console.log('Estado:', isFollowing)}
/>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `userId` | `string` | **requerido** | ID del usuario a seguir |
| `username` | `string` | `undefined` | Nombre de usuario (opcional) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del botón |
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Estilo del botón |
| `showText` | `boolean` | `true` | Mostrar texto del botón |
| `className` | `string` | `''` | Clases CSS adicionales |
| `onFollowChange` | `(isFollowing: boolean) => void` | `undefined` | Callback cuando cambia el estado |

## Ejemplos de Uso

### En Perfil de Usuario
```tsx
<FollowButton 
  userId={user.id}
  username={user.username}
  size="lg"
  variant="primary"
  className="w-full"
/>
```

### En Lista de Usuarios
```tsx
<FollowButton 
  userId={user.id}
  size="sm"
  variant="outline"
  showText={false}
/>
```

### En Card de Usuario
```tsx
<FollowButton 
  userId={user.id}
  username={user.username}
  size="md"
  variant="secondary"
  onFollowChange={(isFollowing) => {
    if (isFollowing) {
      showSuccess('Usuario seguido')
    } else {
      showInfo('Usuario dejado de seguir')
    }
  }}
/>
```

## Comportamiento

1. **Carga inicial**: El botón verifica automáticamente si ya sigues al usuario
2. **Clic**: Ejecuta la acción de seguir/dejar de seguir
3. **Estado de carga**: Muestra spinner durante la operación
4. **Sincronización**: Actualiza el estado global automáticamente
5. **Error handling**: Revierte el estado si la operación falla

## Integración con Hooks

El componente utiliza internamente:
- `useUser()`: Para verificar autenticación
- `useFollowing()`: Para obtener el estado de seguimiento
- `apiClient`: Para las llamadas a la API

## Estilos

### Tamaños
- **sm**: `px-3 py-1.5 text-xs`
- **md**: `px-4 py-2 text-sm` 
- **lg**: `px-6 py-3 text-base`

### Variantes
- **primary**: Azul/púrpura con gradiente
- **secondary**: Gris claro
- **outline**: Borde con fondo transparente

## Notas Importantes

- El botón no se muestra si el usuario no está autenticado
- El botón no se muestra si es el propio usuario
- El estado se sincroniza automáticamente con el hook global
- Las operaciones son optimistas (cambian el estado inmediatamente)
- En caso de error, se revierte el estado automáticamente
