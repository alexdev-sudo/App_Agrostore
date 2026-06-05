// validaciones.test.js — Pruebas unitarias de lógica de negocio
//
// Estas pruebas NO usan base de datos ni hacen peticiones HTTP.
// Son las más rápidas (menos de 1 segundo) y las más confiables.
//
// ESTRUCTURA de cada prueba con Jest:
//   describe('grupo de pruebas', () => {
//     it('lo que debe hacer', () => {
//       expect(resultado).toBe(valorEsperado);
//     });
//   });

// ── Funciones que vamos a probar ────────────────────────────────────────
// Estas son la lógica de negocio de AgroStore extraída para poder
// probarla de forma aislada.

// Valida que una categoría de producto sea válida
const CATEGORIAS_VALIDAS = ['Hortalizas', 'Granos Basicos', 'Frutas', 'Hierbas', 'Otros'];

function esCategoriaValida(categoria) {
  return CATEGORIAS_VALIDAS.includes(categoria);
}

// Calcula el total de un pedido dado cantidad y precio unitario
function calcularTotalPedido(cantidad, precioUnitario) {
  if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a cero');
  if (precioUnitario <= 0) throw new Error('El precio debe ser mayor a cero');
  return parseFloat((cantidad * precioUnitario).toFixed(2));
}

// Valida que un número de teléfono guatemalteco tenga entre 8 y 15 dígitos
function esTelefonoValido(telefono) {
  const soloDigitos = telefono.replace(/[\s-]/g, '');
  return soloDigitos.length >= 8 && soloDigitos.length <= 15;
}

// Verifica si un pedido puede cancelarse según su estado actual
function pedidoPuedeCancelarse(estado) {
  return ['Pendiente', 'Aceptado'].includes(estado);
}

// ── PRUEBAS ─────────────────────────────────────────────────────────────

// describe() agrupa pruebas relacionadas bajo un nombre
describe('Validación de categorías de productos', () => {

  // it() define una prueba individual
  // El nombre debe describir el comportamiento esperado
  it('acepta una categoría válida: Hortalizas', () => {
    // expect() recibe el valor que queremos verificar
    // .toBe() verifica igualdad estricta (===)
    expect(esCategoriaValida('Hortalizas')).toBe(true);
  });

  it('acepta todas las categorías válidas del sistema', () => {
    CATEGORIAS_VALIDAS.forEach(cat => {
      // Cada categoría del array debe pasar la validación
      expect(esCategoriaValida(cat)).toBe(true);
    });
  });

  it('rechaza una categoría que no existe en el sistema', () => {
    expect(esCategoriaValida('Frutas Tropicales')).toBe(false);
  });

  it('rechaza una cadena vacía como categoría', () => {
    expect(esCategoriaValida('')).toBe(false);
  });

  it('es sensible a mayúsculas: "hortalizas" no es válida', () => {
    // La base de datos guarda "Hortalizas" con mayúscula inicial.
    // Si alguien envía "hortalizas" en minúscula, debe rechazarse.
    expect(esCategoriaValida('hortalizas')).toBe(false);
  });
});

describe('Cálculo del total de un pedido', () => {

  it('calcula correctamente: 50 lb × Q5.00 = Q250.00', () => {
    expect(calcularTotalPedido(50, 5.00)).toBe(250.00);
  });

  it('redondea a 2 decimales: 3 lb × Q3.33 = Q9.99', () => {
    expect(calcularTotalPedido(3, 3.33)).toBe(9.99);
  });

  it('lanza error si la cantidad es cero', () => {
    // .toThrow() verifica que la función lanza un error con ese mensaje
    expect(() => calcularTotalPedido(0, 5.00)).toThrow('La cantidad debe ser mayor a cero');
  });

  it('lanza error si el precio es negativo', () => {
    expect(() => calcularTotalPedido(10, -1)).toThrow('El precio debe ser mayor a cero');
  });
});

describe('Validación de números de teléfono', () => {

  it('acepta un teléfono guatemalteco de 8 dígitos', () => {
    expect(esTelefonoValido('55551234')).toBe(true);
  });

  it('acepta teléfono con guiones: 5555-1234', () => {
    expect(esTelefonoValido('5555-1234')).toBe(true);
  });

  it('rechaza un teléfono de menos de 8 dígitos', () => {
    expect(esTelefonoValido('123')).toBe(false);
  });

  it('rechaza una cadena vacía', () => {
    expect(esTelefonoValido('')).toBe(false);
  });
});

describe('Validación de cancelación de pedidos', () => {

  it('un pedido Pendiente SÍ puede cancelarse', () => {
    expect(pedidoPuedeCancelarse('Pendiente')).toBe(true);
  });

  it('un pedido Aceptado SÍ puede cancelarse', () => {
    expect(pedidoPuedeCancelarse('Aceptado')).toBe(true);
  });

  it('un pedido Finalizado NO puede cancelarse', () => {
    expect(pedidoPuedeCancelarse('Finalizado')).toBe(false);
  });

  it('un pedido Rechazado NO puede cancelarse', () => {
    expect(pedidoPuedeCancelarse('Rechazado')).toBe(false);
  });

  it('un pedido ya Cancelado NO puede cancelarse de nuevo', () => {
    expect(pedidoPuedeCancelarse('Cancelado')).toBe(false);
  });
});