import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import BottomNav from '../../components/BottomNav';

// Importamos las sub-pantallas del agricultor
import MisProductos       from './MisProductos';
import PublicarProducto   from './PublicarProducto';
import PedidosRecibidos   from './PedidosRecibidos';
import Historial          from './Historial';
import Buzon              from '../Buzon';

export default function DashboardAgricultor() {
  const { usuario, logout } = useAuth();
  const [tab, setTab]                     = useState('inicio');
  const [misProductos, setMisProductos]   = useState([]);
  const [notificaciones, setNotificaciones] = useState(0);
  const [cargando, setCargando]           = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [productos, noLeidas] = await Promise.all([
        api.getMisProductos(),
        api.getNotificaciones()
      ]);
      setMisProductos(productos);
      // Contar solo las no leídas para la burbuja del buzón
      setNotificaciones(noLeidas.filter(n => !n.leida).length);
    } catch (err) {
      console.error('Error al cargar datos:', err.message);
    } finally {
      setCargando(false);
    }
  };

  // Pantalla de inicio del agricultor
  const PantallaInicio = () => (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-verde px-4 pt-8 pb-4">
        <p className="text-green-200 text-xs">● Conectado</p>
        <div className="flex justify-between items-start mt-1">
          <div>
            <h1 className="text-white text-2xl font-bold">La Esperanza</h1>
            <p className="text-green-200 text-sm">Panel de Agricultor</p>
          </div>
          <button onClick={logout} className="text-green-200 text-xs border border-green-400 rounded-lg px-2 py-1">
            Salir
          </button>
        </div>
      </div>

      {/* Banner de notificaciones */}
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

      {/* Botón publicar nuevo producto */}
      <button
        onClick={() => setTab('publicar')}
        className="mx-4 mt-3 w-[calc(100%-2rem)] bg-verde-osc text-white rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2"
      >
        <span className="text-xl">⊕</span> Publicar Nuevo Producto
      </button>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-3">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-3xl font-bold text-verde-osc">
            {misProductos.filter(p => p.estado === 'Disponible').length}
          </p>
          <p className="text-gray-500 text-xs mt-1">Ofertas Activas</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-3xl font-bold text-dorado">★ {usuario.calificacion || '5.0'}</p>
          <p className="text-gray-500 text-xs mt-1">Calificación</p>
        </div>
      </div>

      {/* Lista de mis productos */}
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider px-4 mt-4 mb-2">
        Mis Ofertas
      </p>

      {cargando ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : misProductos.length === 0 ? (
        <div className="mx-4 bg-white rounded-xl p-6 text-center border border-gray-100">
          <p className="text-gray-400">Aún no tienes productos publicados</p>
          <button onClick={() => setTab('publicar')} className="text-verde text-sm font-bold mt-2">
            Publicar ahora →
          </button>
        </div>
      ) : (
        misProductos.map(producto => (
          <div key={producto.id_producto} className="mx-4 mb-2 bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800">{producto.nombre}</p>
                <p className="text-gray-500 text-sm">
                  {producto.cantidad_disponible} lb • {producto.punto_entrega || 'Sin punto de entrega'}
                </p>
                <span className="text-xs text-gray-400">{producto.categoria}</span>
              </div>
              <p className="text-verde-osc font-bold">Q{parseFloat(producto.precio).toFixed(2)}</p>
            </div>
            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full
              ${producto.estado === 'Disponible' ? 'bg-verde-claro text-verde' : 'bg-blue-50 text-blue-600'}`}>
              ● {producto.estado}
            </span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-crema relative">
      {/* Renderiza la sub-pantalla según el tab activo */}
      {tab === 'inicio'    && <PantallaInicio />}
      {tab === 'publicar'  && <PublicarProducto onVolver={() => { setTab('inicio'); cargarDatos(); }} />}
      {tab === 'tienda'    && <MisProductos />}
      {tab === 'entregas'  && <PedidosRecibidos />}
      {tab === 'buzon'     && <Buzon onLeer={() => setNotificaciones(0)} />}
      {tab === 'historial' && <Historial />}

      <BottomNav
        activo={tab === 'publicar' ? 'inicio' : tab}
        onChange={setTab}
        notificaciones={notificaciones}
      />
    </div>
  );
}