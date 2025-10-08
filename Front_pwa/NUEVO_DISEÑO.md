# 🎨 Nuevo Diseño - ArteNis PWA

## 📱 Diseño Implementado

### Inspiración
Diseño moderno tipo **Instagram/Pinterest** optimizado para contenido visual de tatuajes y arte.

---

## 🎯 Características del Nuevo Diseño

### 🌑 Dark Theme
- **Fondo principal:** `#0f1419` (negro profundo)
- **Cards:** `#1a1f26` (gris oscuro)
- **Bordes:** `#2f3640` (gris medio)
- **Texto:** Blanco y grises

### ✨ Elementos Visuales

#### 1. **Perfil de Usuario**
```
✅ Avatar circular con gradiente (naranja/dorado)
✅ Nombre y título destacados
✅ Stats en grid (Seguidores, Valoración, Colecciones)
✅ Botones de acción (Seguir, Mensaje)
✅ Sección de Insignias y Logros
✅ Grid de Colecciones tipo Pinterest
```

#### 2. **Feed Principal**
```
✅ Masonry Grid (columnas tipo Pinterest)
✅ Cards con hover effects
✅ Información del autor en cada post
✅ Likes y comentarios visibles en hover
✅ Diseño optimizado para imágenes
```

#### 3. **Navegación**
```
✅ Bottom Navigation con 5 tabs
✅ Iconos actualizados y modernos
✅ Tab activo con color azul (#3b82f6)
✅ Sticky header con backdrop blur
```

---

## 🎨 Paleta de Colores

### Principal
```css
--bg-primary: #0f1419;      /* Fondo principal */
--bg-secondary: #1a1f26;    /* Cards */
--bg-tertiary: #2f3640;     /* Elementos elevados */

--text-primary: #ffffff;    /* Texto principal */
--text-secondary: #9ca3af;  /* Texto secundario */
--text-tertiary: #6b7280;   /* Texto deshabilitado */

--accent-blue: #3b82f6;     /* Azul principal */
--accent-purple: #a855f7;   /* Púrpura */
--accent-orange: #f59e0b;   /* Naranja (badges) */
```

### Gradientes
```css
/* Avatar border */
from-orange-400 to-orange-600

/* Logo */
from-blue-500 to-purple-600

/* Botones principales */
from-blue-600 to-purple-600
```

---

## 📋 Páginas Actualizadas

### 1. `/profile` - Perfil de Usuario
**Estructura:**
```
📱 Header
   ↓
👤 Avatar (circular con gradiente)
   ↓
📝 Nombre + Título + Ubicación
   ↓
🔘 Botones (Seguir, Mensaje)
   ↓
📊 Stats (3 columnas)
   ↓
🏆 Insignias y Logros (scroll horizontal)
   ↓
🖼️ Colecciones (grid 2 columnas)
   ↓
📍 Bottom Navigation
```

**Características especiales:**
- Avatar con doble borde (gradiente + spacing)
- Stats con números grandes y labels pequeños
- Badges con iconos y colores únicos
- Grid de colecciones responsive
- Smooth scroll horizontal para badges

### 2. `/` - Feed Principal
**Estructura:**
```
📱 Header con logo gradiente
   ↓
📥 Banner de instalación (si aplica)
   ↓
🖼️ Masonry Grid (2 columnas)
   ↓
📍 Bottom Navigation
```

**Características especiales:**
- Pinterest-style masonry layout
- Hover effects en las imágenes
- Info del autor en cada card
- Likes/comentarios visibles
- Smooth animations con Framer Motion

---

## 🎭 Componentes Clave

### Avatar Component
```tsx
<div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-1">
  <div className="w-full h-full rounded-full bg-[#0f1419] p-1">
    <img className="w-full h-full rounded-full object-cover" />
  </div>
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="text-center">
    <div className="text-2xl font-bold">1.2K</div>
    <div className="text-sm text-gray-400">Seguidores</div>
  </div>
  {/* ... */}
</div>
```

