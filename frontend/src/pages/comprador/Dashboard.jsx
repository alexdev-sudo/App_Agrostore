import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import BottomNav from '../../components/BottomNav';
import Tienda       from './Tienda';
import MisPedidos   from './MisPedidos';
import EntregasComp from './Entregas';
import Buzon        from '../Buzon';
import HistorialComp from './Historial';

export default function DashboardComprador() {
  const { usuario, logout } = useAuth();
  const [tab, setTab]                       = useState('inicio');
  const [misPedidos, setMisPedidos]         = useState([]);
  const [notificaciones, setNotificaciones] = useState(0);
  const [cargando, setCargando]             = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const [pedidos, notifs] = await Promise.all([
        api.misPedidos(),
        api.getNotificaciones()
      ]);
      setMisPedidos(pedidos);
      setNotificaciones(notifs.filter(n => !n.leida).length);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  const PantallaInicio = () => (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <p className="text-green-200 text-xs">● Conectado</p>
        <div className="flex justify-between items-start mt-1">
          <div>
            <h1 className="text-white text-2xl font-bold">{usuario.nombre}</h1>
            <p className="text-green-200 text-sm">Panel de Comprador</p>
          </div>
          <button onClick={logout} className="text-green-200 text-xs border border-green-400 rounded-lg px-2 py-1">
            Salir
          </button>
        </div>
      </div>

      {notificaciones > 0 && (
        <button
          onClick={() => setTab('buzon')}
          className="mx-4 mt-3 w-[calc(100%-2rem)] bg-dorado-claro border border-dorado rounded-xl p-3 flex items-center gap-3"
        >
          <span className="text-2xl">🔔</span>
          <div className="text-left flex-1">
            <p className="font-bold text-amber-800 text-sm">¡Tienes {notificaciones} mensajes nuevos!</p>
            <p className="text-amber-700 text-xs">Toca aquí para ver tu buzón</p>
          </div>
          <span className="bg-dorado text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {notificaciones}
          </span>
        </button>
      )}

      <button
        onClick={() => setTab('tienda')}
        className="mx-4 mt-3 w-[calc(100%-2rem)] bg-verde-osc text-white rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2"
      >
        🛒 Explorar Productos
      </button>

      <div className="grid grid-cols-2 gap-3 mx-4 mt-3">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-3xl font-bold text-verde-osc">
            {misPedidos.filter(p => ['Pendiente','Aceptado'].includes(p.estado)).length}
          </p>
          <p className="text-gray-500 text-xs mt-1">Pedidos Activos</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-3xl font-bold text-dorado">★ {usuario.calificacion || '5.0'}</p>
          <p className="text-gray-500 text-xs mt-1">Mi Calificación</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider px-4 mt-4 mb-2">
        Mis Pedidos Recientes
      </p>

      {cargando ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : misPedidos.slice(0, 3).map(pedido => (
        <div key={pedido.id_pedido} className="mx-4 mb-2 bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-gray-800">{pedido.producto_nombre}</p>
              <p className="text-gray-500 text-sm">{pedido.cantidad} lb • {pedido.productor_nombre}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-verde">
                Q{(pedido.cantidad * parseFloat(pedido.precio_unitario)).toFixed(2)}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                ${pedido.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700' :
                  pedido.estado === 'Aceptado'  ? 'bg-verde-claro text-verde' :
                  pedido.estado === 'Finalizado'? 'bg-blue-50 text-blue-600' :
                  'bg-gray-100 text-gray-500'}`}>
                {pedido.estado}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-crema relative">
      {tab === 'inicio'    && <PantallaInicio />}
      {tab === 'tienda'    && <Tienda />}
      {tab === 'entregas'  && <MisPedidos />}
      {tab === 'buzon'     && <Buzon onLeer={() => setNotificaciones(0)} />}
      {tab === 'historial' && <HistorialComp />}

      <BottomNav activo={tab} onChange={setTab} notificaciones={notificaciones} />
    </div>
  );
}