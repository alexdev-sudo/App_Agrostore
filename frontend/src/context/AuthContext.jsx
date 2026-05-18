// AuthContext.jsx — Estado global del usuario logueado
//
// Context API de React permite compartir datos entre componentes
// sin tener que pasarlos como props por cada nivel.
// Cualquier componente puede saber quién está logueado con: useAuth()

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Intenta recuperar el usuario del localStorage al iniciar.
  // Así si el usuario cierra la app y la vuelve a abrir, sigue logueado.
  const [usuario, setUsuario] = useState(
    () => JSON.parse(localStorage.getItem('usuario') || 'null')
  );

  const login = (userData, token) => {
    // Guarda el token y los datos del usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUsuario(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
      {/* children: todos los componentes hijos tendrán acceso al contexto */}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
// Uso: const { usuario, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);