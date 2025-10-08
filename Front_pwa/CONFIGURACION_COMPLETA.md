# ✅ Configuración Completa - ArteNis PWA

## 🎯 Resumen de Configuración

### Red Local
- **IP:** `192.168.1.4`
- **Backend:** Puerto `3000`
- **Frontend:** Puerto `3001`

---

## 📋 Archivos Configurados

### ✅ Frontend

#### `next.config.js`
```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://192.168.1.4:3000'
}
```

#### `package.json`
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
```

### ✅ Backend

#### `src/app.js`
```javascript
const allowedOriginsDev = [
  'http://localhost:3001',
  'http://192.168.1.4:3001', // Frontend PWA
  // ... más orígenes permitidos
]
```

---

## 🚀 Inicio Rápido

### Terminal 1: Backend
```bash
cd C:\Users\YHONIEr\Desktop\ArteNis2.0\Backend
npm run dev

# Output esperado:
# ✅ Servidor ArteNis iniciado en http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd C:\Users\YHONIEr\Desktop\ArteNis2.0\Front_pwa
npm run dev

# Output esperado:
# ▲ Next.js 14.0.4
# - Local:    http://localhost:3001
# - Network:  http://192.168.1.4:3001
```

---

## 🌐 URLs de Acceso

### Desde tu PC
```
Frontend: http://localhost:3001
Backend:  http://localhost:3000
```

### Desde tu Móvil (misma WiFi)
```
Frontend: http://192.168.1.4:3001
Backend:  http://192.168.1.4:3000 (API)
```

---

## 📱 Instalación PWA

### En tu PC (Chrome/Edge)
1. Abre `http://localhost:3001`
2. Busca ícono de instalación en barra de direcciones
3. Click "Instalar"
4. ✅ App instalada

### En tu Móvil

#### Android (Chrome)
1. Abre `http://192.168.1.4:3001`
2. Menú (⋮) → "Instalar aplicación"
3. ✅ Ícono en pantalla de inicio

#### iPhone (Safari)
1. Abre `http://192.168.1.4:3001`
2. Compartir (□↑) → "Añadir a pantalla de inicio"
3. ✅ Ícono en pantalla de inicio

---

## 🧪 Verificación

### 1. Backend Funcionando
```bash
curl http://192.168.1.4:3000/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "ArteNis API funcionando correctamente",
  "database": {
    "status": "connected"
  }
}
```

### 2. Frontend Accesible
- Navega a: `http://192.168.1.4:3001`
- Deberías ver la página de login/registro

### 3. CORS Configurado
- Abre DevTools (F12) → Network
- Intenta hacer login/registro
- No debe haber errores CORS ✅

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────┐
│  Móvil/PC (Cliente)                     │
│  http://192.168.1.4:3001                │
└─────────────┬───────────────────────────┘
              │
              │ HTTP Request
              │ (CORS permitido)
              ▼
┌─────────────────────────────────────────┐
│  Frontend Next.js                       │
│  Puerto: 3001                           │
│  IP: 192.168.1.4                        │
└─────────────┬───────────────────────────┘
              │
              │ API Call
              │ axios.post('/api/auth/login')
              │ → http://192.168.1.4:3000
              ▼
┌─────────────────────────────────────────┐
│  Backend Express                        │
│  Puerto: 3000                           │
│  IP: 192.168.1.4                        │
└─────────────┬───────────────────────────┘
              │
              │ Query
              ▼
┌─────────────────────────────────────────┐
│  MySQL Database                         │
│  Puerto: 3306                           │
│  Host: localhost                        │
└─────────────────────────────────────────┘
```

---

## 🔐 Seguridad CORS

### Desarrollo (actual)
```javascript
// Permite:
- localhost:3001 ✅
- 192.168.1.4:3001 ✅
- Cualquier IP LAN ✅
- PWA instalada ✅
```

### Producción (futuro)
```javascript
// Solo permite:
- https://artenis.app
- https://www.artenis.app
- HTTPS obligatorio
```

---

## 🎨 Características PWA Activas

- ✅ Manifest configurado
- ✅ Service Worker registrado
- ✅ Instalable en dispositivos
- ✅ Funciona offline (básico)
- ✅ Iconos responsive
- ✅ Splash screen
- ✅ Modo standalone

---

## 📝 Checklist Pre-Uso

### Backend
- [ ] MySQL corriendo
- [ ] Variables .env configuradas
- [ ] npm run dev ejecutándose
- [ ] Puerto 3000 libre
- [ ] Health check responde

### Frontend
- [ ] Dependencias instaladas (npm install)
- [ ] next.config.js con IP correcta
- [ ] npm run dev ejecutándose
- [ ] Puerto 3001 libre
- [ ] Accesible desde navegador

### Red
- [ ] PC y móvil en misma WiFi
- [ ] IP: 192.168.1.4 confirmada
- [ ] Firewall permite puertos 3000 y 3001
- [ ] CORS sin errores

---

## 🚨 Troubleshooting Rápido

### Error: "Cannot connect to backend"
```bash
# Verifica backend está corriendo
cd Backend
npm run dev
```

### Error: "Port 3001 already in use"
```bash
# Mata proceso en puerto 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# O cambia puerto en package.json
```

### Error: CORS
```bash
# Reinicia backend
cd Backend
npm run dev

# Verifica en Backend/src/app.js que:
# 'http://192.168.1.4:3001' está en allowedOriginsDev
```

### No accede desde móvil
1. Verifica misma WiFi
2. Ping a 192.168.1.4 desde móvil
3. Desactiva VPN si está activa
4. Revisa firewall de Windows

---

## ✅ Estado Final

| Componente | Estado | URL |
|------------|--------|-----|
| Backend | ✅ Configurado | http://192.168.1.4:3000 |
| Frontend | ✅ Configurado | http://192.168.1.4:3001 |
| CORS | ✅ Permitido | Frontend → Backend |
| PWA | ✅ Instalable | En todos los dispositivos |
| Base de Datos | ✅ MySQL | localhost:3306 |

---

## 🎉 ¡Todo Listo!

### Próximos Pasos

1. **Inicia ambos servicios** (Backend + Frontend)
2. **Accede desde navegador** (PC o móvil)
3. **Registra un usuario** en `/register`
4. **Haz login** en `/login`
5. **Explora el feed** en `/`
6. **Instala la PWA** en tu dispositivo

### Documentación Adicional

- `CONFIGURACION_RED.md` - Detalles de red
- `COMANDOS.md` - Comandos rápidos
- `INICIO_RAPIDO.md` - Guía de inicio
- `ESTADO_SINCRONIZACION.md` - Estado del proyecto
- `VALIDACIONES_REGISTRO.md` - Validaciones

---

**ArteNis 2.0 PWA está 100% configurado y listo para usar** 🚀
