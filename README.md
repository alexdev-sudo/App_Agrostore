# AgroStore - Sistema de Comercializacion Agricola

**Universidad Mariano Galvez de Guatemala**
Facultad de Ingenieria en Sistemas | Analisis de Sistemas I

## Equipo

| Nombre | Carne | Rol |
|---|---|---|
| Cinthia Yadira Robles Sotoj | 7690-16-13986 | Product Owner |
| Ezequiel Alexander Castro | 7690-21-7934 | Scrum Team |
| Madelin Velvet Mendoza Bedoya | 7690-22-4338 | Scrum Master |

## Descripcion General

AgroStore es una aplicacion web para la comercializacion agricola entre productores y compradores. El sistema permite registrar usuarios, publicar productos agricolas, realizar pedidos, gestionar entregas, recibir notificaciones y consultar informacion administrativa mediante reportes.

La aplicacion esta dividida en tres componentes principales:

- **Frontend:** React con Vite.
- **Backend:** Node.js con Express.
- **Base de datos:** PostgreSQL.

La ejecucion local recomendada se realiza con Docker Compose, ya que levanta automaticamente la base de datos, el backend y el frontend.

## Requisitos Previos Del Sistema

Para instalar y ejecutar el proyecto se requiere:

| Requisito | Version recomendada | Uso |
|---|---:|---|
| Sistema operativo | Windows 10/11, Linux o macOS | Entorno base de ejecucion |
| Git | Ultima version estable | Clonar y versionar el proyecto |
| Docker Desktop | Ultima version estable | Levantar servicios con contenedores |
| Node.js | 18 o superior | Ejecucion local sin Docker |
| npm | Incluido con Node.js | Instalacion de dependencias |
| Navegador web | Chrome, Edge o Firefox | Uso de la aplicacion |

> Nota: si se usa Docker Compose, no es necesario instalar PostgreSQL manualmente porque la base de datos se levanta en un contenedor.

## Estructura Del Proyecto

```text
App_Agrostore/
|-- backend/                 API REST con Node.js y Express
|   |-- src/
|   |   |-- index.js          Servidor principal
|   |   |-- db.js             Conexion a PostgreSQL
|   |   |-- middleware/       Middleware de autenticacion
|   |   `-- routes/           Rutas REST del sistema
|   |-- Dockerfile
|   |-- package.json
|   `-- .env.example
|
|-- frontend/                Aplicacion web React con Vite
|   |-- src/
|   |   |-- components/       Componentes reutilizables
|   |   |-- context/          Contexto de autenticacion
|   |   |-- pages/            Pantallas por rol
|   |   `-- services/         Cliente API
|   |-- Dockerfile
|   |-- package.json
|   `-- .env.example
|
|-- database/
|   `-- schema.sql            Script de creacion de base de datos
|
|-- docs/
|   `-- api/
|       |-- endpoints.md      Resumen legible de endpoints
|       `-- openapi.yaml      Especificacion Swagger/OpenAPI
|
|-- docker-compose.yml        Orquestacion de servicios
`-- README.md                 Guia principal del proyecto
```

## Instalacion Con Docker Compose

Esta es la forma recomendada para ejecutar AgroStore localmente.

### Paso 1: Clonar El Repositorio

```bash
git clone https://github.com/alexdev-sudo/App_Agrostore.git
cd App_Agrostore
```

Si ya tienes el proyecto descargado:

```bash
cd C:\proyectos_Dev\App_Agrostore
```

### Paso 2: Levantar Los Servicios

```bash
docker compose up --build
```

Este comando construye y levanta:

- `agrostore-db`: base de datos PostgreSQL.
- `agrostore-backend`: API REST Node.js/Express.
- `agrostore-frontend`: frontend React servido con Nginx.

### Paso 3: Acceder A La Aplicacion

| Servicio | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:3001` |
| Health check | `http://localhost:3001/health` |
| Swagger API Docs | `http://localhost:3001/api-docs/` |
| PostgreSQL | `localhost:5432` |

## Credenciales Por Defecto

| Rol | Telefono | Contrasena |
|---|---|---|
| Administrador | `00000000` | `******` |

Para pruebas funcionales tambien se pueden registrar usuarios con rol `Productor` y `Comprador` desde la pantalla de login.

## Instalacion Manual Sin Docker

Esta opcion es util para desarrollo local cuando se desea ejecutar frontend y backend por separado.

### Requisitos Adicionales

