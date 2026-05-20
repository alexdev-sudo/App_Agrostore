import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function PublicarProducto({ onVolver }) {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    cantidad_disponible: '',
    precio: '',
    categoria: '',
    punto_entrega: ''
  });
  const [error,    setError]    = useState('');
  const [exito,    setExito]    = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Cargar las categorías disponibles desde la API
    api.getCategorias().then(setCategorias).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.crearProducto({
        ...form,
        cantidad_disponible: parseInt(form.cantidad_disponible),
        precio: parseFloat(form.precio)
      });
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Pantalla de éxito (igual al Figma: ícono verde + mensaje)
  if (exito) {
    return (
      <div className="min-h-screen bg-crema flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-verde-claro rounded-full flex items-center justify-center mb-6 text-5xl">
          ✓
        </div>
        <h2 className="text-verde text-2xl font-bold text-center">¡Producto Publicado!</h2>
        <p className="text-gray-500 text-center mt-2">
          Tu oferta ya está visible para los compradores
        </p>
        <button
          onClick={onVolver}
          className="mt-8 bg-verde text-white rounded-xl py-3 px-8 font-bold"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-verde px-4 pt-8 pb-4 flex items-center gap-3">
        <button onClick={onVolver} className="text-white text-xl">←</button>
        <div>
          <h1 className="text-white text-xl font-bold">Publicar Producto</h1>
          <p className="text-green-200 text-sm">● Conectado</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="text-gray-500 text-sm mb-1 block">¿Qué vas a vender?</label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => setForm({...form, nombre: e.target.value})}
            placeholder="Ej: Tomates Frescos"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-verde"
            required
          />
        </div>

        <div>
          <label className="text-gray-500 text-sm mb-1 block">Categoría</label>
          <select
            value={form.categoria}
            onChange={e => setForm({...form, categoria: e.target.value})}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-verde"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-500 text-sm mb-1 block">¿Cuántas libras?</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({...form, cantidad_disponible: Math.max(0, (parseInt(form.cantidad_disponible)||0) - 10)})}
              className="w-12 h-12 bg-gray-100 rounded-xl font-bold text-xl"
            >−</button>
            <input
              type="number"
              value={form.cantidad_disponible}
              onChange={e => setForm({...form, cantidad_disponible: e.target.value})}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-center bg-white focus:outline-none focus:border-verde"
              min="1"
              required
            />
            <button
              type="button"
              onClick={() => setForm({...form, cantidad_disponible: (parseInt(form.cantidad_disponible)||0) + 10})}
              className="w-12 h-12 bg-gray-100 rounded-xl font-bold text-xl"
            >+</button>
          </div>
          <p className="text-gray-400 text-xs mt-1">Presiona + o − para ajustar de 10 en 10 lb</p>
        </div>

        <div>
          <label className="text-gray-500 text-sm mb-1 block">Precio por libra (en Quetzales)</label>
          <input
            type="number"
            value={form.precio}
            onChange={e => setForm({...form, precio: e.target.value})}
            placeholder="5.00"
            step="0.50"
            min="0.01"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-verde"
            required
          />
          <p className="text-amber-600 text-xs mt-1">Una vez publicado, el precio no se puede cambiar</p>
        </div>

        <div>
          <label className="text-gray-500 text-sm mb-1 block">¿Dónde entregarás el producto?</label>
          <input
            type="text"
            value={form.punto_entrega}
            onChange={e => setForm({...form, punto_entrega: e.target.value})}
            placeholder="Ej: Mercado Cantonal La Virgen María"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-verde"
          />
        </div>

        <div>
          <label className="text-gray-500 text-sm mb-1 block">Descripción adicional (opcional)</label>
          <textarea
            value={form.descripcion}
            onChange={e => setForm({...form, descripcion: e.target.value})}
            placeholder="Ej: Tomates maduros de temporada, cultivados sin químicos"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-verde resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="bg-verde text-white rounded-xl py-4 font-bold text-base disabled:opacity-60"
        >
          {cargando ? 'Publicando...' : 'Publicar Oferta'}
        </button>

        <button
          type="button"
          onClick={onVolver}
          className="border border-gray-300 text-gray-500 rounded-xl py-3 font-bold"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}