// db.js — Conexión centralizada a PostgreSQL
// Usamos "Pool" en lugar de una sola conexion porque el pool
// reutiliza conexiones existentes en vez de abrir una nueva
// por cada peticion. Crucial para rendimiento con internet limitado.
const {Pool} = require('pg');
require('dotenv').config(); // Carga variables de entorno desde .env

// configuracion del pool usando variables de entorno
const pool = new Pool({ 
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // EN Produccion (railway) se recomienda usar SSL para seguridad
    // rejectUnauthorized: false acepta el certificado de Railway.
    // en desarrollo local esta desactgivado 

    ssl: process.env.NODE_ENV === 'production'
    ?{rejectUnauthorized: false}  // para evitar errores de certificado en entornos gestionados
    : false
});

// preba de conexion al iniciar el servidor, si falla se muestra el error en consola
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error: no se pudo conectar a la base de datos', err.message);
        console.error('Verifica tu archivo .env y que postgreSQL este corriendo');
}else {
    console.log('conexion a postgreSQL exitgosa');
    release();
    //release() DEVUELVE LA CONEXION al pool para que otros la pueda usar 
}
});
module.exports = pool; // Exportamos el pool para usarlo en otros archivos
// const db = require('../db');
// const result = await db.query('SELECT * FROM usuario', []);
// result.rows contiene los resultados

