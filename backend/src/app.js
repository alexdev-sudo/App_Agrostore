// app.js — La aplicación Express SIN el app.listen()
//
// Separamos la configuración del servidor de su arranque.
// Esto nos permite importar "app" en las pruebas sin que
// se arranche en un puerto, evitando conflictos.
// index.js importará este app y llamará app.listen().

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'test'
    ? '*'
    // En pruebas aceptamos cualquier origen para simplificar
    : process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// configuracion de la documentacion API con swagger mediante un archivo YAML 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
// cargar  y transforar el archivo de especificacion  OpenApi (YAML) a un objeto javascript
const swaggerDocument = YAML.load(
  path.join(__dirname, '../../docs/api/openapi.yaml')
);
// Crea el endpoint publico /api-docs para renderizar la documentacion interactiva 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/productos',      require('./routes/productos'));
app.use('/api/pedidos',        require('./routes/pedidos'));
app.use('/api/entregas',       require('./routes/entregas'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/admin',          require('./routes/admin'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no existe` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
// Exportamos app sin llamar listen()
// index.js hace el listen(), las pruebas usan el app directamente