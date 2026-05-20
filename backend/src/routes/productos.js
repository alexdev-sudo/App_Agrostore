// productos.js — CRUD de productos agrícolas con categorías
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Las 5 categorías válidas del sistema
// Se valida aquí Y en la base de datos (doble seguridad)
const CATEGORIAS = ['Hortalizas', 'Granos Basicos', 'Frutas', 'Hierbas', 'Otros'];

// ── GET /api/productos ────────────────────────────────────────────────────────
// Lista productos disponibles para la Tienda del comprador
// Acepta filtros por URL: ?nombre=tomate&categoria=Hortalizas&max_precio=10
router.get('/', verificarToken, async (req, res) => {
  const { nombre, categoria, min_precio, max_precio } = req.query;

  // Construimos la query dinámicamente según los filtros activos.
  // Los parámetros ($1, $2...) se asignan solo si el filtro está presente.
  let sql = `
    SELECT p.*,
           u.nombre       AS productor_nombre,
           u.calificacion AS productor_rating,
           u.ubicacion    AS productor_ubicacion
    FROM producto p
    JOIN usuario u ON p.id_productor = u.id_usuario
    WHERE p.estado = 'Disponible'
  `;
  const params = [];

  if (nombre) {
    params.push(`%${nombre}%`);
    sql += ` AND p.nombre ILIKE $${params.length}`;
    // ILIKE = LIKE sin distinguir mayúsculas: "TOMATE" encuentra "tomate"
  }
  if (categoria) {
    params.push(categoria);
    sql += ` AND p.categoria = $${params.length}`;
  }
  if (min_precio) {
    params.push(min_precio);
    sql += ` AND p.precio >= $${params.length}`;
  }
  if (max_precio) {
    params.push(max_precio);
    sql += ` AND p.precio <= $${params.length}`;
  }

  sql += ' ORDER BY p.creado_en DESC';

  const result = await db.query(sql, params);
  res.json(result.rows);
});

// ── GET /api/productos/categorias ─────────────────────────────────────────────
// El frontend llama a esto para llenar el selector de categorías en el formulario
router.get('/categorias', verificarToken, (req, res) => {
  res.json(CATEGORIAS);
});

// ── GET /api/productos/mis-productos ──────────────────────────────────────────
// Solo los productos del productor que está logueado
router.get('/mis-productos', verificarToken, verificarRol('Productor'), async (req, res) => {
  const result = await db.query(
    'SELECT * FROM producto WHERE id_productor = $1 ORDER BY creado_en DESC',
    [req.usuario.id]
    // req.usuario.id viene del token JWT decodificado
  );
  res.json(result.rows);
});

// ── POST /api/productos ───────────────────────────────────────────────────────
// Publicar un nuevo producto (solo Productores)
router.post('/', verificarToken, verificarRol('Productor'), async (req, res) => {
  const { nombre, descripcion, cantidad_disponible, precio, punto_entrega, categoria } = req.body;

  if (!nombre || !cantidad_disponible || !precio || !categoria) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: nombre, cantidad, precio y categoría'
    });
  }

  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).json({
      error: `Categoría no válida. Usa una de: ${CATEGORIAS.join(', ')}`
    });
  }

  const result = await db.query(
    `INSERT INTO producto
       (nombre, descripcion, cantidad_disponible, precio, punto_entrega, categoria, id_productor)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [nombre, descripcion || null, cantidad_disponible, precio,
     punto_entrega || null, categoria, req.usuario.id]
  );

  // Notificar a todos los compradores activos que hay un nuevo producto
  await db.query(
    `INSERT INTO notificacion (mensaje, id_usuario)
     SELECT $1, id_usuario FROM usuario
     WHERE tipo = 'Comprador' AND activo = TRUE`,
    [`Nuevo ${categoria}: ${nombre} disponible en la tienda`]
  );

  res.status(201).json({
    mensaje: 'Producto publicado exitosamente',
    producto: result.rows[0]
  });
});

// ── PATCH /api/productos/:id/stock ────────────────────────────────────────────
// El productor actualiza cuántas libras tiene disponibles
router.patch('/:id/stock', verificarToken, verificarRol('Productor'), async (req, res) => {
  const { cantidad } = req.body;

  if (cantidad === undefined || cantidad < 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número mayor o igual a 0' });
  }

  const result = await db.query(
    `UPDATE producto SET cantidad_disponible = $1
     WHERE id_producto = $2 AND id_productor = $3
     RETURNING *`,
    // AND id_productor = $3 garantiza que solo el dueño puede editar su producto
    [cantidad, req.params.id, req.usuario.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Producto no encontrado o no tienes permiso para editarlo' });
  }
  res.json({ mensaje: 'Cantidad actualizada', producto: result.rows[0] });
});

// ── PATCH /api/productos/:id/cerrar ───────────────────────────────────────────
// Cierra la publicación (deja de aparecer en la tienda)
router.patch('/:id/cerrar', verificarToken, verificarRol('Productor'), async (req, res) => {
  const result = await db.query(
    `UPDATE producto SET estado = 'Cerrado'
     WHERE id_producto = $1 AND id_productor = $2
     RETURNING nombre`,
    [req.params.id, req.usuario.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje: `Publicación de "${result.rows[0].nombre}" cerrada` });
});

// ── DELETE /api/productos/:id ─────────────────────────────────────────────────
router.delete('/:id', verificarToken, verificarRol('Productor'), async (req, res) => {
  const result = await db.query(
    'DELETE FROM producto WHERE id_producto = $1 AND id_productor = $2 RETURNING nombre',
    [req.params.id, req.usuario.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje: `Producto "${result.rows[0].nombre}" eliminado` });
});

module.exports = router;