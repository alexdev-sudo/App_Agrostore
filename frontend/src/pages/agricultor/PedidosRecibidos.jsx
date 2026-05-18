import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function PedidosRecibidos() {
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje,  setMensaje]  = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await api.pedidosRecibidos();
      setPedidos(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  const aceptar = async (id) => {
    try {
      await api.aceptarPedido(id);
      setMensaje('Pedido aceptado exitosamente');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const rechazar = async (id) => {
    const motivo = prompt('¿Por qué rechazas este pedido?');
    if (!motivo) return;
    try {
      await api.rechazarPedido(id, motivo);
      setMensaje('Pedido rechazado');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const colorEstado = {
    Pendiente:  'bg-amber-50 text-amber-700',
    Aceptado:   'bg-verde-claro text-verde',
    Rechazado:  'bg-red-50 text-red-600',
    Cancelado:  'bg-gray-100 text-gray-500',
    Finalizado: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Pedidos Recibidos</h1>
        <p className="text-green-200 text-sm">Gestiona las solicitudes de compra</p>
      </div>

      {mensaje && (
        <div className="mx-4 mt-3 bg-green-50 border border-verde rounded-xl p-3 text-sm text-verde">
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p className="text-center text-gray-400 py-12">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <div className="mx-4 mt-6 bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400">No tienes pedidos recibidos aún</p>
        </div>
      ) : (
        pedidos.map(pedido => (
          <div key={pedido.id_pedido} className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Header de la tarjeta */}
            <div className="bg-verde-osc px-4 py-2 flex justify-between items-center">
              <span className="text-white text-sm font-bold">{pedido.producto_nombre} — {pedido.cantidad} lb</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorEstado[pedido.estado]}`}>
                {pedido.estado}
              </span>
            </div>

            {/* Detalles */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Comprador</p>
                  <p className="font-bold text-gray-800">{pedido.comprador_nombre}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Teléfono</p>
                  <p className="font-bold text-gray-800">{pedido.comprador_telefono}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Precio unitario</p>
                  <p className="font-bold text-verde">Q{parseFloat(pedido.precio_unitario).toFixed(2)}/lb</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="font-bold text-verde-osc">
                    Q{(pedido.cantidad * parseFloat(pedido.precio_unitario)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botones solo si está Pendiente */}
              {pedido.estado === 'Pendiente' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => aceptar(pedido.id_pedido)}
                    className="flex-1 bg-verde text-white rounded-xl py-2 font-bold text-sm"
                  >
                    ✓ Aceptar
                  </button>
                  <button
                    onClick={() => rechazar(pedido.id_pedido)}
                    className="flex-1 border border-red-300 text-red-500 rounded-xl py-2 font-bold text-sm"
                  >
                    ✗ Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}