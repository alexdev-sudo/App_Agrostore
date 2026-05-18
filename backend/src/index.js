// index.js — Servidor principal de AgroStore
// Este archivo une todas las piezas: middlewares, rutas y el puerto de escucha.

const express = require('express');
const cors    = require('cors');
require('dotenv').config();
// dotenv.config() DEBE ir antes de cualquier uso de process.env

const app = express();

// ── Middlewares globales ────────────────────────────────────────────────────

// CORS: define quién puede llamar a esta API
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    // En producción, solo el frontend de Railway puede llamar a la API
    : 'http://localhost:5173',
    // En desarrollo, aceptamos el servidor Vite local
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// express.json() permite leer req.body en peticiones POST y PATCH.
// Sin esto, req.body siempre sería undefined.
app.use(express.json());

// ── Rutas ───────────────────────────────────────────────────────────────────
// Cada "use" conecta un archivo de rutas con un prefijo URL.
// Ejemplo: POST /api/auth/login llama a routes/auth.js
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/productos',      require('./routes/productos'));
app.use('/api/pedidos',        require('./routes/pedidos'));
app.use('/api/entregas',       require('./routes/entregas'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/admin',          require('./routes/admin'));

// ── Health check ─────────────────────────────────────────────────────────────
// Railway llama a /health cada 30 segundos para saber si el servidor vive.
// Si no responde en 3 intentos, lo reinicia automáticamente.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', app: 'AgroStore API' });
});

// ── Ruta no encontrada ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no existe` });
});

// ── Error global ──────────────────────────────────────────────────────────────
// Captura cualquier error no manejado para que el servidor no se caiga.
// Los 4 parámetros (err, req, res, next) le indican a Express que es un error handler.
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AgroStore API corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});