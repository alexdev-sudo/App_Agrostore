import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import BottomNav        from '../../components/BottomNav';
import MisProductos     from './MisProductos';
import PublicarProducto from './PublicarProducto';
import PedidosRecibidos from './PedidosRecibidos';
import Historial        from './Historial';
import Buzon            from '../Buzon';

// ─────────────────────────────────────────────────────────────────────────────
// PantallaInicio declarada FUERA de DashboardAgricultor.
//
// Recibe todo lo que necesita mediante props:
//   - misProductos: array con los productos del agricultor
//   - notificaciones: número de notificaciones no leídas
//   - usuario: objeto con nombre y calificación
//   - cargando: boolean para mostrar el spinner
//   - onPublicar: función que se llama al tocar "Publicar Nuevo Producto"
//   - onVerBuzon: función que lleva al tab de buzón
//   - onVerTodas: función que lleva al tab de tienda (mis productos)
//   - onLogout: función para cerrar sesión
// ─────────────────────────────────────────────────────────────────────────────
function PantallaInicio({
  misProductos,
  notificaciones,
  usuario,
  cargando,
  onPublicar,
  onVerBuzon,
  onVerTodas,
  onLogout
}) {
  return (
    <div className="pb-20">
      {/* ── Header ── */}
      <div className="bg-verde px-4 pt-10 pb-5">
        <p className="text-green-200 text-xs mb-1">● Conectado</p>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-2xl font-bold">Agrostore</h1>
            <p className="text-green-200 text-sm">
              Panel de Agricultor — {usuario.nombre}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-green-200 text-xs border border-green-400 rounded-lg px-2 py-1 mt-1"
          >
            Salir
          </button>
        </div>
      </div>

      {/* ── Banner de notificaciones (solo si hay mensajes nuevos) ── */}
      {notificaciones > 0 && (
        <button
          onClick={onVerBuzon}
          className="mx-4 mt-3 w-[calc(100%-2rem)] bg-dorado-claro border border-dorado
                     rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <span className="text-2xl flex-shrink-0">🔔</span>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">
              ¡Tienes {notificaciones}{' '}
              {notificaciones === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}!
            </p>
            <p className="text-amber-700 text-xs">Toca aquí para ver tu buzón</p>
          </div>
          <span className="bg-dorado text-white text-xs font-bold w-6 h-6 rounded-full
                           flex items-center justify-center flex-shrink-0">
            {notificaciones > 9 ? '9+' : notificaciones}
          </span>
        </button>
      )}

      {/* ── Botón principal: Publicar nuevo producto ── */}
      <button
        onClick={onPublicar}
        className="mx-4 mt-3 w-[calc(100%-2rem)] bg-verde-osc text-white rounded-xl
                   py-4 font-bold text-base flex items-center justify-center gap-2 shadow-sm"
      >
        <span className="text-xl">⊕</span> Publicar Nuevo Producto
      </button>

      {/* ── Tarjetas de estadísticas ── */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-3">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-verde-osc">
            {misProductos.filter(p => p.estado === 'Disponible').length}
          </p>
          <p className="text-gray-500 text-xs mt-1">Ofertas Activas</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-dorado">
            ★ {parseFloat(usuario.calificacion || 5).toFixed(1)}
          </p>
          <p className="text-gray-500 text-xs mt-1">Calificación</p>
        </div>
      </div>

      {/* ── Lista de mis ofertas ── */}
      <div className="flex justify-between items-center px-4 mt-4 mb-2">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          Mis Ofertas
        </p>
        <button onClick={onVerTodas} className="text-verde text-xs font-bold">
          Ver todas →
        </button>
      </div>

      {cargando ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : misProductos.length === 0 ? (
        <div className="mx-4 bg-white rounded-xl p-6 text-center border border-gray-100">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-gray-500 text-sm">Aún no tienes productos publicados</p>
          <button onClick={onPublicar} className="text-verde text-sm font-bold mt-2">
            Publicar mi primer producto →
          </button>
        </div>
      ) : (
        // Mostramos solo los primeros 3 para no saturar la pantalla de inicio
        misProductos.slice(0, 3).map(producto => (
          <div
            key={producto.id_producto}
            className="mx-4 mb-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800">{producto.nombre}</p>
                <p className="text-gray-500 text-sm">
                  {producto.cantidad_disponible} lb •{' '}
                  {producto.punto_entrega || 'Sin punto de entrega'}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{producto.categoria}</p>
              </div>
              <p className="text-verde-osc font-bold">
                Q{parseFloat(producto.precio).toFixed(2)}
              </p>
            </div>
            <span
              className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full
                ${producto.estado === 'Disponible'
                  ? 'bg-verde-claro text-verde'
                  : producto.estado === 'Reservado'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 text-gray-500'}`}
            >
              ● {producto.estado}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardAgricultor — Componente principal del panel del agricultor.
// Se encarga de:
//   1. Cargar los datos de la API al montar
//   2. Gestionar qué tab está activo
//   3. Pasar los datos a PantallaInicio mediante props
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardAgricultor() {
  const { usuario, logout }                   = useAuth();
  const [tab,            setTab]              = useState('inicio');
  const [misProductos,   setMisProductos]     = useState([]);
  const [notificaciones, setNotificaciones]   = useState(0);
  const [cargando,       setCargando]         = useState(true);

  // useCallback memoriza la función cargar para que no cambie de referencia
  // en cada render. Esto evita que useEffect se dispare infinitamente
  // si incluyéramos "cargar" en el array de dependencias.
  const cargar = useCallback(async () => {
    try {
      // Promise.all ejecuta ambas peticiones en paralelo (más rápido que
      // hacerlas una por una). Espera a que ambas terminen antes de continuar.
      const [productos, notifs] = await Promise.all([
        api.getMisProductos(),
        api.getNotificaciones()
      ]);
      setMisProductos(productos);
      // Filtramos solo las no leídas para mostrar el número en la burbuja del buzón
      setNotificaciones(notifs.filter(n => !n.leida).length);
    } catch (err) {
      console.error('Error al cargar datos del agricultor:', err.message);
    } finally {
      // finally se ejecuta siempre, haya error o no.
      // Garantiza que el spinner desaparezca aunque falle la API.
      setCargando(false);
    }
  }, []); // Array vacío: cargar no depende de ninguna variable del componente

  // useEffect llama a cargar cuando el componente se monta por primera vez.
  // Como cargar está declarada ANTES que useEffect, no hay error de acceso
  // antes de declaración.
  useEffect(() => {
    let activo = true;

    (async () => {
      await cargar();
      if (!activo) return;
    })();

    return () => {
      activo = false;
    };
  }, [cargar]);

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-crema relative">

      {/* ── Pantalla de Inicio ── */}
      {tab === 'inicio' && (
        // Pasamos todos los datos y callbacks que PantallaInicio necesita
        <PantallaInicio
          misProductos={misProductos}
          notificaciones={notificaciones}
          usuario={usuario}
          cargando={cargando}
          onPublicar={() => setTab('publicar')}
          onVerBuzon={() => setTab('buzon')}
          onVerTodas={() => setTab('tienda')}
          onLogout={logout}
        />
      )}

      {/* ── Pantalla Publicar Producto ── */}
      {tab === 'publicar' && (
        <PublicarProducto
          onVolver={() => {
            setTab('inicio');
            cargar(); // Recargamos datos para mostrar el nuevo producto en el listado
          }}
        />
      )}

      {/* ── Pantalla Mis Productos (tab Tienda) ── */}
      {tab === 'tienda' && <MisProductos />}

      {/* ── Pantalla Pedidos Recibidos (tab Entregas) ── */}
      {tab === 'entregas' && <PedidosRecibidos />}

      {/* ── Pantalla Buzón ── */}
      {tab === 'buzon' && (
        <Buzon onLeer={() => setNotificaciones(0)} />
      )}

      {/* ── Pantalla Historial ── */}
      {tab === 'historial' && <Historial />}

      {/* ── Barra de navegación inferior ── */}
      {/* Cuando el tab es 'publicar', mantenemos 'inicio' resaltado en la nav */}
      <BottomNav
        activo={tab === 'publicar' ? 'inicio' : tab}
        onChange={setTab}
        notificaciones={notificaciones}
      />
    </div>
  );
}
