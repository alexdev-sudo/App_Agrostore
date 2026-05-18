const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todos los endpoints de admin requieren token + rol Administrador
const soloAdmin = [verificarToken, verificarRol('Administrador')];

// GET /api/admin/usuarios — lista todos los usuarios del sistema
router.get('/usuarios', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `SELECT id_usuario, nombre, telefono, tipo, ubicacion, calificacion, activo, creado_en
     FROM usuario
     ORDER BY creado_en DESC`
  );
  res.json(result.rows);
});

// PATCH /api/admin/usuarios/:id/desactivar — desactiva una cuenta de usuario
router.patch('/usuarios/:id/desactivar', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `UPDATE usuario SET activo = FALSE WHERE id_usuario = $1 RETURNING nombre`,
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ mensaje: `Cuenta de ${result.rows[0].nombre} desactivada` });
});

// PATCH /api/admin/usuarios/:id/activar — reactiva una cuenta
router.patch('/usuarios/:id/activar', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `UPDATE usuario SET activo = TRUE WHERE id_usuario = $1 RETURNING nombre`,
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ mensaje: `Cuenta de ${result.rows[0].nombre} reactivada` });
});

// GET /api/admin/pedidos — todos los pedidos del sistema con filtros opcionales
// Uso: /api/admin/pedidos?estado=Pendiente&desde=2026-01-01&hasta=2026-12-31
router.get('/pedidos', ...soloAdmin, async (req, res) => {
  const { estado, desde, hasta } = req.query;

  let sql = `
    SELECT p.id_pedido, p.fecha, p.estado, p.motivo_cancelacion,
           dp.cantidad, dp.precio_unitario,
           pr.nombre  AS producto_nombre, pr.categoria,
           uc.nombre  AS comprador_nombre,
           up.nombre  AS productor_nombre
    FROM pedido p
    JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
    JOIN producto pr       ON dp.id_producto = pr.id_producto
    JOIN usuario uc        ON p.id_comprador = uc.id_usuario
    JOIN usuario up        ON pr.id_productor = up.id_usuario
    WHERE 1=1
  `;
  const params = [];

  if (estado) { params.push(estado);  sql += ` AND p.estado = $${params.length}`; }
  if (desde)  { params.push(desde);   sql += ` AND p.fecha >= $${params.length}`; }
  if (hasta)  { params.push(hasta);   sql += ` AND p.fecha <= $${params.length}`; }

  sql += ' ORDER BY p.fecha DESC';

  const result = await db.query(sql, params);
  res.json(result.rows);
});

// GET /api/admin/entregas — todas las entregas del sistema
router.get('/entregas', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `SELECT e.*,
            dp.cantidad,
            pr.nombre AS producto_nombre,
            uc.nombre AS comprador_nombre,
            up.nombre AS productor_nombre
     FROM entrega e
     JOIN pedido p          ON e.id_pedido    = p.id_pedido
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     JOIN usuario uc        ON p.id_comprador = uc.id_usuario
     JOIN usuario up        ON pr.id_productor = up.id_usuario
     ORDER BY e.fecha_entrega DESC`
  );
  res.json(result.rows);
});

// GET /api/admin/incumplimientos — todos los incumplimientos reportados
router.get('/incumplimientos', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `SELECT i.*,
            u.nombre AS reportado_por,
            u.tipo   AS tipo_reportador
     FROM incumplimiento i
     JOIN usuario u ON i.id_usuario = u.id_usuario
     ORDER BY i.fecha DESC`
  );
  res.json(result.rows);
});

// PATCH /api/admin/incumplimientos/:id/validar — el admin valida un incumplimiento
router.patch('/incumplimientos/:id/validar', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `UPDATE incumplimiento SET validado = TRUE
     WHERE id_incumplimiento = $1
     RETURNING id_incumplimiento`,
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Incumplimiento no encontrado' });
  res.json({ mensaje: 'Incumplimiento validado' });
});

// GET /api/admin/reportes/ventas — resumen de ventas por productor
// Uso: /api/admin/reportes/ventas?desde=2026-01-01&hasta=2026-12-31
router.get('/reportes/ventas', ...soloAdmin, async (req, res) => {
  const { desde, hasta } = req.query;

  let condicion = "WHERE p.estado = 'Finalizado'";
  const params = [];

  if (desde) { params.push(desde); condicion += ` AND p.fecha >= $${params.length}`; }
  if (hasta) { params.push(hasta); condicion += ` AND p.fecha <= $${params.length}`; }

  const result = await db.query(
    `SELECT up.nombre  AS productor,
            COUNT(DISTINCT p.id_pedido)         AS total_ventas,
            SUM(dp.cantidad)                    AS total_libras,
            SUM(dp.cantidad * dp.precio_unitario) AS total_ingresos
     FROM pedido p
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     JOIN usuario up        ON pr.id_productor = up.id_usuario
     ${condicion}
     GROUP BY up.id_usuario, up.nombre
     ORDER BY total_ingresos DESC`,
    params
  );
  res.json(result.rows);
});

// GET /api/admin/reportes/categorias — ventas agrupadas por categoría
router.get('/reportes/categorias', ...soloAdmin, async (req, res) => {
  const result = await db.query(
    `SELECT pr.categoria,
            COUNT(DISTINCT p.id_pedido)           AS total_pedidos,
            SUM(dp.cantidad)                      AS total_libras,
            SUM(dp.cantidad * dp.precio_unitario) AS total_ingresos
     FROM pedido p
     JOIN detalle_pedido dp ON p.id_pedido    = dp.id_pedido
     JOIN producto pr       ON dp.id_producto = pr.id_producto
     WHERE p.estado = 'Finalizado'
     GROUP BY pr.categoria
     ORDER BY total_ingresos DESC`
  );
  res.json(result.rows);
});

module.exports = router;