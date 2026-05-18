import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Vista inicial del Figma: selección de rol → formulario de login
export default function Login() {
  const { login } = useAuth();

  // 'seleccion' | 'login-agricultor' | 'login-comprador' | 'registro-agricultor' | 'registro-comprador'
  const [vista, setVista] = useState('seleccion');

  // Campos del formulario de login
  const [telefono,  setTelefono]  = useState('');
  const [contrasena, setContrasena] = useState('');

  // Campos del formulario de registro
  const [nombre,    setNombre]    = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);

  // Determina el tipo (Productor o Comprador) según la vista activa
  const tipo = vista.includes('agricultor') ? 'Productor' : 'Comprador';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await api.login({ telefono, contrasena });
      login(data.usuario, data.token);
      // App.jsx detecta el cambio y redirige al dashboard correcto
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.registro({ nombre, telefono, contrasena, tipo, ubicacion });
      // Después de registrarse, ir al login
      setVista(`login-${tipo === 'Productor' ? 'agricultor' : 'comprador'}`);
      setNombre('');
      setError('¡Cuenta creada! Ahora inicia sesión.');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // ── Pantalla de selección de rol ─────────────────────────────────
  if (vista === 'seleccion') {
    return (
      <div className="min-h-screen bg-verde flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            🌱
          </div>
          <h1 className="text-white text-4xl font-bold">AgroStore</h1>
          <p className="text-green-200 text-sm mt-1">Conectando el campo con la ciudad</p>
        </div>

        {/* Tarjetas de selección de rol */}
        <p className="text-green-100 text-sm mb-6">¿Cómo quieres entrar?</p>

        <button
          onClick={() => setVista('login-agricultor')}
          className="w-full max-w-xs bg-white rounded-2xl p-5 mb-4 flex items-center gap-4 shadow-lg hover:bg-green-50 transition-colors"
        >
          <span className="text-3xl">👨‍🌾</span>
          <div className="text-left">
            <p className="font-bold text-verde text-lg">Soy Agricultor</p>
            <p className="text-gray-500 text-sm">Quiero vender mis productos</p>
          </div>
          <span className="ml-auto text-gray-400">›</span>
        </button>

        <button
          onClick={() => setVista('login-comprador')}
          className="w-full max-w-xs bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:bg-green-50 transition-colors"
        >
          <span className="text-3xl">🛒</span>
          <div className="text-left">
            <p className="font-bold text-dorado text-lg">Soy Comprador</p>
            <p className="text-gray-500 text-sm">Quiero comprar productos frescos</p>
          </div>
          <span className="ml-auto text-gray-400">›</span>
        </button>
      </div>
    );
  }

  // ── Formulario de Login ────────────────────────────────────────────
  if (vista.startsWith('login')) {
    const esAgricultor = tipo === 'Productor';
    return (
      <div className="min-h-screen bg-crema flex flex-col">
        {/* Header verde */}
        <div className="bg-verde p-6 pt-10 text-center">
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
            {esAgricultor ? '👨‍🌾' : '🛒'}
          </div>
          <h2 className="text-white text-2xl font-bold">
            {esAgricultor ? 'Entrada Agricultor' : 'Entrada Comprador'}
          </h2>
          <p className="text-green-200 text-sm mt-1">Ingresa tus datos para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4 max-w-sm mx-auto w-full">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-gray-500 text-xs mb-1 block">📞 Número de teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="5555-1234"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-verde bg-white"
              required
            />
          </div>

          <div>
            <label className="text-gray-500 text-xs mb-1 block">🔒 Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-verde bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="bg-verde text-white rounded-xl py-3 font-bold text-base mt-2 disabled:opacity-60"
          >
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={() => setVista('seleccion')}
            className="border border-verde text-verde rounded-xl py-3 font-bold text-base"
          >
            Volver
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setVista(`registro-${esAgricultor ? 'agricultor' : 'comprador'}`)}
              className="text-verde font-bold"
            >
              Regístrate aquí
            </button>
          </p>
        </form>
      </div>
    );
  }

  // ── Formulario de Registro ─────────────────────────────────────────
  const esAgricultor = tipo === 'Productor';
  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <div className="bg-verde p-6 pt-10 text-center">
        <h2 className="text-white text-2xl font-bold">
          {esAgricultor ? 'Registro Agricultor' : 'Registro Comprador'}
        </h2>
        <p className="text-green-200 text-sm mt-1">Completa tus datos</p>
      </div>

      <form onSubmit={handleRegistro} className="p-6 flex flex-col gap-4 max-w-sm mx-auto w-full">
        {error && (
          <div className={`rounded-xl p-3 text-sm border ${error.includes('creada') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        <div>
          <label className="text-gray-500 text-xs mb-1 block">
            {esAgricultor ? '👤 Nombre completo' : '🏪 Nombre o negocio'}
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder={esAgricultor ? 'Juan Pérez' : 'Restaurante El Buen Sabor'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-verde bg-white"
            required
          />
        </div>

        <div>
          <label className="text-gray-500 text-xs mb-1 block">📞 Número de teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="5555-1234"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-verde bg-white"
            required
          />
        </div>

        <div>
          <label className="text-gray-500 text-xs mb-1 block">📍 Ubicación (municipio)</label>
          <input
            type="text"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            placeholder="Aldea San José, Chimaltenango"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-verde bg-white"
          />
        </div>

        <div>
          <label className="text-gray-500 text-xs mb-1 block">🔒 Contraseña (mínimo 6 caracteres)</label>
          <input
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-verde bg-white"
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="bg-verde text-white rounded-xl py-3 font-bold text-base mt-2 disabled:opacity-60"
        >
          {cargando ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
        </button>

        <button
          type="button"
          onClick={() => setVista(`login-${esAgricultor ? 'agricultor' : 'comprador'}`)}
          className="border border-verde text-verde rounded-xl py-3 font-bold text-base"
        >
          Volver
        </button>
      </form>
    </div>
  );
}