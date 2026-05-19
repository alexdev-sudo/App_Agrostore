# Documentación de Endpoints - AgroStore API

La API de AgroStore es una API REST desarrollada con Node.js, Express y PostgreSQL. Esta API permite la comunicación entre el frontend de la aplicación y los servicios del backend, incluyendo autenticación, gestión de productos, pedidos, entregas, notificaciones y administración.

La documentación interactiva de la API fue implementada mediante Swagger/OpenAPI.

## Accesos Principales

| Recurso | URL |
|---|---|
| API base | `http://localhost:3001/api` |
| Swagger UI | `http://localhost:3001/api-docs/` |
| Archivo OpenAPI | `docs/api/openapi.yaml` |
| Health check | `http://localhost:3001/health` |

## Tipo de API

AgroStore utiliza una API de tipo REST.

## Autenticación

Las rutas protegidas requieren un token JWT enviado en el encabezado HTTP `Authorization`.

Formato requerido:

```http
Authorization: Bearer TOKEN_JWT
```

El token se obtiene mediante el endpoint de inicio de sesión:

```http
POST /api/auth/login
```

Ejemplo de respuesta con token:

```json
{
  "token": "jwt_token",
  "usuario": {
    "id": 1,
    "nombre": "Administrador AgroStore",
    "tipo": "Administrador"
  }
}
```

En Swagger UI, este token se coloca desde el botón **Authorize** ubicado en la parte superior derecha de la pantalla.

## Endpoints Disponibles

### Salud

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| GET | `/health` | Verifica que el backend esté funcionando correctamente | No |

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| POST | `/api/auth/registro` | Registra un nuevo usuario con rol Productor o Comprador | No |
| POST | `/api/auth/login` | Inicia sesión y devuelve un token JWT | No |
| GET | `/api/auth/perfil` | Devuelve el perfil del usuario autenticado | Sí |

### Productos

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/api/productos` | Lista productos disponibles. Permite filtros por nombre, categoría y precio | Usuario autenticado |
| GET | `/api/productos/categorias` | Lista las categorías válidas de productos | Usuario autenticado |
| GET | `/api/productos/mis-productos` | Lista productos publicados por el productor autenticado | Productor |
| POST | `/api/productos` | Publica un nuevo producto agrícola | Productor |
| PATCH | `/api/productos/{id}/stock` | Actualiza la cantidad disponible de un producto | Productor |
| PATCH | `/api/productos/{id}/cerrar` | Cierra una publicación de producto | Productor |
| DELETE | `/api/productos/{id}` | Elimina un producto publicado | Productor |

### Pedidos

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/api/pedidos` | Crea un pedido sobre un producto disponible | Comprador |
| GET | `/api/pedidos/mios` | Lista los pedidos realizados por el comprador autenticado | Comprador |
| GET | `/api/pedidos/recibidos` | Lista los pedidos recibidos por el productor autenticado | Productor |
| PATCH | `/api/pedidos/{id}/aceptar` | Acepta un pedido pendiente | Productor |
| PATCH | `/api/pedidos/{id}/rechazar` | Rechaza un pedido pendiente indicando un motivo | Productor |
| PATCH | `/api/pedidos/{id}/cancelar` | Cancela un pedido propio indicando un motivo | Comprador |

### Entregas

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/api/entregas` | Registra una entrega asociada a un pedido aceptado | Usuario autenticado |
| GET | `/api/entregas/mis-entregas` | Lista las entregas relacionadas con productos del productor autenticado | Productor |
| GET | `/api/entregas/mis-recepciones` | Lista las entregas que debe confirmar el comprador autenticado | Comprador |
| PATCH | `/api/entregas/{id}/confirmar` | Permite al productor confirmar que realizó la entrega | Productor |
| PATCH | `/api/entregas/{id}/recepcion` | Permite al comprador confirmar la recepción del producto | Comprador |
| POST | `/api/entregas/{id}/incumplimiento` | Reporta un incumplimiento relacionado con una entrega | Usuario autenticado |

### Notificaciones

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| GET | `/api/notificaciones` | Lista las notificaciones del usuario autenticado | Sí |
| GET | `/api/notificaciones/no-leidas` | Devuelve el total de notificaciones no leídas | Sí |
| PATCH | `/api/notificaciones/leer-todas` | Marca todas las notificaciones como leídas | Sí |
| PATCH | `/api/notificaciones/{id}/leer` | Marca una notificación específica como leída | Sí |

### Administración

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/api/admin/usuarios` | Lista todos los usuarios del sistema | Administrador |
| PATCH | `/api/admin/usuarios/{id}/desactivar` | Desactiva una cuenta de usuario | Administrador |
| PATCH | `/api/admin/usuarios/{id}/activar` | Reactiva una cuenta de usuario | Administrador |
| GET | `/api/admin/pedidos` | Lista todos los pedidos del sistema con filtros opcionales | Administrador |
| GET | `/api/admin/entregas` | Lista todas las entregas del sistema | Administrador |
| GET | `/api/admin/incumplimientos` | Lista todos los incumplimientos reportados | Administrador |
| PATCH | `/api/admin/incumplimientos/{id}/validar` | Valida un incumplimiento reportado | Administrador |
| GET | `/api/admin/reportes/ventas` | Genera reporte de ventas por productor | Administrador |
| GET | `/api/admin/reportes/categorias` | Genera reporte de ventas agrupadas por categoría | Administrador |

