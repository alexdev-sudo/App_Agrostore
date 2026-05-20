# Dockerfile del backend de AgroStore
# Cada instrucción crea una "capa" en la imagen Docker

# FROM: imagen base. Node 20 en versión alpine (Linux minimalista, solo 5 MB)
FROM node:20-alpine

# WORKDIR: crea la carpeta /app dentro del contenedor y la establece como directorio de trabajo.
# Todos los comandos siguientes se ejecutan desde aquí.
WORKDIR /app

# COPY package*.json primero (antes del código).
# Docker guarda en caché cada capa. Si package.json no cambió,
# no vuelve a ejecutar npm install (ahorra mucho tiempo al reconstruir).
COPY package*.json ./

# RUN npm install instala las dependencias dentro del contenedor.
# --omit=dev excluye nodemon y otras dependencias de desarrollo.
RUN npm install --omit=dev

# COPY . . copia el resto del código después de instalar.
# Así si solo cambias código (no dependencias), Docker usa el caché del npm install.
COPY . .

# EXPOSE documenta en qué puerto escucha el contenedor.
# No abre el puerto, solo lo declara. docker-compose lo mapea.
EXPOSE 3001

# CMD es el comando que se ejecuta cuando arranca el contenedor.
# En producción usamos node directamente (no nodemon).
CMD ["node", "src/index.js"]