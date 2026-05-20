const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verificarToken } = require('../middleware/auth');

// GET /api/notificaciones — obtiene las notificaciones del usuario logueado
router.get('/', verificarToken, async (req, res) => {
  const result = await db.query(
    `SELECT * FROM notificacion
     WHERE id_usuario = $1
     ORDER BY fecha DESC
     LIMIT 50`,
    [req.usuario.id]
  );
  res.json(result.rows);
});

// GET /api/notificaciones/no-leidas — solo el conteo para la burbuja del buzón
router.get('/no-leidas', verificarToken, async (req, res) => {
  const result = await db.query(
    `SELECT COUNT(*) AS total
     FROM notificacion
     WHERE id_usuario = $1 AND leida = FALSE`,
    [req.usuario.id]
  );
  // parseInt porque COUNT devuelve string en PostgreSQL
  res.json({ total: parseInt(result.rows[0].total) });
});

// PATCH /api/notificaciones/leer-todas — marca todas como leídas
router.patch('/leer-todas', verificarToken, async (req, res) => {
  await db.query(
    'UPDATE notificacion SET leida = TRUE WHERE id_usuario = $1',
    [req.usuario.id]
  );
  res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
});

// PATCH /api/notificaciones/:id/leer — marca una notificación específica como leída
router.patch('/:id/leer', verificarToken, async (req, res) => {
  await db.query(
    'UPDATE notificacion SET leida = TRUE WHERE id_notificacion = $1 AND id_usuario = $2',
    [req.params.id, req.usuario.id]
  );
  res.json({ mensaje: 'Notificación leída' });
});

module.exports = router;