import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function MisPedidos() {
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje,  setMensaje]  = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await api.misPedidos();
      setPedidos(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cancelar = async (id) => {
    const motivo = prompt('¿Por qué cancelas este pedido?');
    if (!motivo) return;
    try {
      await api.cancelarPedido(id, motivo);
      setMensaje('Pedido cancelado');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const colorEstado = {
    Pendiente:  'bg-amber-50 text-amber-700 border-amber-200',
    Aceptado:   'bg-verde-claro text-verde border-verde',
    Rechazado:  'bg-red-50 text-red-600 border-red-200',
    Cancelado:  'bg-gray-100 text-gray-500 border-gray-200',
    Finalizado: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Mis Pedidos</h1>
        <p className="text-green-200 text-sm">Estado de tus compras</p>
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
          <p className="text-gray-400">No tienes pedidos realizados aún</p>
        </div>
      ) : (
        pedidos.map(p => (
          <div key={p.id_pedido} className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-verde-osc px-4 py-2 flex justify-between items-center">
              <span className="text-white text-sm font-bold">
                {p.producto_nombre} — {p.cantidad} lb
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colorEstado[p.estado]}`}>
                {p.estado}
              </span>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Vendedor</p>
                  <p className="font-bold">{p.productor_nombre}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Fecha</p>
                  <p className="font-bold">{p.fecha}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Precio unitario</p>
                  <p className="font-bold text-verde">Q{parseFloat(p.precio_unitario).toFixed(2)}/lb</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="font-bold text-verde-osc">
                    Q{(p.cantidad * parseFloat(p.precio_unitario)).toFixed(2)}
                  </p>
                </div>
              </div>

              {p.punto_entrega && (
                <p className="text-xs text-gray-500">📍 {p.punto_entrega}</p>
              )}

              {p.motivo_cancelacion && (
                <p className="text-xs text-red-500 mt-1">Motivo: {p.motivo_cancelacion}</p>
              )}

              {['Pendiente', 'Aceptado'].includes(p.estado) && (
                <button
                  onClick={() => cancelar(p.id_pedido)}
                  className="w-full mt-3 border border-red-300 text-red-500 rounded-xl py-2 text-sm font-bold"
                >
                  Cancelar pedido
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}