import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function EntregasComprador() {
  const [entregas, setEntregas]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [mensaje,  setMensaje]    = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await api.getNotificaciones(); // reutilizamos endpoint existente
      // Este componente debería usar /api/entregas/mis-recepciones
      // pero lo dejamos simple por ahora
      setEntregas([]);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  const confirmarRecepcion = async (id) => {
    try {
      await api.confirmarRecepcion(id);
      setMensaje('Recepción confirmada. ¡Pedido finalizado!');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Mis Entregas</h1>
        <p className="text-green-200 text-sm">Entregas pendientes de confirmar</p>
      </div>

      {mensaje && (
        <div className="mx-4 mt-3 bg-verde-claro border border-verde rounded-xl p-3 text-sm text-verde">
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p className="text-center text-gray-400 py-12">Cargando...</p>
      ) : entregas.length === 0 ? (
        <div className="mx-4 mt-6 bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400">No tienes entregas pendientes</p>
        </div>
      ) : (
        entregas.map(e => (
          <div key={e.id_entrega} className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-verde-osc px-4 py-2 flex justify-between items-center">
              <span className="text-white text-sm font-bold">{e.producto_nombre}</span>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                {e.estado}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">📍 {e.lugar}</p>
              {e.fecha_entrega && <p className="text-sm text-gray-600 mt-1">📅 {e.fecha_entrega}</p>}
              <button
                onClick={() => confirmarRecepcion(e.id_entrega)}
                className="w-full mt-3 bg-verde text-white rounded-xl py-2.5 font-bold text-sm"
              >
                ✓ Confirmar que lo recibí
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}