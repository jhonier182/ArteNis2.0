# ArteNis Backend

Backend para ArteNis - Una aplicación tipo Pinterest enfocada en tatuadores que permite mostrar trabajos, organizar portafolios, publicar contenido multimedia y conectar artistas con clientes.

## 🚀 Características

- **Gestión de Usuarios**: Registro, autenticación, perfiles de tatuadores y clientes
- **Publicaciones**: Subida de fotos y videos con tags, estilos y ubicaciones
- **Interacciones Sociales**: Likes, comentarios, seguimiento entre usuarios
- **Sistema de Reservas**: Cotizaciones y agendamiento de citas
- **API RESTful**: Endpoints bien estructurados siguiendo mejores prácticas

## 🏗️ Arquitectura

```
src/
├── 📂 config/
│   └── db.js                  # Configuración MySQL
├── 📂 models/
│   ├── User.js                # Modelo de usuario
│   ├── Post.js                # Modelo de publicaciones
│   ├── Comment.js             # Modelo de comentarios
│   ├── Like.js                # Modelo de likes
│   ├── Follow.js              # Modelo de seguimiento
│   ├── Booking.js             # Modelo de reservas
│   └── index.js               # Asociaciones de modelos
├── 📂 controllers/
│   ├── userController.js      # Controlador de usuarios
│   └── postController.js      # Controlador de publicaciones
├── 📂 services/
│   ├── userService.js         # Lógica de negocio de usuarios
│   └── postService.js         # Lógica de negocio de posts
├── 📂 routes/
│   ├── userRoutes.js          # Rutas de usuarios
│   └── postRoutes.js          # Rutas de publicaciones
├── 📂 middlewares/
│   ├── auth.js                # Middleware de autenticación
│   ├── upload.js              # Middleware de carga de archivos
│   ├── validation.js          # Middleware de validación
│   └── errorHandler.js        # Manejo de errores
├── 📂 utils/
│   └── logger.js              # Sistema de logging
├── app.js                     # Configuración principal de Express
└── server.js                  # Punto de entrada del servidor
```

## 🛠️ Tecnologías

- **Node.js** + **Express.js** - Backend framework
- **MySQL** + **Sequelize** - Base de datos y ORM
- **JWT** - Autenticación
- **Multer** - Carga de archivos
- **bcryptjs** - Hashing de contraseñas
- **Winston** - Logging
- **Helmet** - Seguridad HTTP
- **express-rate-limit** - Rate limiting
- **express-validator** - Validación de datos

## ⚙️ Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/artenis-backend.git
cd artenis-backend/Backend
```

2. **Instalar dependencias**
```bash
npm install
```



Editar el archivo `.env` con tus credenciales de MySQL. Variables **requeridas**:
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos MySQL (REQUERIDAS)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=artenis_db
DB_USER=root
DB_PASSWORD=12345

# JWT (REQUERIDO)
JWT_SECRET=cambia_esta_clave_secreta_en_produccion
JWT_EXPIRES_IN=7d
```

4. **Configurar MySQL y crear base de datos**

Opción A - **Configuración manual**: [[memory:5916532]]
```sql
-- Conectarse a MySQL Workbench o terminal
CREATE DATABASE artenis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Opción B - **Configuración automática** (recomendado):
```bash
# Este script creará la base de datos automáticamente
npm run db:create
```

5. **Crear carpetas y configurar la base de datos**
```bash
# Crear carpetas necesarias
mkdir uploads logs

# Configuración completa de la base de datos
npm run db:setup
```

6. **Verificar conexión a la base de datos**
```bash
# Ver información de la base de datos
npm run db:info

# Verificar que todo esté funcionando
curl http://localhost:3000/health
```

7. **Iniciar el servidor**
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

### 🗄️ Scripts de Base de Datos

```bash
npm run db:create     # Crear base de datos
npm run db:migrate    # Crear/actualizar tablas
npm run db:reset      # Resetear BD (ELIMINA DATOS)
npm run db:info       # Información de la BD
npm run db:setup      # Configuración completa
npm run setup         # Instalación completa (npm install + BD)
```

## 📚 API Endpoints

### Usuarios

```http
# Registro
POST /api/users/register
Content-Type: application/json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "userType": "user|artist"
}

# Login
POST /api/users/login
Content-Type: application/json
{
  "identifier": "email_o_username",
  "password": "string"
}

# Obtener perfil
GET /api/users/me/profile
Authorization: Bearer <token>

# Buscar usuarios
GET /api/users/search?q=query&type=artist&page=1&limit=20

# Seguir usuario
POST /api/users/follow
Authorization: Bearer <token>
Content-Type: application/json
{
  "userId": "uuid"
}

# Obtener usuario por ID
GET /api/users/:id
```

### Publicaciones

```http
# Crear publicación
POST /api/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data
{
  "media": file,
  "title": "string",
  "description": "string",
  "type": "image|video|reel",
  "style": "string",
  "bodyPart": "string"
}

# Obtener feed
GET /api/posts?page=1&limit=20&type=image&sortBy=recent

# Obtener publicación por ID
GET /api/posts/:id

# Dar like
POST /api/posts/:id/like
Authorization: Bearer <token>

# Agregar comentario
POST /api/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json
{
  "content": "string",
  "parentId": "uuid" // opcional para respuestas
}

# Obtener posts de un usuario
GET /api/posts/user/:userId?page=1&limit=20
```

## 🔒 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header Authorization:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Estructura de Datos

### Usuario
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "bio": "string",
  "avatar": "url",
  "userType": "user|artist|admin",
  "isVerified": boolean,
  "isPremium": boolean,
  "location": "string",
  "followersCount": number,
  "followingCount": number,
  "postsCount": number,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Publicación
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "string",
  "description": "string",
  "type": "image|video|reel",
  "mediaUrl": "url",
  "tags": ["string"],
  "style": "string",
  "bodyPart": "string",
  "likesCount": number,
  "commentsCount": number,
  "viewsCount": number,
  "location": "string",
  "createdAt": "datetime",
  "author": {
    "id": "uuid",
    "username": "string",
    "fullName": "string",
    "avatar": "url"
  }
}
```

## 🚦 Códigos de Estado

- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto (recurso duplicado)
- `500` - Error interno del servidor

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 📝 Logs

Los logs se guardan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

## 🔧 Desarrollo

### Scripts disponibles

```bash
npm run dev      # Inicia el servidor en modo desarrollo con nodemon
npm start        # Inicia el servidor en modo producción
npm test         # Ejecuta los tests
npm run test:watch # Tests en modo watch
```

### Estructura de respuestas

Todas las respuestas siguen el formato:

```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "errors": array // solo en caso de errores de validación
}
```

## 📈 Funcionalidades Futuras

- [ ] Sistema de notificaciones push
- [ ] Integración con Stripe para pagos
- [ ] Generación de imágenes con IA
- [ ] Búsqueda avanzada con Meilisearch
- [ ] Sistema de reportes y moderación
- [ ] Geolocalización avanzada
- [ ] Chat en tiempo real
- [ ] Sistema de recomendaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Equipo

- **ArteNis Team** - Desarrollo inicial

## 📞 Soporte

Para soporte, envía un email a support@artenis.app o crea un issue en GitHub.
