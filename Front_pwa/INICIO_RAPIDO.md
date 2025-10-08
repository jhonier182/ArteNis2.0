# 🚀 Inicio Rápido - ArteNis PWA

## ✅ Pasos Completados

1. ✅ Estructura del proyecto creada
2. ✅ Dependencias instaladas
3. ✅ Configuración de Next.js lista
4. ✅ Service Worker configurado
5. ✅ Manifest.json creado
6. ✅ Páginas principales creadas (login, register, home, profile)
7. ✅ Sistema de autenticación implementado

## 🎯 Próximos Pasos

### 1. Generar Iconos (IMPORTANTE)

**Opción A - Generador Online (Recomendado):**
```
1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube tu logo (512x512px mínimo)
3. Descarga el paquete
4. Copia estos archivos a public/:
   - icon-192x192.png
   - icon-512x512.png
```

**Opción B - Usar el SVG Placeholder:**
```
1. Ve a: https://cloudconvert.com/svg-to-png
2. Sube: public/icon.svg
3. Convierte a 192x192px → Guarda como icon-192x192.png
4. Convierte a 512x512px → Guarda como icon-512x512.png
5. Coloca ambos en public/
```

### 2. Configurar la URL del Backend

Edita `next.config.js` si tu backend está en otra IP:

```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://TU_IP_AQUI:3000',
}
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará en: http://localhost:3000

### 4. Probar en tu Móvil

#### En la misma red WiFi:

1. Encuentra tu IP local:
   - Windows: `ipconfig` (busca IPv4)
   - Mac/Linux: `ifconfig` o `ip addr`

2. Abre en tu móvil:
   ```
   http://TU_IP:3000
   ```
   Ejemplo: http://192.168.1.100:3000

3. **Instalar la PWA:**
   - **Android/Chrome:** Menú → "Instalar aplicación"
   - **iOS/Safari:** Compartir → "Añadir a pantalla de inicio"

## 📱 Verificar que es una PWA

### En Chrome Desktop:
1. F12 → Application → Manifest
2. Verifica que aparezcan los iconos y la configuración

### Service Worker:
1. F12 → Application → Service Workers
2. Debe aparecer el Service Worker registrado

## 🎨 Características Incluidas

### Páginas:
- ✅ `/login` - Inicio de sesión
- ✅ `/register` - Registro de usuarios
- ✅ `/` - Feed principal (requiere autenticación)
- ✅ `/profile` - Perfil de usuario
- ✅ `/offline` - Página cuando no hay conexión

### Funcionalidades:
- ✅ Autenticación con JWT
- ✅ Refresh token automático
- ✅ Modo offline con Service Worker
- ✅ Instalable en dispositivos móviles
- ✅ Diseño responsive (mobile-first)
- ✅ Animaciones con Framer Motion
- ✅ Notificación de instalación

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

## 📦 Build para Producción

```bash
npm run build
npm start
```

## 🌐 Deploy

### Vercel (Recomendado):
```bash
npm install -g vercel
vercel
```

### Netlify:
```bash
npm run build
# Sube la carpeta .next
```

## 🐛 Solución de Problemas

### La PWA no se puede instalar:
1. Verifica que los iconos existan en public/
2. Usa HTTPS o localhost
3. Revisa el manifest en DevTools

### Error al conectar con el backend:
1. Verifica que el backend esté corriendo
2. Revisa la URL en next.config.js
3. Desactiva el firewall si es necesario

### Service Worker no se registra:
1. Usa HTTPS o localhost
2. Limpia caché del navegador
3. Verifica en DevTools → Application → Service Workers

## 🎯 Probar la Instalación

1. Abre la app en Chrome (móvil o desktop)
2. Debe aparecer un banner "Instalar ArteNis"
3. Click en "Instalar"
4. La app se abrirá en pantalla completa
5. Verifica el icono en tu pantalla de inicio

## 📱 Funciona sin Conexión

Una vez instalada:
1. Desconecta el WiFi/datos
2. Abre la app
3. Verás la página offline
4. El contenido en caché seguirá disponible

## 🎨 Personalización

### Cambiar colores:
Edita `tailwind.config.js`

### Cambiar nombre:
Edita `public/manifest.json`

### Agregar más páginas:
Crea archivos en `pages/`

## ✨ ¡Listo!

Tu PWA está lista para:
- ✅ Instalarse en cualquier dispositivo
- ✅ Funcionar offline
- ✅ Verse como app nativa
- ✅ Recibir actualizaciones automáticas

**Siguiente paso:** Genera tus iconos y ejecuta `npm run dev`
