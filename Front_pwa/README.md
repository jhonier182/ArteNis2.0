# ArteNis 2.0 PWA

Progressive Web App para la plataforma social de artistas y tatuadores ArteNis 2.0.

## 🚀 Características

- ✅ **Instalable**: Puede instalarse en dispositivos móviles y de escritorio
- ✅ **Offline**: Funciona sin conexión gracias al Service Worker
- ✅ **Responsive**: Diseño adaptado a todos los tamaños de pantalla
- ✅ **Rápida**: Optimizada con Next.js y caché inteligente
- ✅ **Moderna**: UI/UX optimizada para móviles con animaciones fluidas

## 📱 Instalación

### En Android

1. Abre la app en Chrome
2. Toca el menú (3 puntos) → "Instalar aplicación" o "Añadir a la pantalla de inicio"
3. Confirma la instalación

### En iOS (iPhone/iPad)

1. Abre la app en Safari
2. Toca el botón de compartir (cuadrado con flecha hacia arriba)
3. Selecciona "Añadir a la pantalla de inicio"
4. Toca "Añadir"

### En PC (Chrome/Edge)

1. Abre la app en el navegador
2. Busca el icono de instalación en la barra de direcciones
3. Click en "Instalar"

## 🛠️ Desarrollo

### Requisitos

- Node.js 18+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
```

### Estructura del Proyecto

```
Front_pwa/
├── pages/              # Páginas de Next.js
│   ├── index.tsx      # Página principal
│   ├── login.tsx      # Inicio de sesión
│   ├── register.tsx   # Registro
│   ├── offline.tsx    # Página offline
│   ├── _app.tsx       # App wrapper
│   └── _document.tsx  # Document HTML
├── public/            # Archivos estáticos
│   ├── manifest.json  # Manifest de PWA
│   ├── sw.js         # Service Worker
│   └── *.png         # Iconos de la app
├── styles/           # Estilos globales
├── context/          # Contextos de React
├── utils/            # Utilidades
└── components/       # Componentes reutilizables
```

## 🔧 Configuración

### Variables de Entorno

La URL del API se configura en `next.config.js`:

```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://192.168.0.8:3000',
}
```

### Iconos de la PWA

Se necesitan iconos en estos tamaños:
- 192x192px: `/public/icon-192x192.png`
- 512x512px: `/public/icon-512x512.png`

Puedes generarlos desde un icono base usando herramientas como:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/

## 📦 Build y Deployment

### Build Local

```bash
npm run build
```

### Deploy en Vercel

```bash
npm install -g vercel
vercel
```

### Deploy en Netlify

1. Conecta tu repositorio en Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`

## 🎨 Personalización

### Colores del Tema

Edita `tailwind.config.js` para cambiar los colores:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',
        // ...
      },
    },
  },
}
```

### Manifest

Edita `public/manifest.json` para cambiar:
- Nombre de la app
- Color del tema
- Descripción
- Iconos

## 🔒 Seguridad

- Tokens guardados en `localStorage`
- Refresh token automático
- Interceptores de Axios para manejo de autenticación

## 📱 Características PWA

### Service Worker

- **Cache First**: Para recursos estáticos
- **Network First**: Para datos dinámicos
- **Offline Fallback**: Página offline cuando no hay conexión

### Manifest

- Display mode: `standalone` (pantalla completa)
- Orientación: `portrait-primary`
- Soporte para compartir contenido

## 🐛 Troubleshooting

### El Service Worker no se registra

1. Asegúrate de usar HTTPS o localhost
2. Verifica en DevTools → Application → Service Workers

### La app no se puede instalar

1. Verifica que el manifest.json sea válido
2. Asegúrate de tener los iconos en los tamaños correctos
3. Usa HTTPS en producción

### Problemas de caché

1. Desregistra el Service Worker en DevTools
2. Limpia la caché del navegador
3. Recarga con Ctrl+Shift+R

## 📄 Licencia

Propiedad de ArteNis 2.0

## 🤝 Contribución

Para contribuir al proyecto, contacta al equipo de desarrollo.
