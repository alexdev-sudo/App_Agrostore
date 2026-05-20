# Dockerfile del frontend — usa build multi-etapa
# Etapa 1: compila React → Etapa 2: sirve con Nginx
# Resultado: imagen final muy pequeña (solo HTML/CSS/JS compilado)

# ── ETAPA 1: Compilar la app React ──────────────────────────────────
FROM node:20-alpine AS builder
# "AS builder" nombra esta etapa para referenciarla en la etapa 2

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# npm run build compila todo React en archivos estáticos en la carpeta dist/
# El resultado es HTML + CSS + JS optimizado para producción
RUN npm run build

# ── ETAPA 2: Servir con Nginx ────────────────────────────────────────
# Nginx es un servidor web ultra eficiente para archivos estáticos
# La imagen final NO incluye Node.js ni el código fuente, solo Nginx + dist/
FROM nginx:alpine

# Copia la carpeta dist/ de la etapa "builder" al directorio que Nginx sirve
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]