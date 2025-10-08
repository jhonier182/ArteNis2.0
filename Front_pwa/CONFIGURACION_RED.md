# 🌐 Configuración de Red - ArteNis PWA

## 📡 Configuración Actual

### Backend
- **Puerto:** `3000`
- **URL:** `http://192.168.1.4:3000`

### Frontend PWA
- **Puerto:** `3001`
- **URL:** `http://192.168.1.4:3001`

### IP Local
- **IP:** `192.168.1.4`

---

## 🚀 Cómo Iniciar

### 1. Backend (Terminal 1)
```bash
cd Backend
npm run dev

# Deberías ver:
# ✅ Servidor ArteNis iniciado en http://localhost:3000
# O
# ✅ Servidor ArteNis iniciado en http://192.168.1.4:3000
```

### 2. Frontend PWA (Terminal 2)
```bash
cd Front_pwa
npm run dev

# Deberías ver:
# ▲ Next.js 14.0.4
# - Local:    http://localhost:3001
# - Network:  http://192.168.1.4:3001
```

---

## 📱 Acceder desde Diferentes Dispositivos

### Desde tu PC (localhost)
```
http://localhost:3001
```

### Desde tu Móvil (misma WiFi)
```
http://192.168.1.4:3001
```

### Desde otro PC (misma red)
```
http://192.168.1.4:3001
```

---

## ⚙️ Archivos Configurados

### Frontend: `next.config.js`
```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://192.168.1.4:3000'
}
```

### Frontend: `package.json`
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
```

### Backend: `app.js`
```javascript
const allowedOriginsDev = [
  'http://localhost:3001',
  'http://192.168.1.4:3001', // Frontend PWA
  // ... más orígenes
]
```

---

## 🔧 Configuración CORS

El backend acepta peticiones desde:
- ✅ `http://localhost:3001`
- ✅ `http://192.168.1.4:3001`
- ✅ Cualquier IP en rango `192.168.x.x`
- ✅ PWA instalada (sin origin)

---

## 🧪 Verificar Conexión

### Test 1: Health Check del Backend
```bash
curl http://192.168.1.4:3000/health

# Debe retornar:
# {
#   "success": true,
#   "message": "ArteNis API funcionando correctamente",
#   ...
# }
```

### Test 2: Acceder al Frontend
1. Abre navegador
2. Ve a: `http://192.168.1.4:3001`
3. Deberías ver la página de login/registro

### Test 3: Verificar CORS
1. Abre DevTools (F12)
2. Ve a Network tab
3. Haz una petición (registro/login)
4. No debe haber errores CORS ✅

---

## 📱 Instalar PWA en Móvil

### Android (Chrome)
1. Abre `http://192.168.1.4:3001` en Chrome
2. Toca menú (⋮)
3. "Instalar aplicación" o "Añadir a pantalla de inicio"
4. Confirma instalación
5. ✅ Ícono de ArteNis en tu pantalla

### iPhone (Safari)
1. Abre `http://192.168.1.4:3001` en Safari
2. Toca botón compartir (□↑)
3. "Añadir a pantalla de inicio"
4. Toca "Añadir"
5. ✅ Ícono de ArteNis en tu pantalla

---

## 🔍 Troubleshooting

### Error: "Cannot connect to backend"

**Solución 1: Verifica que el backend está corriendo**
```bash
# En Backend/
npm run dev
```

**Solución 2: Verifica la IP**
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux

# Debe ser: 192.168.1.4
```

**Solución 3: Firewall**
- Windows: Permitir Node.js en Firewall
- Agregar excepción para puertos 3000 y 3001

### Error: CORS

**Solución:**
1. Reinicia el backend
2. Verifica que `http://192.168.1.4:3001` esté en allowedOriginsDev
3. Revisa consola del backend para logs CORS

### No puedo acceder desde móvil

**Solución:**
1. PC y móvil deben estar en la **misma red WiFi**
2. Verifica la IP con `ipconfig`
3. Desactiva VPN si está activa
4. Prueba hacer ping desde móvil:
   ```
   ping 192.168.1.4
   ```

---

## 📊 Puertos Usados

| Servicio | Puerto | URL Completa |
|----------|--------|--------------|
| Backend API | 3000 | http://192.168.1.4:3000 |
| Frontend PWA | 3001 | http://192.168.1.4:3001 |
| Base de Datos | 3306 | localhost:3306 |

---

## 🔐 Seguridad en Red Local

### Desarrollo (Red Local)
- ✅ HTTP está bien
- ✅ CORS permisivo
- ✅ Sin HTTPS necesario

### Producción (Internet)
- ⚠️ Requiere HTTPS
- ⚠️ CORS restrictivo
- ⚠️ Certificado SSL necesario

---

## ✅ Checklist de Configuración

- [x] Backend configurado en puerto 3000
- [x] Frontend configurado en puerto 3001
- [x] IP correcta: 192.168.1.4
- [x] CORS permite 192.168.1.4:3001
- [x] next.config.js apunta a backend correcto
- [x] package.json usa puerto 3001
- [x] Ambos servicios en misma red

---

## 🎯 URLs Finales

### Desarrollo Local (PC)
```
Frontend: http://localhost:3001
Backend:  http://localhost:3000
```

### Desarrollo Red Local (Móvil/Otros)
```
Frontend: http://192.168.1.4:3001
Backend:  http://192.168.1.4:3000
```

### Endpoints del API
```
Health:   http://192.168.1.4:3000/health
Login:    http://192.168.1.4:3000/api/auth/login
Register: http://192.168.1.4:3000/api/auth/register
Posts:    http://192.168.1.4:3000/api/posts
Profile:  http://192.168.1.4:3000/api/profile/me
```

---

## 🚀 ¡Listo para Usar!

1. Inicia Backend en puerto 3000
2. Inicia Frontend en puerto 3001
3. Accede desde PC: `http://localhost:3001`
4. Accede desde móvil: `http://192.168.1.4:3001`
5. Instala como PWA en tu dispositivo
6. ¡Disfruta ArteNis! 🎉
