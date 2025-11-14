<!-- 02d754b1-228d-4b18-b9fb-a93ee0eef947 ddee1226-53f5-42bf-b642-4e3c5db1e687 -->
# Plan: Implementar Flujo de Creación de Publicaciones Estilo Instagram

## Objetivo

Reestructurar el flujo de creación de publicaciones para que siga el patrón de Instagram: 3 pantallas separadas (Selección → Edición → Descripción) con navegación fluida y soporte para múltiples archivos.

## Estado Actual

- Una sola pantalla que combina selección, edición y descripción (`ImageEditor.tsx`)
- Solo permite 1 archivo (`multiple={false}`)
- La galería se abre automáticamente (100ms delay)
- Botón "Siguiente" existe pero solo abre la galería

## Cambios Requeridos

### 1. Crear Sistema de Navegación por Pasos

**Archivo:** `Front_pwa2/src/features/posts/pages/CreatePostPage.tsx`

- Agregar estado para el paso actual: `'select' | 'edit' | 'description'`
- Agregar estado para múltiples archivos: `selectedFiles: File[]` (máximo 3)
- Agregar estado para el índice de imagen actual en edición: `currentImageIndex: number`
- Agregar función `handleNextStep()` para avanzar entre pantallas
- Agregar función `handlePreviousStep()` para retroceder
- Modificar `handleFileSelect` para soportar múltiples archivos

### 2. Crear Componente de Selección de Contenido

**Nuevo archivo:** `Front_pwa2/src/features/posts/components/ContentSelector.tsx`

- Pantalla dedicada para seleccionar múltiples imágenes/videos
- Grid de miniaturas de la galería del dispositivo
- Indicadores numéricos en cada miniatura seleccionada (1, 2, 3...)
- Botón "Siguiente" en header (habilitado cuando hay al menos 1 archivo)
- Funcionalidad para:
  - Seleccionar/deseleccionar archivos
  - Reordenar arrastrando (drag & drop)
  - Eliminar archivo seleccionado
  - Vista previa al tocar miniatura
- Mostrar contador "X de 3" cuando hay selecciones

### 3. Refactorizar Componente de Edición

**Archivo:** `Front_pwa2/src/features/posts/components/ImageEditor.tsx`

- Separar la lógica de descripción (mover a componente dedicado)
- Mantener solo edición visual: filtros, ajustes, recorte, rotación
- Agregar navegación entre múltiples imágenes:
  - Flechas laterales o swipe para cambiar de imagen
  - Indicador "1 de 5" en el header
  - Edición independiente por imagen
- Botón "Siguiente" en header (solo cuando hay imagen)
- Remover sección de descripción del componente

### 4. Crear Componente de Descripción

**Nuevo archivo:** `Front_pwa2/src/features/posts/components/PostDescription.tsx`

- Pantalla dedicada solo para información del post
- Layout:
  - Preview de imágenes/videos en la parte superior (scroll horizontal si hay múltiples)
  - Campos de información debajo
- Campos:
  - Textarea para caption (expandible, límite 500 caracteres)
  - Detección automática de hashtags (#) y menciones (@)
  - Botón "Añadir ubicación" (opcional, implementación futura)
  - Botón "Etiquetar personas" (opcional, implementación futura)
  - Ajustes de privacidad (opcional, implementación futura)
- Botón "Compartir" en header (azul, estilo Instagram)
- Mostrar hashtags detectados como chips

### 5. Actualizar CreatePostPage para Orquestar los Pasos

**Archivo:** `Front_pwa2/src/features/posts/pages/CreatePostPage.tsx`

- Implementar lógica de navegación entre pasos:
  ```typescript
  const [currentStep, setCurrentStep] = useState<'select' | 'edit' | 'description'>('select')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  ```

- Renderizar componente según el paso:
  - `currentStep === 'select'` → `<ContentSelector />`
  - `currentStep === 'edit'` → `<ImageEditor />`
  - `currentStep === 'description'` → `<PostDescription />`
- Pasar datos entre componentes mediante props y callbacks
- Mantener estado de ediciones por imagen (filtros, ajustes aplicados)

### 6. Implementar Soporte para Múltiples Archivos

**Archivo:** `Front_pwa2/src/features/posts/pages/CreatePostPage.tsx`

- Cambiar input file a `multiple={true}`
- Modificar `handleFileSelect` para manejar array de archivos
- Validar máximo 3 archivos
- Crear previews para todos los archivos seleccionados
- Al publicar, subir todos los archivos en secuencia

### 7. Mejorar UX de Navegación

**Todos los componentes:**

- Botón "Atrás" (X) siempre visible en esquina superior izquierda
- Botón "Siguiente" en esquina superior derecha:
  - Texto azul cuando está habilitado
  - Gris cuando está deshabilitado
  - Solo visible cuando procede avanzar
- Transiciones suaves entre pantallas (framer-motion)
- Feedback visual inmediato en todas las acciones

### 8. Actualizar Lógica de Publicación

**Archivo:** `Front_pwa2/src/features/posts/pages/CreatePostPage.tsx`

- Modificar `handlePublish` para:
  - Subir múltiples archivos en secuencia
  - Crear post con array de URLs de media
  - Mostrar progreso de subida (X de Y archivos)
- Mantener compatibilidad con posts de un solo archivo

## Estructura de Archivos

```
Front_pwa2/src/features/posts/
├── pages/
│   └── CreatePostPage.tsx (orquestador principal)
├── components/
│   ├── ContentSelector.tsx (NUEVO - Paso 1)
│   ├── ImageEditor.tsx (REFACTORIZAR - Paso 2)
│   └── PostDescription.tsx (NUEVO - Paso 3)
```

## Flujo de Usuario Final

1. Usuario toca "+" → Se abre automáticamente `ContentSelector`
2. Selecciona 1-3 imágenes/videos → Toca "Siguiente"
3. Pantalla de edición → Aplica filtros/ajustes → Toca "Siguiente"
4. Pantalla de descripción → Escribe caption → Toca "Compartir"
5. Proceso de publicación → Redirección al feed

## Consideraciones Técnicas

- Mantener compatibilidad con modo edición (solo descripción)
- Optimizar rendimiento con múltiples archivos grandes
- Manejar errores de subida de archivos individuales
- Limpiar recursos (URLs de objetos) al cambiar de paso
- Guardar estado de ediciones por imagen en memoria

## Prioridades

1. **Fase 1 (Crítico):** Separar en 3 pantallas y navegación básica
2. **Fase 2 (Importante):** Soporte para múltiples archivos
3. **Fase 3 (Mejora):** Reordenar archivos, edición independiente por imagen
4. **Fase 4 (Futuro):** Ubicación, etiquetar personas, privacidad avanzada

### To-dos

- [ ] Implementar sistema de navegación por pasos en CreatePostPage (select, edit, description)
- [ ] Crear componente ContentSelector.tsx para selección de múltiples archivos con grid de miniaturas
- [ ] Refactorizar ImageEditor.tsx para remover descripción y agregar navegación entre múltiples imágenes
- [ ] Crear componente PostDescription.tsx para caption, hashtags y configuración
- [ ] Implementar soporte para múltiples archivos (hasta 3) en CreatePostPage
- [ ] Agregar funcionalidad de reordenar archivos arrastrando en ContentSelector
- [ ] Implementar edición independiente por imagen con navegación entre ellas
- [ ] Actualizar lógica de publicación para subir múltiples archivos en secuencia