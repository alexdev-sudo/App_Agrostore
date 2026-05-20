import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTES — Declarados FUERA de DashboardAdmin.
//
// Cada uno recibe exactamente los datos que necesita mediante props.
// Esto sigue la regla de React: los componentes deben declararse
// fuera de otros componentes para no recrearse en cada render.
// ═══════════════════════════════════════════════════════════════════════════

// ── PantallaResumen ─────────────────────────────────────────────────────────
// Muestra un resumen general del sistema: totales de usuarios,
// pedidos activos, ingresos y un gráfico de barras por categoría.
function PantallaResumen({ usuarios, pedidos, incumplimientos, reporteVentas, reporteCats }) {
  const totalProductores  = usuarios.filter(u => u.tipo === 'Productor').length;
  const totalCompradores  = usuarios.filter(u => u.tipo === 'Comprador').length;
  const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
  const pedidosFinalizados= pedidos.filter(p => p.estado === 'Finalizado').length;
  const incPendientes     = incumplimientos.filter(i => !i.validado).length;
  const totalIngresos     = reporteVentas.reduce(
    (sum, r) => sum + parseFloat(r.total_ingresos || 0), 0
  );

  return (
    <div className="p-4">
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">
        Vista General del Sistema
      </p>

      {/* Tarjetas numéricas con los indicadores clave */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Agricultores',    valor: totalProductores,  icono: '👨‍🌾', color: 'bg-verde-claro text-verde-osc' },
          { label: 'Compradores',     valor: totalCompradores,  icono: '🛒',  color: 'bg-blue-50 text-blue-700'    },
          { label: 'Pedidos Activos', valor: pedidosPendientes, icono: '📦',  color: 'bg-amber-50 text-amber-700'  },
          { label: 'Incumplimientos', valor: incPendientes,     icono: '⚠️',  color: 'bg-red-50 text-red-600'      },
        ].map(({ label, valor, icono, color }) => (
          <div key={label} className={`${color} rounded-xl p-4 text-center`}>
            <p className="text-2xl">{icono}</p>
            <p className="text-2xl font-bold mt-1">{valor}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Total de ingresos de toda la comunidad */}
      <div className="bg-verde-osc rounded-xl p-4 mb-4 flex justify-between items-center">
        <div>
          <p className="text-green-200 text-xs">Ingresos Totales Comunidad</p>
          <p className="text-white text-2xl font-bold">Q{totalIngresos.toFixed(2)}</p>
          <p className="text-green-300 text-xs mt-0.5">
            {pedidosFinalizados} ventas completadas
          </p>
        </div>
        <span className="text-4xl">💰</span>
      </div>

      {/* Top 3 productores por ingresos */}
      {reporteVentas.length > 0 && (
        <>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            Top Productores
          </p>
          {reporteVentas.slice(0, 3).map((r, i) => (
            <div
              key={r.productor}
              className="bg-white rounded-xl p-3 mb-2 border border-gray-100 flex items-center gap-3"
            >
              <span className="text-lg">{['🥇', '🥈', '🥉'][i] || '🏅'}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{r.productor}</p>
                <p className="text-gray-400 text-xs">
                  {r.total_ventas} ventas • {r.total_libras} lb
                </p>
              </div>
              <p className="font-bold text-verde text-sm">
                Q{parseFloat(r.total_ingresos).toFixed(2)}
              </p>
            </div>
          ))}
        </>
      )}

      {/* Ventas por categoría con barra de progreso visual */}
      {reporteCats.length > 0 && (
        <>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2">
            Por Categoría
          </p>
          {reporteCats.map(cat => {
            const iconoCat = {
              'Hortalizas': '🥬', 'Granos Basicos': '🌽',
              'Frutas': '🍊', 'Hierbas': '🌿', 'Otros': '📦'
            };
            // Calculamos el porcentaje respecto al máximo para dibujar la barra
            const maxIngresos = Math.max(
              ...reporteCats.map(c => parseFloat(c.total_ingresos || 0))
            );
            const porcentaje = maxIngresos > 0
              ? (parseFloat(cat.total_ingresos || 0) / maxIngresos) * 100
              : 0;

            return (
              <div
                key={cat.categoria}
                className="bg-white rounded-xl p-3 mb-2 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span>{iconoCat[cat.categoria] || '📦'}</span>
                    <span className="text-sm font-bold text-gray-800">{cat.categoria}</span>
                  </div>
                  <span className="text-sm font-bold text-verde">
                    Q{parseFloat(cat.total_ingresos || 0).toFixed(2)}
                  </span>
                </div>
                {/* Barra de progreso proporcional al máximo */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-verde rounded-full transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {cat.total_pedidos} pedidos • {cat.total_libras} lb
                </p>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── PantallaUsuarios ─────────────────────────────────────────────────────────
// Lista todos los usuarios con filtro por tipo y botones de activar/desactivar.
function PantallaUsuarios({ usuarios, onDesactivar, onActivar }) {
  // Este estado es local a PantallaUsuarios, no al Dashboard principal.
  // Al estar el componente declarado FUERA del Dashboard, este estado
  // persiste correctamente entre renders del Dashboard padre.
  const [filtroTipo, setFiltroTipo] = useState('');

  const filtrados = filtroTipo
    ? usuarios.filter(u => u.tipo === filtroTipo)
    : usuarios;

  return (
    <div className="p-4">
      {/* Filtros por tipo de usuario */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['', 'Productor', 'Comprador', 'Administrador'].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border
              ${filtroTipo === tipo
                ? 'bg-verde text-white border-verde'
                : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {tipo || 'Todos'}{' '}
            {tipo
              ? `(${usuarios.filter(u => u.tipo === tipo).length})`
              : `(${usuarios.length})`}
          </button>
        ))}
      </div>

      {/* Lista de usuarios filtrada */}
      {filtrados.map(u => (
        <div
          key={u.id_usuario}
          className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {u.tipo === 'Productor'
                    ? '👨‍🌾'
                    : u.tipo === 'Comprador'
                    ? '🛒'
                    : '⚙️'}
                </span>
                <p className="font-bold text-gray-800">{u.nombre}</p>
              </div>
              <p className="text-gray-500 text-sm ml-7">📞 {u.telefono}</p>
              {u.ubicacion && (
                <p className="text-gray-400 text-xs ml-7">📍 {u.ubicacion}</p>
              )}
              <p className="text-gray-400 text-xs ml-7 mt-0.5">
                ⭐ {u.calificacion} • Desde{' '}
                {new Date(u.creado_en).toLocaleDateString('es-GT')}
              </p>
            </div>

            <div className="text-right ml-2 flex flex-col items-end gap-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full
                ${u.activo
                  ? 'bg-verde-claro text-verde'
                  : 'bg-red-50 text-red-500'}`}
              >
                {u.activo ? 'Activo' : 'Inactivo'}
              </span>
              {/* No mostramos botón para el Administrador (no se puede desactivar) */}
              {u.tipo !== 'Administrador' && (
                u.activo ? (
                  <button
                    onClick={() => onDesactivar(u.id_usuario, u.nombre)}
                    className="text-xs text-red-500 border border-red-200 rounded-lg px-2 py-1"
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => onActivar(u.id_usuario, u.nombre)}
                    className="text-xs text-verde border border-verde rounded-lg px-2 py-1"
                  >
                    Activar
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PantallaPedidos ──────────────────────────────────────────────────────────
// Muestra todos los pedidos del sistema con filtro por estado.
function PantallaPedidos({ pedidos, filtroPedido, onCambiarFiltro }) {
  const colorEstado = {
    Pendiente:  'bg-amber-50 text-amber-700',
    Aceptado:   'bg-green-50 text-green-700',
    Rechazado:  'bg-red-50 text-red-600',
    Cancelado:  'bg-gray-100 text-gray-500',
    Finalizado: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="p-4">
      {/* Filtros por estado del pedido */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['', 'Pendiente', 'Aceptado', 'Finalizado', 'Cancelado', 'Rechazado'].map(estado => (
          <button
            key={estado}
            onClick={() => onCambiarFiltro(estado)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border
              ${filtroPedido === estado
                ? 'bg-verde text-white border-verde'
                : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {estado || 'Todos'}
          </button>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No hay pedidos con ese filtro
        </p>
      ) : (
        pedidos.map(p => (
          <div
            key={p.id_pedido}
            className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-gray-800">
                #{p.id_pedido} — {p.producto_nombre}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorEstado[p.estado]}`}>
                {p.estado}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>🛒 {p.comprador_nombre}</span>
              <span>👨‍🌾 {p.productor_nombre}</span>
              <span>📦 {p.cantidad} lb</span>
              <span>
                💰 Q{(p.cantidad * parseFloat(p.precio_unitario)).toFixed(2)}
              </span>
              <span>📅 {p.fecha}</span>
              <span>🏷️ {p.categoria}</span>
            </div>
            {p.motivo_cancelacion && (
              <p className="text-xs text-red-500 mt-2 bg-red-50 rounded-lg p-2">
                Motivo: {p.motivo_cancelacion}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── PantallaIncumplimientos ──────────────────────────────────────────────────
// Lista los incumplimientos reportados. Los pendientes primero,
// los ya validados al final en gris.
function PantallaIncumplimientos({ incumplimientos, onValidar }) {
  const pendientes = incumplimientos.filter(i => !i.validado);
  const validados  = incumplimientos.filter(i => i.validado);

  // renderIncumplimiento: función (no componente) que retorna la tarjeta
  const renderIncumplimiento = (i) => (
    <div
      key={i.id_incumplimiento}
      className={`rounded-xl p-4 mb-2 border
        ${!i.validado
          ? 'bg-white border-red-100'
          : 'bg-gray-50 border-gray-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-bold text-gray-800 text-sm">Pedido #{i.id_pedido}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
          ${i.validado
            ? 'bg-verde-claro text-verde'
            : 'bg-red-50 text-red-600'}`}
        >
          {i.validado ? '✓ Revisado' : 'Pendiente de revisión'}
        </span>
      </div>
      <p className="text-gray-700 text-sm mb-2 bg-red-50 rounded-lg p-2">
        {i.descripcion}
      </p>
      <div className="text-xs text-gray-400 flex gap-3 flex-wrap">
        <span>👤 {i.reportado_por}</span>
        <span>🏷️ {i.tipo_reportador}</span>
        <span>📅 {i.fecha}</span>
      </div>
      {!i.validado && (
        <button
          onClick={() => onValidar(i.id_incumplimiento)}
          className="w-full mt-3 bg-verde text-white rounded-xl py-2 text-sm font-bold"
        >
          ✓ Marcar como revisado
        </button>
      )}
    </div>
  );

  return (
    <div className="p-4">
      {incumplimientos.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 font-bold">Sin incumplimientos reportados</p>
          <p className="text-gray-400 text-sm mt-1">La comunidad está funcionando bien</p>
        </div>
      ) : (
        <>
          {pendientes.length > 0 && (
            <>
              <p className="text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
                Pendientes de revisión ({pendientes.length})
              </p>
              {pendientes.map(i => renderIncumplimiento(i))}
            </>
          )}
          {validados.length > 0 && (
            <>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-4 mb-2">
                Ya revisados ({validados.length})
              </p>
              {validados.map(i => renderIncumplimiento(i))}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── PantallaReportes ─────────────────────────────────────────────────────────
// Muestra los reportes de ventas: totales, por productor y por categoría.
function PantallaReportes({ reporteVentas, reporteCats }) {
  const totalIngresos = reporteVentas.reduce(
    (sum, r) => sum + parseFloat(r.total_ingresos || 0), 0
  );
  const totalLibras = reporteVentas.reduce(
    (sum, r) => sum + parseInt(r.total_libras || 0), 0
  );
  const totalVentas = reporteVentas.reduce(
    (sum, r) => sum + parseInt(r.total_ventas || 0), 0
  );

  const iconoCat = {
    'Hortalizas': '🥬', 'Granos Basicos': '🌽',
    'Frutas': '🍊', 'Hierbas': '🌿', 'Otros': '📦'
  };

  return (
    <div className="p-4">
      {/* Totales generales */}
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">
        Resumen General (Historial Completo)
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Ingresos',  valor: `Q${totalIngresos.toFixed(0)}`, color: 'bg-verde-claro text-verde-osc' },
          { label: 'Ventas',    valor: totalVentas,                     color: 'bg-blue-50 text-blue-700'     },
          { label: 'Libras',    valor: `${totalLibras}`,                color: 'bg-amber-50 text-amber-700'   },
        ].map(({ label, valor, color }) => (
          <div key={label} className={`${color} rounded-xl p-3 text-center`}>
            <p className="text-base font-bold">{valor}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Ranking de productores */}
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
        Ingresos por Agricultor
      </p>
      {reporteVentas.length === 0 ? (
        <p className="text-center text-gray-400 py-4 text-sm">Sin ventas finalizadas aún</p>
      ) : (
        reporteVentas.map((r, i) => (
          <div
            key={r.productor}
            className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{r.productor}</p>
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{r.total_ventas} ventas</span>
                  <span>{r.total_libras} lb vendidas</span>
                </div>
              </div>
              <p className="font-bold text-verde text-lg">
                Q{parseFloat(r.total_ingresos).toFixed(2)}
              </p>
            </div>
          </div>
        ))
      )}

      {/* Ventas por categoría con barra proporcional */}
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2">
        Ventas por Categoría
      </p>
      {reporteCats.length === 0 ? (
        <p className="text-center text-gray-400 py-4 text-sm">Sin datos aún</p>
      ) : (
        reporteCats.map(cat => {
          const maxIngresos = Math.max(
            ...reporteCats.map(c => parseFloat(c.total_ingresos || 0))
          );
          const porcentaje = maxIngresos > 0
            ? (parseFloat(cat.total_ingresos || 0) / maxIngresos) * 100
            : 0;

          return (
            <div
              key={cat.categoria}
              className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{iconoCat[cat.categoria] || '📦'}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{cat.categoria}</p>
                    <p className="text-gray-400 text-xs">
                      {cat.total_pedidos} pedidos • {cat.total_libras} lb
                    </p>
                  </div>
                </div>
                <p className="font-bold text-verde">
                  Q{parseFloat(cat.total_ingresos).toFixed(2)}
                </p>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-verde rounded-full transition-all duration-500"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DashboardAdmin — Componente principal del panel administrativo.
//
// Responsabilidades:
//   1. Cargar datos de la API según el tab activo
//   2. Mantener el estado de todos los datos
//   3. Pasar datos y callbacks a los sub-componentes mediante props
// ═══════════════════════════════════════════════════════════════════════════
export default function DashboardAdmin() {
  const { usuario, logout } = useAuth();
  const [tab, setTab] = useState('resumen');

  // Estado central de datos — cada sección tiene su array
  const [usuarios,        setUsuarios]        = useState([]);
  const [pedidos,         setPedidos]         = useState([]);
  const [incumplimientos, setIncumplimientos] = useState([]);
  const [reporteVentas,   setReporteVentas]   = useState([]);
  const [reporteCats,     setReporteCats]     = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [mensaje,         setMensaje]         = useState('');

  // filtroPedido vive aquí (en el padre) para que PantallaPedidos
  // pueda comunicar el cambio al padre y este recargue los datos filtrados
  const [filtroPedido, setFiltroPedido] = useState('');

  // ── cargar declarada ANTES del useEffect ────────────────────────────
  // Carga los datos necesarios según el tab activo.
  // Usa un switch con {} en cada case para evitar el error no-case-declarations.
  const cargar = useCallback(async (tabActual, filtro = '') => {
    setCargando(true);
    try {
      switch (tabActual) {
        case 'resumen': {
          // Para el resumen cargamos todo en paralelo
          const [u, p, i, rv, rc] = await Promise.all([
            api.getUsuarios(),
            api.getPedidosAdmin({}),
            api.getIncumplimientos(),
            api.reporteVentas({}),
            api.reporteCategorias()
          ]);
          setUsuarios(u);
          setPedidos(p);
          setIncumplimientos(i);
          setReporteVentas(rv);
          setReporteCats(rc);
          break;
        }
        case 'usuarios': {
          const data = await api.getUsuarios();
          setUsuarios(data);
          break;
        }
        case 'pedidos': {
          // Si hay filtro de estado, lo pasamos como parámetro de URL
          const data = await api.getPedidosAdmin(filtro ? { estado: filtro } : {});
          setPedidos(data);
          break;
        }
        case 'incumplimientos': {
          const data = await api.getIncumplimientos();
          setIncumplimientos(data);
          break;
        }
        case 'reportes': {
          const [ventas, cats] = await Promise.all([
            api.reporteVentas({}),
            api.reporteCategorias()
          ]);
          setReporteVentas(ventas);
          setReporteCats(cats);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Error al cargar datos admin:', err.message);
    } finally {
      setCargando(false);
    }
  }, []); // Sin dependencias externas: la función es estable

  // Recarga los datos cada vez que cambia el tab activo
  // (Evitamos el falso positivo del lint ejecutando la carga en una IIFE async)
  useEffect(() => {
    let activo = true;

    (async () => {
      await cargar(tab, filtroPedido);
      // Si el componente se desmontó, ignoramos actualizaciones posteriores
      if (!activo) return;
    })();

    return () => {
      activo = false;
    };
  }, [cargar, tab, filtroPedido]);

  // ── Callbacks que se pasan a los sub-componentes ─────────────────────

  const handleDesactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar la cuenta de ${nombre}?`)) return;
    try {
      await api.desactivarUsuario(id);
      setMensaje(`Cuenta de ${nombre} desactivada`);
      cargar(tab, filtroPedido);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const handleActivar = async (id, nombre) => {
    try {
      await api.activarUsuario(id);
      setMensaje(`Cuenta de ${nombre} reactivada`);
      cargar(tab, filtroPedido);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const handleValidar = async (id) => {
    try {
      await api.validarIncumplimiento(id);
      setMensaje('Incumplimiento marcado como revisado');
      cargar(tab, filtroPedido);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const handleCambiarFiltro = (nuevoFiltro) => {
    // Al cambiar el filtro, actualizamos el estado y dejamos que
    // useEffect dispare la recarga con el nuevo filtro
    setFiltroPedido(nuevoFiltro);
  };

  // Tabs de la barra de navegación del panel admin
  const TABS = [
    { id: 'resumen',         label: '📊 Resumen'    },
    { id: 'usuarios',        label: '👥 Usuarios'   },
    { id: 'pedidos',         label: '📦 Pedidos'    },
    { id: 'incumplimientos', label: '⚠️ Reportes'   },
    { id: 'reportes',        label: '💰 Ventas'     },
  ];

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-crema">
      {/* ── Header ── */}
      <div className="bg-verde px-4 pt-10 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-xl font-bold">Panel Administrativo</h1>
            <p className="text-green-200 text-sm">AgroStore — {usuario.nombre}</p>
          </div>
          <button
            onClick={logout}
            className="text-green-200 text-xs border border-green-400 rounded-lg px-2 py-1 mt-1"
          >
            Salir
          </button>
        </div>
      </div>

      {/* ── Barra de tabs ── */}
      <div className="flex bg-white border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 py-3 text-xs font-bold border-b-2 transition-colors
              ${tab === t.id
                ? 'border-verde text-verde'
                : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Mensaje de acción (éxito o error) ── */}
      {mensaje && (
        <div className="mx-4 mt-3 bg-verde-claro border border-verde rounded-xl
                        p-3 text-sm text-verde flex justify-between items-start">
          <span>{mensaje}</span>
          <button onClick={() => setMensaje('')} className="font-bold ml-2 flex-shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* ── Contenido del tab activo ── */}
      <div className="pb-8">
        {cargando ? (
          <p className="text-center text-gray-400 py-12">Cargando...</p>
        ) : (
          <>
            {tab === 'resumen' && (
              <PantallaResumen
                usuarios={usuarios}
                pedidos={pedidos}
                incumplimientos={incumplimientos}
                reporteVentas={reporteVentas}
                reporteCats={reporteCats}
              />
            )}
            {tab === 'usuarios' && (
              <PantallaUsuarios
                usuarios={usuarios}
                onDesactivar={handleDesactivar}
                onActivar={handleActivar}
              />
            )}
            {tab === 'pedidos' && (
              <PantallaPedidos
                pedidos={pedidos}
                filtroPedido={filtroPedido}
                onCambiarFiltro={handleCambiarFiltro}
              />
            )}
            {tab === 'incumplimientos' && (
              <PantallaIncumplimientos
                incumplimientos={incumplimientos}
                onValidar={handleValidar}
              />
            )}
            {tab === 'reportes' && (
              <PantallaReportes
                reporteVentas={reporteVentas}
                reporteCats={reporteCats}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}