- PostgreSQL instalado localmente.
- Base de datos llamada `agrostore_db`.
- Script `database/schema.sql` ejecutado manualmente en PostgreSQL.

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

El backend quedara disponible en:

```text
http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

El frontend quedara disponible en:

```text
http://localhost:5173
```

## Variables De Entorno

### Backend

Cuando se ejecuta con Docker, estas variables se definen en `docker-compose.yml`.
Cuando se ejecuta manualmente, deben colocarse en `backend/.env`.

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `db` en Docker, `localhost` local |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de base de datos | `postgres` |
| `DB_PASSWORD` | Contrasena de base de datos | `agrostore2026` |
| `DB_NAME` | Nombre de la base de datos | `agrostore_db` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `agrostore_clave_secreta_muy_larga_2026_guatemala` |
| `PORT` | Puerto del backend | `3001` |
| `NODE_ENV` | Entorno de ejecucion | `development` |
| `FRONTEND_URL` | URL permitida para CORS | `http://localhost:5173` |

### Frontend

Cuando se ejecuta manualmente, debe colocarse en `frontend/.env`.

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API REST | `http://localhost:3001/api` |

## Despliegue Local

Para ejecutar el despliegue local completo:

```bash
docker compose up --build
```

Para detener los servicios:

```bash
docker compose down
```

Para detener y eliminar tambien los datos de PostgreSQL:

```bash
docker compose down -v
```

> Advertencia: `docker compose down -v` elimina el volumen de base de datos y borra los datos locales.

## Despliegue En Servidores

Para desplegar la aplicacion en un servidor se recomienda:

1. Configurar una base de datos PostgreSQL en el servidor o en un servicio administrado.
2. Definir variables de entorno seguras para el backend.
3. Cambiar `NODE_ENV` a `production`.
4. Configurar `FRONTEND_URL` con la URL real del frontend.
5. Construir el frontend con `npm run build`.
6. Servir el frontend mediante Nginx u otro servidor web.
7. Ejecutar el backend con `npm start` o dentro de un contenedor Docker.
8. No publicar secretos reales dentro del repositorio.

## Guia De Configuracion Del Entorno De Desarrollo

### IDE Recomendado

Se recomienda usar **Visual Studio Code**.

Extensiones sugeridas:

- ESLint.
- Docker.
- PostgreSQL.
- Thunder Client o REST Client.
- GitLens.

### Entorno Virtual

El proyecto no utiliza entorno virtual de Python.
Cada aplicacion Node.js administra sus dependencias mediante `node_modules` y `package-lock.json`.

### Instalacion De Dependencias

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### Comandos De Desarrollo

Backend:

| Comando | Descripcion |
|---|---|
| `npm run dev` | Ejecuta el backend con Nodemon |
| `npm start` | Ejecuta el backend con Node.js |

Frontend:

| Comando | Descripcion |
|---|---|
| `npm run dev` | Ejecuta Vite en modo desarrollo |
| `npm run build` | Genera la version de produccion |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Ejecuta ESLint |

### Linting Y Formateo

El frontend cuenta con ESLint configurado mediante `frontend/eslint.config.js`.

Para ejecutar la revision:

```bash
cd frontend
npm run lint
```

Actualmente no hay una configuracion formal de Prettier en el proyecto. Si el equipo decide utilizarlo, debe agregarse como dependencia de desarrollo y documentarse en esta seccion.

## Documentacion De API

La API esta documentada con Swagger/OpenAPI.

| Recurso | Ubicacion |
|---|---|
| Swagger UI | `http://localhost:3001/api-docs/` |
| OpenAPI YAML | `docs/api/openapi.yaml` |
| Resumen de endpoints | `docs/api/endpoints.md` |

Para probar rutas protegidas desde Swagger:

1. Ejecutar `POST /api/auth/login`.
2. Copiar el token JWT recibido.
3. Presionar el boton **Authorize**.
4. Pegar el token.
5. Ejecutar endpoints protegidos.

## Base De Datos

El script de creacion de base de datos se encuentra en:

```text
database/schema.sql
```

Cuando se usa Docker Compose, PostgreSQL ejecuta este script automaticamente la primera vez que se crea el volumen `db_data`.

## Notas Importantes

- El backend usa JWT para autenticacion.
- Las contrasenas se almacenan como hash con bcrypt.
- Los roles principales son `Administrador`, `Productor` y `Comprador`.
- El contenedor del backend monta la carpeta `docs` para poder leer `docs/api/openapi.yaml`.
- La API utiliza JSON para requests y responses.
