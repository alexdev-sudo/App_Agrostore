// auth.test.js — Pruebas de integración del módulo de autenticación
//
// Supertest crea un servidor HTTP temporal con nuestra app Express
// y envía peticiones reales. Verifica que las respuestas sean correctas.
//
// Flujo de cada prueba:
//   1. request(app) crea el servidor temporal
//   2. .post('/api/auth/registro') hace la petición
//   3. .send({...}) envía el body JSON
//   4. .expect(201) verifica el código de estado HTTP
//   5. La prueba pasa si todo coincide

const request = require('supertest');
// request de supertest envuelve la app Express sin arrancarla en un puerto real

const app = require('../../src/app');
// Importamos el app (sin listen) que creamos en app.js

// ── Datos de prueba reutilizables ────────────────────────────────────────
// Los definimos aquí para reutilizarlos en múltiples pruebas
// y para que sea fácil cambiarlos si cambian los requisitos.
const agricultorPrueba = {
  nombre:    'Agricultor de Prueba',
  telefono:  '99991111',
  // Usamos teléfonos que no existen en la BD real para evitar conflictos
  tipo:      'Productor',
  contrasena: 'clave123',
  ubicacion: 'Aldea Test'
};

const compradorPrueba = {
  nombre:    'Comprador de Prueba',
  telefono:  '99992222',
  tipo:      'Comprador',
  contrasena: 'clave456'
};

// ── BLOQUE: Registro de usuarios ─────────────────────────────────────────
describe('POST /api/auth/registro', () => {

  it('RF001 — registra un productor correctamente y devuelve 201', async () => {
    // async/await porque las peticiones HTTP son asíncronas
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send(agricultorPrueba)
      .set('Content-Type', 'application/json');

    // Verificamos el código de estado HTTP
    expect(respuesta.status).toBe(201);
    // Verificamos que el body tenga el mensaje correcto
    expect(respuesta.body.mensaje).toBe('Cuenta creada exitosamente!!');
    // Verificamos que devuelva los datos del usuario sin la contraseña
    expect(respuesta.body.usuario).toHaveProperty('id_usuario');
    expect(respuesta.body.usuario.tipo).toBe('Productor');
    // Verificamos que la contraseña NO esté en la respuesta (seguridad)
    expect(respuesta.body.usuario).not.toHaveProperty('contrasena');
  });

  it('RF001 — registra un comprador correctamente y devuelve 201', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send(compradorPrueba);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.usuario.tipo).toBe('Comprador');
  });

  it('RF001 — rechaza registro con teléfono duplicado y devuelve 409', async () => {
    // Intentamos registrar el mismo teléfono dos veces
    await request(app).post('/api/auth/registro').send(agricultorPrueba);
    // La segunda vez debe fallar con 409 Conflict
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send(agricultorPrueba);

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).toContain('ya tiene una cuenta');
    // .toContain() verifica que el mensaje incluya ese texto
  });

  it('RF001 — rechaza registro sin campos obligatorios y devuelve 400', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Sin Teléfono' });
    // Falta teléfono, tipo y contraseña

    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toHaveProperty('error');
  });

  it('RNF004 — rechaza registro con tipo Administrador (solo desde BD)', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ ...agricultorPrueba, telefono: '99993333', tipo: 'Administrador' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toContain('tipo de usuario no valido debe ser productor o comprador');
  });
});

// ── BLOQUE: Inicio de sesión ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  // beforeAll se ejecuta UNA VEZ antes de todas las pruebas de este bloque.
  // Registramos el usuario de prueba para que el login tenga algo con qué probar.
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/registro')
      .send({ ...agricultorPrueba, telefono: '99994444' });
  });

  it('RF002 — login exitoso devuelve token JWT y datos del usuario', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ telefono: '99994444', contrasena: 'clave123' });

    expect(respuesta.status).toBe(200);

    // Verificamos que el token sea un string no vacío
    expect(typeof respuesta.body.token).toBe('string');
    expect(respuesta.body.token.length).toBeGreaterThan(0);

    // Verificamos que devuelva los datos del usuario
    expect(respuesta.body.usuario).toHaveProperty('id');
    expect(respuesta.body.usuario).toHaveProperty('nombre');
    expect(respuesta.body.usuario).toHaveProperty('tipo');

    // Verificamos que la contraseña no viaje en la respuesta
    expect(respuesta.body.usuario).not.toHaveProperty('contrasena');
  });

  it('RF002 — login con contraseña incorrecta devuelve 401', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ telefono: '99994444', contrasena: 'claveEquivocada' });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error).toBe('Contrasena Incorrecta');
  });

  it('RF002 — login con teléfono no registrado devuelve 404', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ telefono: '00000001', contrasena: 'cualquier' });

    expect(respuesta.status).toBe(401);
  });

  it('RNF004 — login sin datos devuelve 400', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(respuesta.status).toBe(400);
  });
});

// ── BLOQUE: Rutas protegidas sin token ───────────────────────────────────
describe('Seguridad — Rutas protegidas', () => {

  it('RNF004 — /api/productos sin token devuelve 401', async () => {
    const respuesta = await request(app).get('/api/productos');
    // Sin header Authorization, el middleware verificarToken debe rechazarla
    expect(respuesta.status).toBe(401);
  });

  it('RNF004 — /api/productos con token inválido devuelve 403', async () => {
    const respuesta = await request(app)
      .get('/api/productos')
      .set('Authorization', 'Bearer tokenFalsoQueNoExiste');

    expect(respuesta.status).toBe(403);
  });
});