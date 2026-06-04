// productos.test.js — Pruebas de integración del módulo de productos
//
// Este archivo prueba el ciclo completo:
// Registrar usuario → hacer login → obtener token → usar endpoints de productos

const request = require('supertest');
const app     = require('../../src/app');

// Variables que se comparten entre pruebas del mismo bloque
let tokenProductor  = '';
let tokenComprador  = '';
let idProductoCreado = 0;

// beforeAll: antes de todas las pruebas, creamos usuarios y obtenemos tokens
beforeAll(async () => {
  // Registrar y loguear al productor de prueba
  await request(app).post('/api/auth/registro').send({
    nombre: 'Prod Test Productos', telefono: '88881111',
    tipo: 'Productor', contrasena: 'clave123'
  });
  const loginProd = await request(app).post('/api/auth/login')
    .send({ telefono: '88881111', contrasena: 'clave123' });
  tokenProductor = loginProd.body.token;

  // Registrar y loguear al comprador de prueba
  await request(app).post('/api/auth/registro').send({
    nombre: 'Comp Test Productos', telefono: '88882222',
    tipo: 'Comprador', contrasena: 'clave456'
  });
  const loginComp = await request(app).post('/api/auth/login')
    .send({ telefono: '88882222', contrasena: 'clave456' });
  tokenComprador = loginComp.body.token;
});

// ── BLOQUE: Publicar productos ────────────────────────────────────────────
describe('POST /api/productos — Publicar producto', () => {

  it('RF003 — un productor puede publicar un producto con categoría válida', async () => {
    const respuesta = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenProductor}`)
      .send({
        nombre:              'Tomates de Prueba',
        cantidad_disponible: 30,
        precio:              5.00,
        categoria:           'Hortalizas',
        punto_entrega:       'Terminal Test'
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.producto.nombre).toBe('Tomates de Prueba');
    expect(respuesta.body.producto.estado).toBe('Disponible');
    expect(respuesta.body.producto.categoria).toBe('Hortalizas');

    // Guardamos el ID para usarlo en pruebas siguientes
    idProductoCreado = respuesta.body.producto.id_producto;
  });

  it('RF003 — rechaza categoría inválida con 400', async () => {
    const respuesta = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenProductor}`)
      .send({
        nombre: 'Producto Prueba', cantidad_disponible: 10,
        precio: 3.00, categoria: 'Categoría Inventada'
      });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error.toLowerCase()).toContain('no válida');
  });

  it('RF003 — un comprador NO puede publicar productos (solo productores)', async () => {
    const respuesta = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenComprador}`)
      // tokenComprador tiene tipo 'Comprador', debe ser rechazado
      .send({
        nombre: 'Producto de Comprador', cantidad_disponible: 10,
        precio: 3.00, categoria: 'Frutas'
      });

    expect(respuesta.status).toBe(403);
    // El middleware verificarRol debe devolver 403 Forbidden
  });

  it('RF003 — rechaza producto sin campos obligatorios', async () => {
    const respuesta = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenProductor}`)
      .send({ nombre: 'Sin precio ni categoría' });

    expect(respuesta.status).toBe(400);
  });
});

// ── BLOQUE: Consultar productos ────────────────────────────────────────────
describe('GET /api/productos — Consultar tienda', () => {

  it('RF004 — devuelve lista de productos disponibles', async () => {
    const respuesta = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${tokenComprador}`);

    expect(respuesta.status).toBe(200);
    // La respuesta debe ser un array
    expect(Array.isArray(respuesta.body)).toBe(true);
    // Todos los productos del array deben tener estado Disponible
    respuesta.body.forEach(p => {
      expect(p.estado).toBe('Disponible');
    });
  });

  it('RF004 — filtra productos por categoría', async () => {
    const respuesta = await request(app)
      .get('/api/productos?categoria=Hortalizas')
      .set('Authorization', `Bearer ${tokenComprador}`);

    expect(respuesta.status).toBe(200);
    // Todos los productos filtrados deben ser Hortalizas
    respuesta.body.forEach(p => {
      expect(p.categoria).toBe('Hortalizas');
    });
  });

  it('RF004 — filtra productos por nombre (búsqueda parcial)', async () => {
    const respuesta = await request(app)
      .get('/api/productos?nombre=Tomate')
      .set('Authorization', `Bearer ${tokenComprador}`);

    expect(respuesta.status).toBe(200);
    // Todos los resultados deben contener "tomate" en el nombre (sin importar mayúsculas)
    respuesta.body.forEach(p => {
      expect(p.nombre.toLowerCase()).toContain('tomate');
    });
  });
});

// ── BLOQUE: Categorías ────────────────────────────────────────────────────
describe('GET /api/productos/categorias', () => {

  it('devuelve exactamente las 5 categorías del sistema', async () => {
    const respuesta = await request(app)
      .get('/api/productos/categorias')
      .set('Authorization', `Bearer ${tokenComprador}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(5);
    expect(respuesta.body).toContain('Hortalizas');
    expect(respuesta.body).toContain('Granos Basicos');
    expect(respuesta.body).toContain('Frutas');
    expect(respuesta.body).toContain('Hierbas');
    expect(respuesta.body).toContain('Otros');
  });
});

// ── BLOQUE: Cerrar publicación ────────────────────────────────────────────
describe('PATCH /api/productos/:id/cerrar', () => {

  it('RF006 — el productor puede cerrar su propia publicación', async () => {
    const respuesta = await request(app)
      .patch(`/api/productos/${idProductoCreado}/cerrar`)
      .set('Authorization', `Bearer ${tokenProductor}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toContain('cerrada');
  });

  it('RF006 — un comprador NO puede cerrar una publicación', async () => {
    const respuesta = await request(app)
      .patch(`/api/productos/${idProductoCreado}/cerrar`)
      .set('Authorization', `Bearer ${tokenComprador}`);

    expect(respuesta.status).toBe(403);
  });
});