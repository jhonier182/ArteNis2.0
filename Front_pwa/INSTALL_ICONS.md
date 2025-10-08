# 📱 Guía para Generar Iconos de la PWA

## Opción 1: Usar un generador online (Recomendado)

### PWA Builder
1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube tu logo/icono base (mínimo 512x512px)
3. Descarga el paquete de iconos
4. Copia `icon-192x192.png` y `icon-512x512.png` a la carpeta `public/`

### RealFaviconGenerator
1. Ve a https://realfavicongenerator.net/
2. Sube tu logo
3. Configura las opciones para PWA
4. Descarga y extrae los iconos necesarios

## Opción 2: Crear manualmente con GIMP/Photoshop

1. Abre tu logo en tu editor favorito
2. Redimensiona a 512x512px (alta calidad)
3. Guarda como `icon-512x512.png`
4. Redimensiona a 192x192px
5. Guarda como `icon-192x192.png`
6. Coloca ambos archivos en `public/`

## Opción 3: Usar el SVG incluido temporalmente

El archivo `public/icon.svg` es un placeholder. Para convertirlo a PNG:

### Con ImageMagick (línea de comandos):
```bash
# Instalar ImageMagick primero
# En Windows: choco install imagemagick
# En Mac: brew install imagemagick
# En Linux: sudo apt-get install imagemagick

# Generar iconos
magick convert -background none public/icon.svg -resize 192x192 public/icon-192x192.png
magick convert -background none public/icon.svg -resize 512x512 public/icon-512x512.png
```

### Con un convertidor online:
1. Ve a https://cloudconvert.com/svg-to-png
2. Sube `public/icon.svg`
3. Configura el tamaño de salida (192x192 o 512x512)
4. Descarga y renombra el archivo

## Requisitos de los iconos

- **Formato**: PNG
- **Tamaños necesarios**:
  - 192x192px (icono principal)
  - 512x512px (pantalla de inicio)
- **Fondo**: Preferiblemente transparente o color sólido
- **Diseño**: Simple y reconocible en tamaños pequeños

## Verificación

1. Coloca los archivos en `public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

2. Verifica que el manifest los reconozca abriendo:
   - http://localhost:3000/manifest.json
   
3. Prueba en Chrome DevTools:
   - F12 → Application → Manifest
   - Verifica que los iconos se muestren correctamente

## Personalización Avanzada

Para más iconos y splash screens, edita `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    // ... más tamaños
  ]
}
```
