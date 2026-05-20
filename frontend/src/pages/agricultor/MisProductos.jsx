import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function MisProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [mensaje,   setMensaje]   = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await api.getMisProductos();
      setProductos(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrar = async (id) => {
    if (!confirm('¿Cerrar esta publicación?')) return;
    try {
      await api.cerrarProducto(id);
      setMensaje('Publicación cerrada');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.eliminarProducto(id);
      setMensaje('Producto eliminado');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Mis Productos</h1>
        <p className="text-green-200 text-sm">Gestiona tus publicaciones</p>
      </div>

      {mensaje && (
        <div className="mx-4 mt-3 bg-green-50 border border-verde rounded-xl p-3 text-sm text-verde">
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p className="text-center text-gray-400 py-12">Cargando...</p>
      ) : productos.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No tienes productos publicados</p>
      ) : (
        productos.map(p => (
          <div key={p.id_producto} className="mx-4 mt-3 bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="font-bold text-gray-800">{p.nombre}</p>
                <p className="text-xs text-gray-400">{p.categoria}</p>
                <p className="text-sm text-gray-500 mt-1">{p.cantidad_disponible} lb disponibles</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-verde">Q{parseFloat(p.precio).toFixed(2)}/lb</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                  ${p.estado === 'Disponible' ? 'bg-verde-claro text-verde' : 'bg-gray-100 text-gray-500'}`}>
                  {p.estado}
                </span>
              </div>
            </div>

            {p.estado === 'Disponible' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => cerrar(p.id_producto)}
                  className="flex-1 border border-amber-300 text-amber-600 rounded-xl py-2 text-sm font-bold"
                >
                  Cerrar publicación
                </button>
                <button
                  onClick={() => eliminar(p.id_producto)}
                  className="flex-1 border border-red-300 text-red-500 rounded-xl py-2 text-sm font-bold"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}