import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Buzon({ onLeer }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando]             = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await api.getNotificaciones();
      setNotificaciones(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  const leerTodas = async () => {
    try {
      await api.leerTodas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      onLeer && onLeer();
    } catch (err) {
      console.error(err.message);
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-xl font-bold">Buzón de Mensajes</h1>
            <p className="text-green-200 text-sm">
              {noLeidas > 0 ? `${noLeidas} mensajes nuevos` : 'Todo al día'}
            </p>
          </div>
          {noLeidas > 0 && (
            <button
              onClick={leerTodas}
              className="text-green-200 text-xs border border-green-400 rounded-lg px-2 py-1"
            >
              Marcar todo leído
            </button>
          )}
        </div>
      </div>

      {cargando ? (
        <p className="text-center text-gray-400 py-12">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <div className="mx-4 mt-6 bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-400">No tienes notificaciones</p>
        </div>
      ) : (
        notificaciones.map(n => (
          <div
            key={n.id_notificacion}
            className={`mx-4 mt-3 rounded-xl p-4 border flex gap-3 ${!n.leida ? 'bg-white border-verde' : 'bg-gray-50 border-gray-100'}`}
          >
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.leida ? 'bg-verde' : 'bg-gray-300'}`} />
            <div>
              <p className={`text-sm ${!n.leida ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                {n.mensaje}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.fecha).toLocaleString('es-GT')}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}