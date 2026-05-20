import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function HistorialComprador() {
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.misPedidos()
      .then(data => setPedidos(data.filter(p => p.estado === 'Finalizado')))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const totalGastado = pedidos.reduce(
    (sum, p) => sum + (p.cantidad * parseFloat(p.precio_unitario)), 0
  );

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Historial</h1>
        <p className="text-green-200 text-sm">Tus compras completadas</p>
      </div>

      <div className="mx-4 mt-3 bg-verde-osc rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-green-200 text-xs">Total Gastado</p>
          <p className="text-white text-2xl font-bold">Q{totalGastado.toFixed(2)}</p>
        </div>
        <span className="text-green-200 text-3xl">🛒</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mx-4 mt-3">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-3xl font-bold text-verde-osc">{pedidos.length}</p>
          <p className="text-gray-500 text-xs mt-1">Compras Completadas</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-3xl font-bold text-verde-osc">
            {pedidos.reduce((s, p) => s + p.cantidad, 0)}
          </p>
          <p className="text-gray-500 text-xs mt-1">lb Compradas</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider px-4 mt-4 mb-2">
        Transacciones Recientes
      </p>

      {cargando ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : pedidos.map(p => (
        <div key={p.id_pedido} className="mx-4 mb-2 bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">{p.producto_nombre}</p>
              <p className="text-gray-500 text-sm">{p.fecha} • {p.cantidad} lb</p>
            </div>
            <p className="font-bold text-verde">
              Q{(p.cantidad * parseFloat(p.precio_unitario)).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}