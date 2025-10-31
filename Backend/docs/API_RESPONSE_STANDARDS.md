# Estándares de Respuestas API - ArteNis 2.0

## Formato Estándar de Respuestas

Todas las respuestas de la API deben seguir este formato:

```json
{
  "success": boolean,
  "message": string (opcional),
  "data": any (opcional, solo en éxito),
  "error": string (opcional, solo en error),
  "errors": array (opcional, solo en errores de validación)
}
```

## Respuestas Exitosas

### Formato
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos */ }
}
```

### Códigos HTTP para Éxito
- **200 OK**: Operaciones exitosas (GET, PUT, DELETE)
- **201 Created**: Recursos creados exitosamente (POST)
- **204 No Content**: Operación exitosa sin contenido (DELETE, UPDATE sin datos)

## Respuestas de Error

### Formato
```json
{
  "success": false,
  "message": "Mensaje de error descriptivo",
  "error": "ERROR_CODE",
  "errors": [ /* array opcional para errores de validación */ ]
}
```

### Códigos HTTP para Errores
- **400 Bad Request**: Solicitud inválida (validación, parámetros incorrectos)
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: Autenticado pero sin permisos
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto con estado actual (duplicados, etc.)
- **500 Internal Server Error**: Error del servidor

### Códigos de Error Estándar
- `VALIDATION_ERROR`: Errores de validación
- `NOT_FOUND`: Recurso no encontrado
- `UNAUTHORIZED`: No autenticado
- `FORBIDDEN`: Sin permisos
- `CONFLICT`: Conflicto (duplicado, etc.)
- `BAD_REQUEST`: Solicitud inválida
- `INTERNAL_ERROR`: Error interno
- `DEADLOCK_ERROR`: Error de deadlock en base de datos
- `MISSING_REQUIRED_FIELDS`: Campos requeridos faltantes
- `POST_NOT_FOUND`: Post no encontrado
- `USER_NOT_FOUND`: Usuario no encontrado

## Ejemplos

### GET exitoso
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "user": { /* datos del usuario */ }
  }
}
```

### POST exitoso (creación)
```json
{
  "success": true,
  "message": "Publicación creada exitosamente",
  "data": {
    "post": { /* datos del post */ }
  }
}
```
**Código HTTP: 201**

### Error de validación
```json
{
  "success": false,
  "message": "Errores de validación",
  "error": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Debe ser un email válido",
      "value": "invalid"
    }
  ]
}
```
**Código HTTP: 400**

### Recurso no encontrado
```json
{
  "success": false,
  "message": "Publicación no encontrada",
  "error": "POST_NOT_FOUND"
}
```
**Código HTTP: 404**

## Uso del Helper

Usar `apiResponse.js` para respuestas estandarizadas:

```javascript
const { responses } = require('../utils/apiResponse');

// Éxito
responses.ok(res, 'Operación exitosa', data);
responses.created(res, 'Recurso creado', data);

// Errores
responses.notFound(res, 'Usuario no encontrado', 'USER_NOT_FOUND');
responses.badRequest(res, 'Solicitud inválida', 'BAD_REQUEST', errors);
```

## Estado Actual

✅ **Ya implementado:**
- Formato básico `{ success, message, data }` es consistente
- Códigos HTTP correctos (200, 201, 400, 404, 401)
- Error handler centralizado con formato estándar
- Clases de error personalizadas (AppError)

⚠️ **Mejoras sugeridas:**
- Usar helper `apiResponse.js` para mayor consistencia
- Estandarizar códigos de error en controladores directos
- Asegurar que todos los errores pasen por `errorHandler` middleware

