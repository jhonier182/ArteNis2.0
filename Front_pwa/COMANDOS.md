# 🚀 Comandos Rápidos

## Iniciar Desarrollo

```bash
npm run dev
```

Abre: http://localhost:3000

## Para Móvil (en la misma red WiFi)

### 1. Encuentra tu IP:
```powershell
ipconfig
```
Busca "Dirección IPv4" → Ejemplo: 192.168.1.100

### 2. Abre en el móvil:
```
http://192.168.1.100:3000
```

### 3. Instalar la PWA:
- **Android:** Menú → "Instalar aplicación"
- **iOS:** Compartir → "Añadir a pantalla de inicio"

## Generar Iconos (IMPORTANTE)

https://www.pwabuilder.com/imageGenerator

Descarga y copia a `public/`:
- icon-192x192.png
- icon-512x512.png

## Build Producción

```bash
npm run build
npm start
```

## Deploy Rápido

```bash
npm install -g vercel
vercel
```

## ¡Listo! 🎉
