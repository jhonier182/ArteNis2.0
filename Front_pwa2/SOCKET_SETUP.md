# 🔌 Sincronización en Tiempo Real - Socket.io Setup

## 📦 Instalación de Dependencias

### Backend
```bash
cd Backend
npm install socket.io
```
**Nota:** El `package.json` ya fue actualizado, solo ejecuta `npm install` si no se instala automáticamente.

### Frontend
```bash
cd Front_pwa2
npm install socket.io-client
```

**¡IMPORTANTE!** Ejecuta estos comandos antes de probar la funcionalidad.

---

## ✅ Implementación Completada

### 1. Backend (`Backend/src/server.js`)
- ✅ Configurado servidor HTTP con Socket.io
- ✅ Conexión automática por sala de usuario (userId)
- ✅ CORS configurado para desarrollo y producción

### 2. Controladores (`Backend/src/controllers/followController.js`)
- ✅ Emite evento `FOLLOW_UPDATED` al seguir usuario
- ✅ Emite evento `FOLLOW_UPDATED` al dejar de seguir
- ✅ Evento incluye: `targetUserId`, `isFollowing`, `action`, `timestamp`

### 3. Frontend - Hook (`Front_pwa2/src/hooks/useFollowSocket.ts`)
- ✅ Hook personalizado para manejar conexión Socket.io
- ✅ Se conecta automáticamente cuando hay usuario autenticado
- ✅ Escucha eventos `FOLLOW_UPDATED`
- ✅ Actualiza automáticamente el `FollowingContext`
- ✅ Reconexión automática en caso de desconexión

### 4. Frontend - Provider (`Front_pwa2/src/app/SocketProvider.tsx`)
- ✅ Provider que inicializa el socket
- ✅ Integrado en el árbol de providers

### 5. Frontend - Providers (`Front_pwa2/src/app/providers.tsx`)
- ✅ SocketProvider agregado al árbol de providers
- ✅ Orden correcto: Auth → Following → Socket

---

## 🚀 Cómo Funciona

### Flujo de Sincronización:

1. **Usuario sigue a alguien en Web:**
   ```
   Usuario → Click "Seguir" → Backend guarda → Emite evento → Todos los dispositivos actualizan
   ```

2. **Usuario deja de seguir en Móvil:**
   ```
   Usuario → Click "Dejar de seguir" → Backend guarda → Emite evento → Web actualiza automáticamente
   ```

3. **Evento Socket.io:**
   ```json
   {
     "targetUserId": "user-123",
     "isFollowing": true,
     "action": "follow",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

---

## 🧪 Testing

### Prueba Manual:

1. **Abre la app en Web y Móvil** con la misma cuenta
2. **En Web:** Haz clic en "Seguir" a un usuario
3. **En Móvil:** El botón debe cambiar a "Siguiendo" automáticamente (sin refrescar)
4. **En Móvil:** Haz clic en "Dejar de seguir"
5. **En Web:** El botón debe cambiar a "Seguir" automáticamente

---

## 🔍 Debugging

### Ver logs en Backend:
- Conexiones: `🔌 Socket conectado - Usuario: {userId}`
- Desconexiones: `🔌 Socket desconectado - Usuario: {userId}`

### Ver logs en Frontend (consola del navegador):
- Conexión: `✅ Socket.io conectado: {socketId}`
- Eventos: `📡 Evento FOLLOW_UPDATED recibido: {data}`
- Sincronización: `✅ Sincronizado: Siguiendo a {userId}`

---

## ⚙️ Configuración

### Variables de Entorno Backend:
No se requieren variables adicionales. El servidor Socket.io se inicializa automáticamente en el mismo puerto que Express.

### Variables de Entorno Frontend:
- `NEXT_PUBLIC_API_URL`: URL del backend (opcional, detecta automáticamente)

---

## 🐛 Troubleshooting

### Problema: Socket no se conecta
**Solución:** 
- Verifica que el backend esté corriendo
- Revisa la consola del navegador para errores CORS
- Verifica que `userId` esté disponible en `useAuth()`

### Problema: Eventos no llegan
**Solución:**
- Verifica que el usuario esté autenticado
- Revisa los logs del backend para confirmar emisión
- Verifica la conexión WebSocket en DevTools → Network → WS

### Problema: Estado no se actualiza
**Solución:**
- Verifica que `FollowingContext` esté funcionando
- Revisa que `addFollowing`/`removeFollowing` se llamen correctamente
- Revisa logs de la consola del navegador

---

## 📝 Notas Importantes

1. **Autenticación:** El socket requiere que el usuario esté autenticado
2. **Salas:** Cada usuario se une a su propia sala (`userId`) para recibir sus eventos
3. **Reconexión:** El cliente se reconecta automáticamente si se pierde la conexión
4. **Persistencia:** El estado sigue sincronizado aunque refresques la página (usa localStorage + Context)

---

## 🎉 Resultado Final

✅ Estado de seguimiento **sincronizado en tiempo real** entre todos los dispositivos  
✅ **Sin necesidad de refrescar** manualmente  
✅ **Actualización instantánea** cuando cambias el estado en cualquier dispositivo  
✅ **Reconexión automática** si se pierde la conexión  
✅ **Integrado** con el sistema existente sin cambios en `FollowButton`