## Parámetros de Entrada y Salida

Los parámetros de entrada pueden recibirse de tres formas:

| Tipo | Uso |
|---|---|
| Path parameters | Valores incluidos en la URL, por ejemplo `{id}` |
| Query parameters | Filtros enviados en la URL, por ejemplo `?estado=Pendiente` |
| Request body | Datos enviados en formato JSON |

### Ejemplo de Path Parameter

Endpoint:

```http
PATCH /api/productos/{id}/stock
```

Ejemplo:

```http
PATCH /api/productos/1/stock
```

En este caso, `1` representa el identificador del producto.

### Ejemplo de Query Parameters

Endpoint:

```http
GET /api/productos
```

Ejemplo:

```http
GET /api/productos?nombre=tomate&categoria=Hortalizas&max_precio=10
```

Este endpoint permite filtrar productos por nombre, categoría y precio máximo.

### Ejemplo de Request Body

Endpoint:

```http
POST /api/productos
```

Body:

```json
{
  "nombre": "Tomate",
  "descripcion": "Tomate fresco por libra",
  "cantidad_disponible": 50,
  "precio": 5,
  "punto_entrega": "Mercado central",
  "categoria": "Hortalizas"
}
```

## Ejemplos de Requests y Responses

### Registro de Usuario

Request:

```http
POST /api/auth/registro
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Juan Pérez",
  "telefono": "55551234",
  "tipo": "Productor",
  "contrasena": "123456",
  "ubicacion": "Quetzaltenango"
}
```

Response 201:

```json
{
  "mensaje": "Cuenta creada exitosamente!!",
  "usuario": {
    "id_usuario": 2,
    "nombre": "Juan Pérez",
    "tipo": "Productor"
  }
}
```

### Inicio de Sesión

Request:

```http
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "telefono": "00000000",
  "contrasena": "admin123"
}
```

Response 200:

```json
{
  "token": "jwt_token",
  "usuario": {
    "id": 1,
    "nombre": "Administrador AgroStore",
    "tipo": "Administrador",
    "ubicacion": "La Esperanza",
    "calificacion": "5.0"
  }
}
```

### Consulta de Perfil

Request:

```http
GET /api/auth/perfil
Authorization: Bearer TOKEN_JWT
```

Response 200:

```json
{
  "id_usuario": 1,
  "nombre": "Administrador AgroStore",
  "telefono": "00000000",
  "tipo": "Administrador",
  "ubicacion": "La Esperanza",
  "calificacion": "5.0"
}
```

### Crear Producto

Request:

```http
POST /api/productos
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Tomate",
  "descripcion": "Tomate fresco por libra",
  "cantidad_disponible": 50,
  "precio": 5,
  "punto_entrega": "Mercado central",
  "categoria": "Hortalizas"
}
```

Response 201:

```json
{
  "mensaje": "Producto publicado exitosamente",
  "producto": {
    "id_producto": 1,
    "nombre": "Tomate",
    "descripcion": "Tomate fresco por libra",
    "cantidad_disponible": 50,
    "precio": "5.00",
    "estado": "Disponible",
    "categoria": "Hortalizas",
    "punto_entrega": "Mercado central",
    "id_productor": 2
  }
}
```

### Listar Productos

Request:

```http
GET /api/productos?categoria=Hortalizas
Authorization: Bearer TOKEN_JWT
```

Response 200:

```json
[
  {
    "id_producto": 1,
    "nombre": "Tomate",
    "descripcion": "Tomate fresco por libra",
    "cantidad_disponible": 50,
    "precio": "5.00",
    "estado": "Disponible",
    "categoria": "Hortalizas",
    "punto_entrega": "Mercado central",
    "id_productor": 2,
    "productor_nombre": "Juan Pérez",
    "productor_rating": "5.0",
    "productor_ubicacion": "Quetzaltenango"
  }
]
```

