const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// POST /api/entregas — registrar la entrega de un pedido aceptado
router.post('/', verificarToken, async (req, res) => {
  const { id_pedido, fecha_entrega, lugar, observaciones } = req.body;

  if (!id_pedido || !lugar) {
    return res.status(400).json({ error: 'id_pedido y lugar son obligatorios' });
  }

  // Verificar que el pedido está en estado Aceptado antes de registrar la entrega
  const pedidoResult = await db.query(
    `SELECT * FROM pedido WHERE id_pedido = $1 AND estado = 'Aceptado'`,
    [id_pedido]
  );
  if (!pedidoResult.rows.length) {
    return res.status(400).json({ error: 'El pedido debe estar en estado Aceptado para registrar la entrega' });
  }

  const result = await db.query(
    `INSERT INTO entrega (fecha_entrega, lugar, observaciones, id_pedido)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [fecha_entrega || null, lugar, observaciones || null, id_pedido]
  );

  res.status(201).json({ mensaje: 'Entrega registrada', entrega: result.rows[0] });
});

// GET /api/entregas/mis-entregas — el productor ve sus entregas pendientes
router.get('/mis-entregas', verificarToken, verificarRol('Productor'), async (req, res) => {
  const result = await db.query(
    `SELECT e.*,
            p.id_comprador,
            dp.cantidad,
            pr.nombre AS producto_nombre,
            uc.nombre AS comprador_nombre
     FROM entrega e
     JOIN pedido p          ON e.id_pedido    = p.id_pedido
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     JOIN usuario uc        ON p.id_comprador = uc.id_usuario
     WHERE pr.id_productor = $1
     ORDER BY e.fecha_entrega ASC`,
    [req.usuario.id]
  );
  res.json(result.rows);
});

// GET /api/entregas/mis-recepciones — el comprador ve entregas que debe confirmar
router.get('/mis-recepciones', verificarToken, verificarRol('Comprador'), async (req, res) => {
  const result = await db.query(
    `SELECT e.*,
            dp.cantidad,
            pr.nombre AS producto_nombre,
            up.nombre AS productor_nombre
     FROM entrega e
     JOIN pedido p          ON e.id_pedido    = p.id_pedido
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     JOIN usuario up        ON pr.id_productor = up.id_usuario
     WHERE p.id_comprador = $1
     ORDER BY e.fecha_entrega ASC`,
    [req.usuario.id]
  );
  res.json(result.rows);
});

// PATCH /api/entregas/:id/confirmar — el productor confirma que entregó el producto
router.patch('/:id/confirmar', verificarToken, verificarRol('Productor'), async (req, res) => {
  const result = await db.query(
    `UPDATE entrega SET estado = 'Confirmado_Productor'
     WHERE id_entrega = $1 AND estado = 'Pendiente'
     RETURNING id_pedido`,
    [req.params.id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: 'Entrega no encontrada o ya fue confirmada' });
  }

  // Notificar al comprador que el productor marcó el producto como entregado
  const pedido = await db.query(
    'SELECT id_comprador FROM pedido WHERE id_pedido = $1',
    [result.rows[0].id_pedido]
  );
  await db.query(
    'INSERT INTO notificacion (mensaje, id_usuario) VALUES ($1, $2)',
    ['El agricultor confirmó que realizó la entrega. Confirma la recepción.', pedido.rows[0].id_comprador]
  );

  res.json({ mensaje: 'Entrega confirmada por productor' });
});

// PATCH /api/entregas/:id/recepcion — el comprador confirma que recibió el producto
// Este es el paso final: cierra el pedido como Finalizado
router.patch('/:id/recepcion', verificarToken, verificarRol('Comprador'), async (req, res) => {
  const conn = await db.connect();
  try {
    await conn.query('BEGIN');

    // Obtener la entrega y verificar que está en el estado correcto
    const entregaResult = await conn.query(
      `SELECT e.*, p.id_comprador
       FROM entrega e
       JOIN pedido p ON e.id_pedido = p.id_pedido
       WHERE e.id_entrega = $1`,
      [req.params.id]
    );
    if (!entregaResult.rows.length) {
      await conn.query('ROLLBACK');
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    const entrega = entregaResult.rows[0];

    // Verificar que el comprador que confirma es el dueño del pedido
    if (entrega.id_comprador !== req.usuario.id) {
      await conn.query('ROLLBACK');
      return res.status(403).json({ error: 'No puedes confirmar una entrega que no te pertenece' });
    }

    // Marcar la entrega como Finalizada
    await conn.query(
      `UPDATE entrega SET estado = 'Finalizado' WHERE id_entrega = $1`,
      [req.params.id]
    );

    // Marcar el pedido como Finalizado
    await conn.query(
      `UPDATE pedido SET estado = 'Finalizado' WHERE id_pedido = $1`,
      [entrega.id_pedido]
    );

    await conn.query('COMMIT');
    res.json({ mensaje: 'Recepción confirmada. Pedido finalizado exitosamente.' });
  } catch (err) {
    await conn.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al confirmar la recepción' });
  } finally {
    conn.release();
  }
});

// POST /api/entregas/:id/incumplimiento — reportar un problema en la entrega
router.post('/:id/incumplimiento', verificarToken, async (req, res) => {
  const { descripcion } = req.body;
  if (!descripcion) {
    return res.status(400).json({ error: 'Debes describir el incumplimiento' });
  }

  // Obtener el id_pedido de esa entrega
  const entregaResult = await db.query(
    'SELECT id_pedido FROM entrega WHERE id_entrega = $1',
    [req.params.id]
  );
  if (!entregaResult.rows.length) {
    return res.status(404).json({ error: 'Entrega no encontrada' });
  }

  const id_pedido = entregaResult.rows[0].id_pedido;

  await db.query(
    `INSERT INTO incumplimiento (descripcion, id_usuario, id_pedido)
     VALUES ($1, $2, $3)`,
    [descripcion, req.usuario.id, id_pedido]
  );

  // Notificar al administrador
  await db.query(
    `INSERT INTO notificacion (mensaje, id_usuario)
     SELECT $1, id_usuario FROM usuario WHERE tipo = 'Administrador' AND activo = TRUE`,
    [`Incumplimiento reportado en el pedido #${id_pedido}`]
  );

  res.status(201).json({ mensaje: 'Incumplimiento registrado. El administrador lo revisará.' });
});

module.exports = router;