# 🔧 Configuración de Variables de Entorno - ArteNis

Este documento explica cómo configurar las variables de entorno para ambos proyectos (Backend y Frontend) sin exponer IPs en el código.

## 📁 Estructura de Archivos

```
ArteNis2.0/
├── Backend/
│   ├── .env                    # Variables de entorno del backend
│   └── .env.example           # Plantilla del backend
└── Front_pwa/
    ├── .env.local             # Variables de entorno del frontend
    └── env.local.example      # Plantilla del frontend
```

## 🖥️ Backend - Configuración

### Archivo `.env` (Backend)

```env
# ===========================================
# CONFIGURACIÓN DE SERVIDOR
# ===========================================
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# ===========================================
# CONFIGURACIÓN DE CORS
# ===========================================
# Orígenes permitidos para CORS (separados por comas)
CORS_ORIGINS=http://localhost:3001,http://192.168.1.3:3001,http://192.168.1.4:3001

# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=artenis_db
DB_USER=root
DB_PASSWORD=tu_password_aqui

# ===========================================
# CONFIGURACIÓN DE JWT
# ===========================================
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# CONFIGURACIÓN DE CLOUDINARY
# ===========================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Variables Importantes del Backend:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `HOST` | IP donde escucha el servidor | `0.0.0.0` (todas las interfaces) |
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGINS` | Orígenes permitidos para CORS | `http://192.168.1.3:3001` |

## 📱 Frontend - Configuración

### Archivo `.env.local` (Frontend)

```env
# ===========================================
# CONFIGURACIÓN DE API
# ===========================================
# URL base del backend API - CONFIGURAR CON TU IP
NEXT_PUBLIC_API_URL=http://192.168.1.3:3000

# ===========================================
# CONFIGURACIÓN DE IMÁGENES
# ===========================================
# Dominios permitidos para optimización de imágenes (separados por comas)
NEXT_PUBLIC_IMAGE_DOMAINS=localhost,127.0.0.1,192.168.1.3

# ===========================================
# CONFIGURACIÓN DE DESARROLLO
# ===========================================
NEXT_PUBLIC_DEBUG=true

# ===========================================
# CONFIGURACIÓN DE PWA
# ===========================================
NEXT_PUBLIC_APP_NAME=ArteNis
NEXT_PUBLIC_APP_DESCRIPTION=Plataforma de arte digital
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### Variables Importantes del Frontend:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://192.168.1.3:3000` |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | Dominios para imágenes | `localhost,127.0.0.1,192.168.1.3` |
| `NEXT_PUBLIC_DEBUG` | Modo debug | `true` |

## 🚀 Configuración Rápida

### 1. Backend
```bash
cd Backend
# Editar .env con tus valores
# Especialmente CORS_ORIGINS con la IP de tu frontend
```

### 2. Frontend
```bash
cd Front_pwa
# Copiar plantilla
copy env.local.example .env.local
# Editar .env.local con tu IP del backend
```

## 🔄 Flujo de Configuración

### Para Desarrollo Local:
1. **Backend**: `HOST=0.0.0.0` para escuchar en todas las interfaces
2. **Backend**: `CORS_ORIGINS` debe incluir la IP de tu frontend
3. **Frontend**: `NEXT_PUBLIC_API_URL` debe apuntar a la IP del backend

### Para Producción:
1. **Backend**: `HOST=0.0.0.0` y `CORS_ORIGINS` con dominios de producción
2. **Frontend**: `NEXT_PUBLIC_API_URL` con el dominio de producción

## 🔧 Comandos Útiles

### Verificar Variables Cargadas:
```bash
# Backend
node -e "require('dotenv').config(); console.log('CORS_ORIGINS:', process.env.CORS_ORIGINS)"

# Frontend
npm run env:check
```

### Reiniciar Servicios:
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## ⚠️ Consideraciones de Seguridad

### 1. Archivos .env
- **NUNCA** subir archivos `.env` o `.env.local` al repositorio
- Usar `.env.example` como plantilla
- Cada desarrollador debe crear su propio archivo `.env`

### 2. Variables Públicas
- Solo variables con prefijo `NEXT_PUBLIC_` están disponibles en el cliente
- No poner información sensible en variables públicas

### 3. CORS
- Configurar `CORS_ORIGINS` solo con orígenes necesarios
- En producción, usar dominios específicos

## 🐛 Troubleshooting

### Problema: Frontend no se conecta al backend
**Solución**:
1. Verificar que `NEXT_PUBLIC_API_URL` en frontend coincida con la IP del backend
2. Verificar que `CORS_ORIGINS` en backend incluya la IP del frontend
3. Verificar que el backend esté ejecutándose en `HOST=0.0.0.0`

### Problema: CORS Error
**Solución**:
1. Agregar la IP del frontend a `CORS_ORIGINS` en el backend
2. Reiniciar el backend después de cambiar CORS_ORIGINS

### Problema: Imágenes no cargan
**Solución**:
1. Agregar el dominio de las imágenes a `NEXT_PUBLIC_IMAGE_DOMAINS`
2. Reiniciar el frontend

## 📚 Ejemplos de Configuración

### Desarrollo con IP 192.168.1.3:

**Backend (.env)**:
```env
HOST=0.0.0.0
PORT=3000
CORS_ORIGINS=http://localhost:3001,http://192.168.1.3:3001
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.3:3000
NEXT_PUBLIC_IMAGE_DOMAINS=localhost,127.0.0.1,192.168.1.3
```

### Producción:

**Backend (.env)**:
```env
HOST=0.0.0.0
PORT=3000
CORS_ORIGINS=https://artenis.app,https://www.artenis.app
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://api.artenis.com
NEXT_PUBLIC_IMAGE_DOMAINS=artenis.app,api.artenis.com
```
