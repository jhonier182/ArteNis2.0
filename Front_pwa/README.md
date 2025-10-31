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

Para acceder desde dispositivos móviles, necesitas configurar la IP local de tu red.

#### 1. Obtener tu IP local

**Windows:**
```bash
ipconfig
```
Busca la dirección IPv4 de tu adaptador de red (ej: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
o
```bash
ip addr show
```

#### 2. Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto `Front_pwa/` con:

```env
# Reemplaza TU_IP_LOCAL con tu IP local (ej: 192.168.1.100)
NEXT_PUBLIC_API_URL=http://TU_IP_LOCAL:3000

# Opcional: habilitar debug
NEXT_PUBLIC_DEBUG=false
```

**Ejemplo:**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3000
```

#### 3. Acceder desde tu móvil

1. Asegúrate de que tu móvil esté en la **misma red WiFi** que tu computadora
2. Inicia el servidor con `npm start`
3. Abre en tu navegador móvil: `http://TU_IP_LOCAL:3001`
   - Ejemplo: `http://192.168.1.100:3001`

#### ⚠️ Importante

- El backend también debe estar escuchando en `0.0.0.0` (ya configurado por defecto)
- Ambos dispositivos deben estar en la misma red local
- Tu firewall podría bloquear las conexiones - permite el puerto 3001 si es necesario

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

### No puedo conectarme desde el móvil

1. **Verifica que el servidor esté escuchando en todas las interfaces:**
   - El script `npm start` ahora incluye `-H 0.0.0.0` automáticamente
   - Reinicia el servidor si lo habías iniciado antes del cambio

2. **Verifica tu IP local:**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

3. **Asegúrate de que el `.env.local` tenga la IP correcta:**
   - Debe ser tu IP local, NO `localhost` ni `127.0.0.1`
   - Formato: `http://192.168.X.X:3000`

4. **Verifica el firewall:**
   - Windows: Permite Next.js a través del firewall
   - Mac: Verifica en Preferencias del Sistema → Seguridad

5. **Asegúrate de estar en la misma red WiFi:**
   - Tu PC y móvil deben estar en la misma red local

6. **Reconstruye la app después de cambiar .env.local:**
   ```bash
   npm run build
   npm start
   ```

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