### Badge Icon
```tsx
<div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
  <Award className="w-8 h-8 text-white" />
</div>
<p className="text-xs text-gray-400">Label</p>
```

### Masonry Grid
```tsx
<div className="columns-2 gap-3">
  {posts.map(post => (
    <div className="break-inside-avoid mb-3">
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        {/* Content */}
      </div>
    </div>
  ))}
</div>
```

---

## 🔧 Utilidades CSS

### Custom Scrollbar Hide
```css
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### Safe Areas (iOS notch)
```css
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Backdrop Blur
```tsx
<header className="bg-[#0f1419]/95 backdrop-blur-sm">
```

---

## 📱 Bottom Navigation

### Iconos
```
🏠 Inicio       → Home (filled cuando activo)
🔍 Buscar       → Search
👥 Ranking      → Users/TrendingUp
🔖 Guardado     → Bookmark
👤 Perfil       → User (filled cuando activo)
```

### Estados
```tsx
// Activo
className="text-blue-500"
fill="currentColor"

// Inactivo
className="text-gray-400"
```

---

## 🎯 Responsive Design

### Breakpoints
```
Mobile:  < 640px  (2 columnas)
Tablet:  640-768px (3 columnas - futuro)
Desktop: > 768px (4 columnas - futuro)
```

### Container
```tsx
className="container-mobile" // max-width: 640px
```

---

## 🚀 Animaciones

### Framer Motion
```tsx
// Fade in + slide up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
```

### Hover Effects
```tsx
// Scale en hover
className="group-hover:scale-110 transition-transform"

// Opacidad en hover
className="opacity-0 group-hover:opacity-100 transition-opacity"
```

---

## ✅ Checklist de Implementación

- [x] Dark theme aplicado globalmente
- [x] Perfil con nuevo diseño
- [x] Feed con masonry layout
- [x] Bottom navigation actualizada
- [x] Gradientes en elementos clave
- [x] Avatares con doble borde
- [x] Stats grid responsive
- [x] Badges con iconos
- [x] Hover effects en posts
- [x] Smooth animations

---

## 🎨 Próximas Mejoras

### Funcionalidades
1. Editar perfil con todos los campos
2. Subir fotos a colecciones
3. Sistema de badges real
4. Página de ranking
5. Búsqueda avanzada

### Diseño
1. Skeleton loaders
2. Pull to refresh
3. Infinite scroll
4. Lightbox para imágenes
5. Transiciones de página

---

## 📸 Vista Previa

### Perfil
```
┌─────────────────────┐
│   < Perfil     ⋮    │
├─────────────────────┤
│                     │
│      (Avatar)       │
│    🟠 circular      │
│                     │
│  Nombre Usuario     │
│  Tatuador Madrid    │
│                     │
│ [Seguir] [Mensaje]  │
│                     │
│  1.2K    4.9    58  │
│ Follow  Rate   Coll │
│                     │
│ Insignias y Logros  │
│ 🟡 🔵 🟢 →          │
│                     │
│   Colecciones       │
│ ┌────┐ ┌────┐      │
│ │img │ │img │      │
│ └────┘ └────┘      │
│ ┌────┐ ┌────┐      │
│ │img │ │img │      │
│ └────┘ └────┘      │
└─────────────────────┘
```

### Feed
```
┌─────────────────────┐
│ ArteNis    📈 💬    │
├─────────────────────┤
│ ┌────┐  ┌────┐     │
│ │    │  │    │     │
│ │img │  │    │     │
│ │    │  │img │     │
│ └────┘  │    │     │
│ 👤user  │    │     │
│         └────┘     │
│ ┌────┐  👤user     │
│ │    │             │
│ │img │  ┌────┐     │
│ └────┘  │img │     │
│ 👤user  └────┘     │
│         👤user     │
└─────────────────────┘
```

---

## 🎉 Resultado

**Diseño moderno, limpio y profesional** inspirado en las mejores apps de contenido visual. Optimizado para:
- ✅ Visualización de tatuajes
- ✅ Interacción social
- ✅ Navegación intuitiva
- ✅ Performance en móviles
- ✅ Instalación como PWA
