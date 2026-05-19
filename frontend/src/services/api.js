// api.js — Todas las llamadas al backend en un solo lugar
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const h = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
});

const req = async (method, url, body) => {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: h(),
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
};

export const api = {
  // ── Autenticación ──────────────────────────────────────────────
  registro: (d)    => req('POST', '/auth/registro', d),
  login:    (d)    => req('POST', '/auth/login', d),
  perfil:   ()     => req('GET',  '/auth/perfil'),

  // ── Productos ──────────────────────────────────────────────────
  getProductos:    (f = {}) => req('GET',    `/productos?${new URLSearchParams(f)}`),
  getCategorias:   ()       => req('GET',    '/productos/categorias'),
  getMisProductos: ()       => req('GET',    '/productos/mis-productos'),
  crearProducto:   (d)      => req('POST',   '/productos', d),
  actualizarStock: (id, c)  => req('PATCH',  `/productos/${id}/stock`, { cantidad: c }),
  cerrarProducto:  (id)     => req('PATCH',  `/productos/${id}/cerrar`),
  eliminarProducto:(id)     => req('DELETE', `/productos/${id}`),

  // ── Pedidos ────────────────────────────────────────────────────
  crearPedido:      (d)     => req('POST',  '/pedidos', d),
  misPedidos:       ()      => req('GET',   '/pedidos/mios'),
  pedidosRecibidos: ()      => req('GET',   '/pedidos/recibidos'),
  aceptarPedido:    (id)    => req('PATCH', `/pedidos/${id}/aceptar`),
  rechazarPedido:   (id, m) => req('PATCH', `/pedidos/${id}/rechazar`, { motivo: m }),
  cancelarPedido:   (id, m) => req('PATCH', `/pedidos/${id}/cancelar`, { motivo: m }),

  // ── Entregas ───────────────────────────────────────────────────
  registrarEntrega:   (d)   => req('POST',  '/entregas', d),
  getMisEntregas:     ()    => req('GET',   '/entregas/mis-entregas'),
  getMisRecepciones:  ()    => req('GET',   '/entregas/mis-recepciones'),
  confirmarEntrega:   (id)  => req('PATCH', `/entregas/${id}/confirmar`),
  confirmarRecepcion: (id)  => req('PATCH', `/entregas/${id}/recepcion`),
  reportarProblema:   (id, d) => req('POST', `/entregas/${id}/incumplimiento`, { descripcion: d }),

  // ── Notificaciones ─────────────────────────────────────────────
  getNotificaciones: ()   => req('GET',   '/notificaciones'),
  getNoLeidas:       ()   => req('GET',   '/notificaciones/no-leidas'),
  leerTodas:         ()   => req('PATCH', '/notificaciones/leer-todas'),
  leerUna:           (id) => req('PATCH', `/notificaciones/${id}/leer`),

  // ── Admin ──────────────────────────────────────────────────────
  getUsuarios:           ()    => req('GET',   '/admin/usuarios'),
  desactivarUsuario:     (id)  => req('PATCH', `/admin/usuarios/${id}/desactivar`),
  activarUsuario:        (id)  => req('PATCH', `/admin/usuarios/${id}/activar`),
  getPedidosAdmin:       (f={})=> req('GET',   `/admin/pedidos?${new URLSearchParams(f)}`),
  getEntregasAdmin:      ()    => req('GET',   '/admin/entregas'),
  getIncumplimientos:    ()    => req('GET',   '/admin/incumplimientos'),
  validarIncumplimiento: (id)  => req('PATCH', `/admin/incumplimientos/${id}/validar`),
  reporteVentas:         (f={})=> req('GET',   `/admin/reportes/ventas?${new URLSearchParams(f)}`),
  reporteCategorias:     ()    => req('GET',   '/admin/reportes/categorias'),
};