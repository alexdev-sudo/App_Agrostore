import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function DashboardAdmin() {
  const { logout } = useAuth();
  const [tab,      setTab]      = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos,  setPedidos]  = useState([]);
  const [incumplimientos, setIncumplimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, [tab]);

  const cargar = async () => {
    setCargando(true);
    try {
      if (tab === 'usuarios') {
        const data = await api.getUsuarios();
        setUsuarios(data);
      } else if (tab === 'pedidos') {
        const data = await api.getPedidosAdmin({});
        setPedidos(data);
      } else if (tab === 'incumplimientos') {
        const data = await api.getIncumplimientos();
        setIncumplimientos(data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-verde px-4 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-xl font-bold">Panel Administrativo</h1>
            <p className="text-green-200 text-sm">AgroStore — La Esperanza</p>
          </div>
          <button onClick={logout} className="text-green-200 text-xs border border-green-400 rounded-lg px-2 py-1">
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { id:'usuarios', label:'Usuarios' },
          { id:'pedidos',  label:'Pedidos' },
          { id:'incumplimientos', label:'Reportes' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors
              ${tab === t.id ? 'border-verde text-verde' : 'border-transparent text-gray-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="p-4 pb-8">
        {cargando ? (
          <p className="text-center text-gray-400 py-12">Cargando...</p>
        ) : tab === 'usuarios' ? (
          usuarios.map(u => (
            <div key={u.id_usuario} className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{u.nombre}</p>
                  <p className="text-gray-500 text-sm">{u.telefono} • {u.tipo}</p>
                  <p className="text-gray-400 text-xs">{u.ubicacion}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full
                  ${u.activo ? 'bg-verde-claro text-verde' : 'bg-red-50 text-red-500'}`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))
        ) : tab === 'pedidos' ? (
          pedidos.map(p => (
            <div key={p.id_pedido} className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">#{p.id_pedido} — {p.producto_nombre}</p>
                  <p className="text-gray-500 text-sm">{p.comprador_nombre} → {p.productor_nombre}</p>
                  <p className="text-gray-400 text-xs">{p.cantidad} lb • {p.fecha}</p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                  {p.estado}
                </span>
              </div>
            </div>
          ))
        ) : (
          incumplimientos.map(i => (
            <div key={i.id_incumplimiento} className="bg-white rounded-xl p-4 mb-2 border border-red-100">
              <p className="font-bold text-red-700 text-sm">Pedido #{i.id_pedido}</p>
              <p className="text-gray-700 text-sm mt-1">{i.descripcion}</p>
              <p className="text-gray-400 text-xs mt-1">
                Reportado por: {i.reportado_por} ({i.tipo_reportador}) — {i.fecha}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                ${i.validado ? 'bg-verde-claro text-verde' : 'bg-amber-50 text-amber-700'}`}>
                {i.validado ? 'Validado' : 'Pendiente de revisión'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}