// api.js — Todas las llamadas al backend en un solo lugar
//
// Ventaja: si cambia la URL de la API, solo cambias aquí.
// Todas las pantallas importan las funciones de este archivo.

// VITE_API_URL viene del archivo .env del frontend:
// En desarrollo: http://localhost:3001/api
// En producción: https://agrostore-api.up.railway.app/api
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// h() construye los headers de cada petición.
// Agrega automáticamente el token JWT del localStorage.
const h = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
});

// req() es la función base que hace la petición HTTP.
// Lanza un error si el servidor responde con código >= 400.
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

// Todas las funciones de la API del proyecto
export const api = {
  // Autenticación
  registro: (d)         => req('POST',  '/auth/registro', d),
  login:    (d)         => req('POST',  '/auth/login', d),
  perfil:   ()          => req('GET',   '/auth/perfil'),

  // Productos
  getProductos:    (f={})  => req('GET',    `/productos?${new URLSearchParams(f)}`),
  getCategorias:   ()      => req('GET',    '/productos/categorias'),
  getMisProductos: ()      => req('GET',    '/productos/mis-productos'),
  crearProducto:   (d)     => req('POST',   '/productos', d),
  actualizarStock: (id, c) => req('PATCH',  `/productos/${id}/stock`, { cantidad: c }),
  cerrarProducto:  (id)    => req('PATCH',  `/productos/${id}/cerrar`),
  eliminarProducto:(id)    => req('DELETE', `/productos/${id}`),

  // Pedidos
  crearPedido:        (d)      => req('POST',  '/pedidos', d),
  misPedidos:         ()       => req('GET',   '/pedidos/mios'),
  pedidosRecibidos:   ()       => req('GET',   '/pedidos/recibidos'),
  aceptarPedido:      (id)     => req('PATCH', `/pedidos/${id}/aceptar`),
  rechazarPedido:     (id, m)  => req('PATCH', `/pedidos/${id}/rechazar`, { motivo: m }),
  cancelarPedido:     (id, m)  => req('PATCH', `/pedidos/${id}/cancelar`, { motivo: m }),

  // Entregas
  registrarEntrega:    (d)     => req('POST',  '/entregas', d),
  confirmarEntrega:    (id)    => req('PATCH', `/entregas/${id}/confirmar`),
  confirmarRecepcion:  (id)    => req('PATCH', `/entregas/${id}/recepcion`),
  reportarProblema:    (id, d) => req('POST',  `/entregas/${id}/incumplimiento`, { descripcion: d }),

  // Notificaciones
  getNotificaciones: () => req('GET',   '/notificaciones'),
  leerTodas:         () => req('PATCH', '/notificaciones/leer-todas'),

  // Admin
  getUsuarios:          ()  => req('GET',   '/admin/usuarios'),
  getIncumplimientos:   ()  => req('GET',   '/admin/incumplimientos'),
  reporteVentas:        (f) => req('GET',   `/admin/reportes/ventas?${new URLSearchParams(f)}`),
};