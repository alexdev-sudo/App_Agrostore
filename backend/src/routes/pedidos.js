const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// POST /api/pedidos — el comprador hace un pedido
router.post('/', verificarToken, verificarRol('Comprador'), async (req, res) => {
  const { id_producto, cantidad } = req.body;

  if (!id_producto || !cantidad) {
    return res.status(400).json({ error: 'id_producto y cantidad son requeridos' });
  }

  // Usamos transacción para que si algo falla, todo se revierta.
  // Así nunca queda un pedido a medias en la base de datos.
  const conn = await db.connect();
  try {
    await conn.query('BEGIN');

    // Verificar que el producto existe y tiene stock suficiente
    const prodResult = await conn.query(
      `SELECT * FROM producto WHERE id_producto = $1 AND estado = 'Disponible'`,
      [id_producto]
    );
    if (!prodResult.rows.length) {
      await conn.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no disponible' });
    }

    const producto = prodResult.rows[0];
    if (cantidad > producto.cantidad_disponible) {
      await conn.query('ROLLBACK');
      return res.status(400).json({
        error: `Stock insuficiente. Disponible: ${producto.cantidad_disponible} lb`
      });
    }

    // Crear el pedido
    const pedidoResult = await conn.query(
      'INSERT INTO pedido (id_comprador) VALUES ($1) RETURNING id_pedido',
      [req.usuario.id]
    );
    const id_pedido = pedidoResult.rows[0].id_pedido;

    // Crear el detalle del pedido
    await conn.query(
      `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4)`,
      [id_pedido, id_producto, cantidad, producto.precio]
    );

    // Notificar al productor que llegó un pedido
    await conn.query(
      'INSERT INTO notificacion (mensaje, id_usuario) VALUES ($1, $2)',
      [`Nueva solicitud: ${cantidad} lb de ${producto.nombre}`, producto.id_productor]
    );

    await conn.query('COMMIT');
    res.status(201).json({ mensaje: 'Pedido registrado exitosamente', id_pedido });
  } catch (err) {
    await conn.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear el pedido' });
  } finally {
    conn.release();
  }
});

// GET /api/pedidos/mios — el comprador ve sus pedidos
router.get('/mios', verificarToken, verificarRol('Comprador'), async (req, res) => {
  const result = await db.query(
    `SELECT p.id_pedido, p.fecha, p.estado, p.motivo_cancelacion,
            dp.cantidad, dp.precio_unitario,
            pr.nombre AS producto_nombre, pr.categoria, pr.punto_entrega,
            u.nombre  AS productor_nombre, u.telefono AS productor_telefono
     FROM pedido p
     JOIN detalle_pedido dp ON p.id_pedido  = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     JOIN usuario u         ON pr.id_productor = u.id_usuario
     WHERE p.id_comprador = $1
     ORDER BY p.fecha DESC`,
    [req.usuario.id]
  );
  res.json(result.rows);
});

// GET /api/pedidos/recibidos — el productor ve pedidos de sus productos
router.get('/recibidos', verificarToken, verificarRol('Productor'), async (req, res) => {
  const result = await db.query(
    `SELECT p.id_pedido, p.fecha, p.estado,
            dp.cantidad, dp.precio_unitario,
            pr.nombre  AS producto_nombre,
            uc.nombre  AS comprador_nombre,
            uc.telefono AS comprador_telefono
     FROM pedido p
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     JOIN usuario uc        ON p.id_comprador = uc.id_usuario
     WHERE pr.id_productor = $1
     ORDER BY p.fecha DESC`,
    [req.usuario.id]
  );
  res.json(result.rows);
});

// PATCH /api/pedidos/:id/aceptar — el productor acepta un pedido
// CORRECCIÓN: PostgreSQL no permite alias en la tabla principal del UPDATE
router.patch('/:id/aceptar', verificarToken, verificarRol('Productor'), async (req, res) => {
  // Primero verificamos que el pedido pertenece a un producto de este productor
  const verificacion = await db.query(
    `SELECT p.id_pedido, p.id_comprador, p.estado
     FROM pedido p
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     WHERE p.id_pedido = $1 AND pr.id_productor = $2`,
    [req.params.id, req.usuario.id]
  );

  if (!verificacion.rows.length) {
    return res.status(404).json({ error: 'Pedido no encontrado o no tienes permiso' });
  }
  if (verificacion.rows[0].estado !== 'Pendiente') {
    return res.status(400).json({ error: 'Solo se pueden aceptar pedidos en estado Pendiente' });
  }

  // Actualizar el estado
  await db.query(
    `UPDATE pedido SET estado = 'Aceptado' WHERE id_pedido = $1`,
    [req.params.id]
  );

  // Notificar al comprador
  await db.query(
    'INSERT INTO notificacion (mensaje, id_usuario) VALUES ($1, $2)',
    [`Tu pedido #${req.params.id} fue aceptado`, verificacion.rows[0].id_comprador]
  );

  res.json({ mensaje: 'Pedido aceptado' });
});

// PATCH /api/pedidos/:id/rechazar — el productor rechaza un pedido
router.patch('/:id/rechazar', verificarToken, verificarRol('Productor'), async (req, res) => {
  const { motivo } = req.body;
  if (!motivo) {
    return res.status(400).json({ error: 'Debes indicar el motivo del rechazo' });
  }

  const verificacion = await db.query(
    `SELECT p.id_pedido, p.id_comprador, p.estado
     FROM pedido p
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     WHERE p.id_pedido = $1 AND pr.id_productor = $2`,
    [req.params.id, req.usuario.id]
  );

  if (!verificacion.rows.length) {
    return res.status(404).json({ error: 'Pedido no encontrado o no tienes permiso' });
  }
  if (verificacion.rows[0].estado !== 'Pendiente') {
    return res.status(400).json({ error: 'Solo se pueden rechazar pedidos en estado Pendiente' });
  }

  await db.query(
    `UPDATE pedido SET estado = 'Rechazado', motivo_cancelacion = $1 WHERE id_pedido = $2`,
    [motivo, req.params.id]
  );

  await db.query(
    'INSERT INTO notificacion (mensaje, id_usuario) VALUES ($1, $2)',
    [`Tu pedido #${req.params.id} fue rechazado. Motivo: ${motivo}`, verificacion.rows[0].id_comprador]
  );

  res.json({ mensaje: 'Pedido rechazado' });
});

// PATCH /api/pedidos/:id/cancelar — el comprador cancela su pedido
router.patch('/:id/cancelar', verificarToken, verificarRol('Comprador'), async (req, res) => {
  const { motivo } = req.body;
  if (!motivo) {
    return res.status(400).json({ error: 'Debes indicar el motivo de la cancelación' });
  }

  const result = await db.query(
    `UPDATE pedido
     SET estado = 'Cancelado', motivo_cancelacion = $1
     WHERE id_pedido = $2
       AND id_comprador = $3
       AND estado IN ('Pendiente', 'Aceptado')
     RETURNING id_pedido`,
    [motivo, req.params.id, req.usuario.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Pedido no encontrado o no se puede cancelar' });
  }
  res.json({ mensaje: 'Pedido cancelado' });
});

module.exports = router;