import { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Páginas
import Login from './pages/Login';
import DashboardAgricultor  from './pages/agricultor/Dashboard';
import DashboardComprador   from './pages/comprador/Dashboard';
import DashboardAdmin       from './pages/admin/Dashboard';

export default function App() {
  const { usuario } = useAuth();

  // Si no hay usuario logueado, mostrar la pantalla de login
  if (!usuario) {
    return <Login />;
  }

  // Según el tipo de usuario, mostrar el dashboard correspondiente
  if (usuario.tipo === 'Productor')      return <DashboardAgricultor />;
  if (usuario.tipo === 'Comprador')      return <DashboardComprador />;
  if (usuario.tipo === 'Administrador')  return <DashboardAdmin />;

  // Si el tipo no coincide con ninguno (no debería pasar), cerrar sesión
  return <Login />;
}