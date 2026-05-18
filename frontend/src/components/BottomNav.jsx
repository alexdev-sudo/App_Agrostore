// BottomNav.jsx — Barra de navegación inferior del Figma
// Reaparece en todas las pantallas después del login.
// Props:
//   activo: string con el tab actual ("inicio","tienda","entregas","buzon","historial")
//   onChange: función que se llama cuando el usuario toca un tab
//   notificaciones: número que aparece en la burbuja del buzón

import { Home, ShoppingCart, Package, Bell, History } from 'lucide-react';
// lucide-react provee íconos SVG que coinciden con el diseño del Figma

const tabs = [
  { id: 'inicio',    label: 'Inicio',    Icon: Home },
  { id: 'tienda',    label: 'Tienda',    Icon: ShoppingCart },
  { id: 'entregas',  label: 'Entregas',  Icon: Package },
  { id: 'buzon',     label: 'Buzón',     Icon: Bell },
  { id: 'historial', label: 'Historial', Icon: History },
];

export default function BottomNav({ activo, onChange, notificaciones = 0 }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                    flex justify-around items-center py-2 z-50">
      {/* fixed bottom-0: se queda pegado al fondo de la pantalla */}
      {/* z-50: aparece encima de todo el contenido de la página */}

      {tabs.map(({ id, label, Icon }) => {
        const estaActivo = activo === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg
                       transition-colors duration-150 hover:bg-verde-claro"
          >
            <div className="relative">
              <Icon
                size={22}
                className={estaActivo ? 'text-verde' : 'text-gray-400'}
              />
              {/* Burbuja roja solo en el tab Buzón cuando hay notificaciones */}
              {id === 'buzon' && notificaciones > 0 && (
                <span className="absolute -top-1 -right-2 bg-dorado text-white
                                 text-xs w-4 h-4 rounded-full flex items-center
                                 justify-center font-bold leading-none">
                  {notificaciones > 9 ? '9+' : notificaciones}
                </span>
              )}
            </div>
            <span className={`text-xs ${estaActivo ? 'text-verde font-bold' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}