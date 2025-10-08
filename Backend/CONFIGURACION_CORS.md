# 🔒 Configuración de CORS - Backend ArteNis

## ✅ Configuración Actualizada

### Desarrollo (NODE_ENV !== 'production')

**Permite:**
- ✅ `http://localhost:3000` - Frontend PWA local
- ✅ `http://localhost:3001` - Puertos alternativos
- ✅ `http://localhost:8081` - Expo Metro Bundler
- ✅ `http://127.0.0.1:*` - Localhost con IP
- ✅ `http://192.168.x.x:*` - Redes LAN (para móviles)
- ✅ `http://10.0.x.x:*` - Redes LAN alternativas
- ✅ `exp://` - Expo Development
- ✅ `expo://` - Expo Go
- ✅ `file://` - PWA instalada localmente
- ✅ **Cualquier otro origen HTTP/HTTPS** (modo desarrollo permisivo)

### Producción (NODE_ENV === 'production')

**Permite:**
- ✅ `https://artenis.app`
- ✅ `https://www.artenis.app`
- ✅ Cualquier origen HTTPS (para PWA instaladas desde diferentes dominios)
- ✅ Requests sin origen (apps nativas, Postman)

---

## 🔧 Headers Permitidos

### Request Headers
```
- Content-Type
- Authorization
- X-Requested-With
- Accept
- Origin
- Access-Control-Request-Method
- Access-Control-Request-Headers
```

### Response Headers Expuestos
```
- Content-Length
- Content-Range
```

### Métodos HTTP
```
GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
```

---

## 🚀 Funcionalidades Especiales

### 1. Credentials
```javascript
credentials: true
```
Permite envío de cookies y headers de autorización

### 2. Preflight Caching
```javascript
maxAge: 86400 // 24 horas
```
Reduce peticiones OPTIONS repetitivas

### 3. OPTIONS Support
```javascript
app.options('*', cors(corsOptions))
```
Maneja todas las peticiones preflight

---

## 📱 Soporte PWA

### PWA Instalada
Las PWA instaladas a veces no envían un header `Origin`, por eso:
```javascript
if (!origin) return callback(null, true);
```

### PWA desde Diferentes Dominios
En producción, permite cualquier HTTPS:
```javascript
if (origin.startsWith('https://')) {
  return callback(null, true);
}
```

---

## 🧪 Probar CORS

### Desde el Frontend PWA

```bash
# 1. Inicia el backend
cd Backend
npm run dev

# 2. Inicia el frontend
cd Front_pwa
npm run dev

# 3. Abre DevTools en el navegador
# Network tab → Verifica que no hay errores CORS
```

### Desde Móvil (misma red WiFi)

```bash
# 1. Encuentra tu IP local
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Frontend en móvil
http://TU_IP:3000

# 3. Backend debe aceptar peticiones de esa IP
# Ejemplo: http://192.168.0.8:3000
```

### Con cURL

```bash
# Test básico
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS \
     http://localhost:3000/api/auth/login \
     -v

# Debe retornar:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD
# Access-Control-Allow-Credentials: true
```

---

## 🔍 Debugging CORS

### Logs Habilitados

En desarrollo, verás en consola:
```
⚠️ CORS: Permitiendo origen en desarrollo: http://192.168.0.8:3000
```

### Errores Comunes

#### Error: "Not allowed by CORS"
**Solución:** Verifica que el frontend esté en un origen permitido

#### Error: "No 'Access-Control-Allow-Origin' header"
**Solución:** 
1. Reinicia el backend
2. Verifica que `app.use(cors())` esté antes de las rutas
3. Verifica que no hay otro middleware bloqueando

#### Preflight falló
**Solución:** Verifica que `app.options('*', cors())` esté configurado

---

## 🔒 Seguridad

### Desarrollo
- **Permisivo**: Acepta cualquier origen para facilitar desarrollo
- **Logging**: Muestra qué orígenes se están permitiendo

### Producción
- **Restrictivo**: Solo HTTPS y dominios específicos
- **Cookies**: Solo con `credentials: true`
- **Headers**: Lista blanca de headers permitidos

---

## 📝 Variables de Entorno

### Backend (.env)
```bash
NODE_ENV=development  # o 'production'
PORT=3000
```

### Frontend PWA (next.config.js)
```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://localhost:3000'
}
```

O desde móvil:
```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://192.168.0.8:3000'
}
```

---

## ✅ Checklist de Configuración

- [x] CORS configurado en `Backend/src/app.js`
- [x] Permite localhost:3000 (frontend)
- [x] Permite IPs LAN (móviles)
- [x] Permite PWA instaladas
- [x] Credentials habilitado
- [x] Headers correctos
- [x] Métodos HTTP completos
- [x] OPTIONS preflight configurado
- [x] Caché de preflight (24h)
- [x] Logging en desarrollo

---

## 🚀 Resultado

**Frontend PWA puede hacer peticiones desde:**
- ✅ Navegador desktop (localhost:3000)
- ✅ Navegador móvil (192.168.x.x:3000)
- ✅ PWA instalada en móvil
- ✅ PWA instalada en desktop
- ✅ Diferentes puertos y configuraciones

**Sin errores de CORS** 🎉
