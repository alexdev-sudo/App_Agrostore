# AgroStore — Sistema de Comercialización Agrícola

**Universidad Mariano Gálvez de Guatemala**
Facultad de Ingeniería en Sistemas | Análisis de Sistemas I

## Equipo
| Nombre | Carné | Rol |
|---|---|---|
| Cinthia Yadira Robles Sotoj | 7690-16-13986 | Product Owner |
| Ezequiel Alexander Castro | 7690-21-7934 | Scrum Team |
| Madelin Velvet Mendoza Bedoya | 7690-22-4338 | Scrum Master |

---

## Requisitos previos
- Node.js 18 o superior
- Docker Desktop
- Git

## Levantar el proyecto en 3 pasos

**Paso 1:** Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/agrostore.git
cd agrostore
```

**Paso 2:** Copiar el archivo de variables de entorno del backend
```bash
cd backend
copy .env.example .env
# Edita .env con tu contraseña de PostgreSQL
cd ..
```

**Paso 3:** Levantar todo con Docker
```bash
docker compose up --build
```

La app estará disponible en:
- Frontend: http://localhost:5173
- API Backend: http://localhost:3001
- Health check: http://localhost:3001/health

## Credenciales por defecto
- **Admin:** teléfono `00000000` / contraseña `admin123`
- Para probar: registra un Productor y un Comprador desde la pantalla de login

## Estructura del proyecto