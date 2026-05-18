import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Tienda() {
  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [busqueda,    setBusqueda]    = useState('');
  const [catActiva,   setCatActiva]   = useState('');
  const [cargando,    setCargando]    = useState(true);
  const [pedidoModal, setPedidoModal] = useState(null);
  const [cantidad,    setCantidad]    = useState(1);
  const [mensaje,     setMensaje]     = useState('');

  useEffect(() => {
    Promise.all([api.getCategorias(), api.getProductos()])
      .then(([cats, prods]) => { setCategorias(cats); setProductos(prods); })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const buscar = async () => {
    setCargando(true);
    try {
      const filtros = {};
      if (busqueda)   filtros.nombre    = busqueda;
      if (catActiva)  filtros.categoria = catActiva;
      const data = await api.getProductos(filtros);
      setProductos(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Buscar cuando cambia la búsqueda o categoría
  useEffect(() => { buscar(); }, [busqueda, catActiva]);

  const hacerPedido = async () => {
    try {
      await api.crearPedido({ id_producto: pedidoModal.id_producto, cantidad });
      setMensaje(`Pedido de ${cantidad} lb de ${pedidoModal.nombre} registrado exitosamente`);
      setPedidoModal(null);
      setCantidad(1);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const iconoCat = { 'Hortalizas':'🥬', 'Granos Basicos':'🌽', 'Frutas':'🍊', 'Hierbas':'🌿', 'Otros':'📦' };

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Tienda Agrícola</h1>
        <p className="text-green-200 text-sm">Productos frescos disponibles</p>
      </div>

      {/* Mensaje de éxito/error */}
      {mensaje && (
        <div className={`mx-4 mt-3 rounded-xl p-3 text-sm border ${mensaje.includes('exitosamente') ? 'bg-verde-claro text-verde border-verde' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {mensaje}
          <button onClick={() => setMensaje('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-200 flex items-center px-3 gap-2">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar productos..."
          className="flex-1 py-3 text-sm focus:outline-none bg-transparent"
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="text-gray-400 text-sm">✕</button>
        )}
      </div>

      {/* Filtro por categorías */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1">
        <button
          onClick={() => setCatActiva('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
            ${!catActiva ? 'bg-verde text-white border-verde' : 'bg-white text-gray-500 border-gray-200'}`}
        >
          Todos
        </button>
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCatActiva(catActiva === cat ? '' : cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
              ${catActiva === cat ? 'bg-verde text-white border-verde' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {iconoCat[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Lista de productos */}
      <div className="mt-3">
        {cargando ? (
          <p className="text-center text-gray-400 py-12">Cargando...</p>
        ) : productos.length === 0 ? (
          <div className="mx-4 bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400">No encontramos productos con esos filtros</p>
          </div>
        ) : (
          productos.map(prod => (
            <div key={prod.id_producto} className="mx-4 mb-3 bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{iconoCat[prod.categoria]}</span>
                    <p className="font-bold text-gray-800">{prod.nombre}</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {prod.cantidad_disponible} lb disponibles
                  </p>
                </div>
                <p className="font-bold text-verde text-lg">
                  Q{parseFloat(prod.precio).toFixed(2)}/lb
                </p>
              </div>

              {/* Info del vendedor */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="w-7 h-7 bg-verde-claro rounded-full flex items-center justify-center text-xs font-bold text-verde">
                  {prod.productor_nombre?.charAt(0)}
                </div>
                <span className="text-sm text-gray-600">{prod.productor_nombre}</span>
                <span className="ml-auto text-dorado text-sm">★ {prod.productor_rating}</span>
              </div>

              {prod.punto_entrega && (
                <p className="text-xs text-gray-400 mt-1">📍 {prod.punto_entrega}</p>
              )}

              <button
                onClick={() => { setPedidoModal(prod); setCantidad(1); }}
                className="w-full mt-3 bg-verde text-white rounded-xl py-2.5 font-bold text-sm"
              >
                Contactar Vendedor
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal para hacer pedido */}
      {pedidoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-t-2xl p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{pedidoModal.nombre}</h3>
            <p className="text-verde font-bold text-xl mb-4">
              Q{parseFloat(pedidoModal.precio).toFixed(2)}/lb
            </p>

            <label className="text-gray-500 text-sm mb-2 block">¿Cuántas libras necesitas?</label>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-12 h-12 bg-gray-100 rounded-xl font-bold text-xl"
              >−</button>
              <span className="flex-1 text-center font-bold text-2xl">{cantidad}</span>
              <button
                onClick={() => setCantidad(Math.min(pedidoModal.cantidad_disponible, cantidad + 1))}
                className="w-12 h-12 bg-gray-100 rounded-xl font-bold text-xl"
              >+</button>
            </div>

            <div className="bg-verde-claro rounded-xl p-3 mb-4 flex justify-between">
              <span className="text-verde-osc text-sm">Total estimado:</span>
              <span className="font-bold text-verde-osc">
                Q{(cantidad * parseFloat(pedidoModal.precio)).toFixed(2)}
              </span>
            </div>

            <button
              onClick={hacerPedido}
              className="w-full bg-verde text-white rounded-xl py-3 font-bold mb-2"
            >
              Confirmar Pedido
            </button>
            <button
              onClick={() => setPedidoModal(null)}
              className="w-full border border-gray-300 text-gray-500 rounded-xl py-3 font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}