### Crear Pedido

Request:

```http
POST /api/pedidos
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

Body:

```json
{
  "id_producto": 1,
  "cantidad": 10
}
```

Response 201:

```json
{
  "mensaje": "Pedido registrado exitosamente",
  "id_pedido": 1
}
```

### Aceptar Pedido

Request:

```http
PATCH /api/pedidos/1/aceptar
Authorization: Bearer TOKEN_JWT
```

Response 200:

```json
{
  "mensaje": "Pedido aceptado"
}
```

### Registrar Entrega

Request:

```http
POST /api/entregas
Authorization: Bearer TOKEN_JWT
Content-Type: application/json
```

Body:

```json
{
  "id_pedido": 1,
  "fecha_entrega": "2026-05-20",
  "lugar": "Mercado central",
  "observaciones": "Entrega acordada por la tarde"
}
```

Response 201:

```json
{
  "mensaje": "Entrega registrada",
  "entrega": {
    "id_entrega": 1,
    "fecha_entrega": "2026-05-20",
    "estado": "Pendiente",
    "lugar": "Mercado central",
    "observaciones": "Entrega acordada por la tarde",
    "id_pedido": 1
  }
}
```

### Consultar Notificaciones

Request:

```http
GET /api/notificaciones
Authorization: Bearer TOKEN_JWT
```

Response 200:

```json
[
  {
    "id_notificacion": 1,
    "mensaje": "Nuevo Hortalizas: Tomate disponible en la tienda",
    "leida": false,
    "fecha": "2026-05-19T10:00:00.000Z",
    "id_usuario": 3
  }
]
```

### Consultar Usuarios como Administrador

Request:

```http
GET /api/admin/usuarios
Authorization: Bearer TOKEN_JWT
```

Response 200:

```json
[
  {
    "id_usuario": 1,
    "nombre": "Administrador AgroStore",
    "telefono": "00000000",
    "tipo": "Administrador",
    "ubicacion": "La Esperanza",
    "calificacion": "5.0",
    "activo": true,
    "creado_en": "2026-05-19T10:00:00.000Z"
  }
]
```

## Códigos de Error

| Código | Significado | Ejemplo de causa |
|---|---|---|
| 400 | Solicitud inválida | Faltan campos obligatorios o el formato enviado no es válido |
| 401 | No autorizado | No se envió token o las credenciales son inválidas |
| 403 | Prohibido | Token expirado o rol no autorizado |
| 404 | No encontrado | El recurso solicitado no existe |
| 409 | Conflicto | El teléfono ya tiene una cuenta registrada |
| 500 | Error interno del servidor | Error inesperado en backend o base de datos |

### Ejemplo de Error 400

```json
{
  "error": "Faltan campos obligatorios: nombre, cantidad, precio y categoría"
}
```

### Ejemplo de Error 401

```json
{
  "error": "Necesitas iniciar sesion para acceder"
}
```

### Ejemplo de Error 403

```json
{
  "error": "Tu sesion expiro. por favor inicia sesion nuevamente."
}
```

### Ejemplo de Error 404

```json
{
  "error": "Producto no encontrado"
}
```

### Ejemplo de Error 409

```json
{
  "error": "Numero de telefono ya tiene una cuenta registrada"
}
```

### Ejemplo de Error 500

```json
{
  "error": "Error interno del servidor"
}
```

## Documentación Interactiva con Swagger/OpenAPI

La documentación interactiva fue implementada con Swagger/OpenAPI. Esta herramienta permite visualizar los endpoints disponibles, revisar parámetros de entrada y salida, consultar ejemplos de requests y responses, y probar solicitudes directamente desde el navegador.

URL local de Swagger:

```text
http://localhost:3001/api-docs/
```

Archivo fuente de OpenAPI:

```text
docs/api/openapi.yaml
```

La configuración de Swagger se realizó en el backend mediante `swagger-ui-express` y `yamljs`, cargando el archivo `openapi.yaml` y exponiéndolo en la ruta `/api-docs`.

## Observaciones

- La API utiliza formato JSON para requests y responses.
- Las rutas protegidas requieren token JWT.
- Algunas rutas requieren roles específicos: `Administrador`, `Productor` o `Comprador`.
- La documentación completa e interactiva se mantiene en `docs/api/openapi.yaml`.
- Este archivo `endpoints.md` funciona como resumen legible para consulta técnica y apoyo al documento formal del proyecto.
