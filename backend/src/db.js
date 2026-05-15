// db.js — Conexión centralizada a PostgreSQL
// Usamos "Pool" en lugar de una sola conexion porque el pool
// reutiliza conexiones existentes en vez de abrir una nueva
// por cada peticion. Crucial para rendimiento con internet limitado.
const {Pool} = require('pg');
require('dotenv').config(); // Carga variables de entorno desde .env

// configuracion del pool usando variables de entorno
const pool = new Pool({ 
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // EN Produccion (railway) se recomienda usar SSL para seguridad
    ssl: process.env.NODE_ENV === 'production'
    ?{rejectUnauthorized: false}  // para evitar errores de certificado en entornos gestionados
    : false
});

// preba de conexion al iniciar el servidor, si falla se muestra el error en consola
pool.connect((err) => {
    if (err) {
        console.error('Error: no se pudo conectar a la base de datos', err.message);
}else {
    console.log('conexion a postgreSQL exitgosa');
}
});
module.exports = pool; // Exportamos el pool para usarlo en otros archivos

