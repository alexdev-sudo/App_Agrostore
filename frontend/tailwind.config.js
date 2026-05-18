export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // content: le dice a Tailwind dónde buscar las clases que uses,
  // para eliminar del CSS final las clases que NO usas (archivo más pequeño)
  theme: {
    extend: {
      colors: {
        // Colores exactos del prototipo Figma de AgroStore
        verde: {
          DEFAULT: '#3B6D11',  // botones, header, tabs activos
          osc:     '#27500A',  // totales, confirmaciones
          claro:   '#EAF3DE', // fondos de badges "Disponible"
        },
        dorado: {
          DEFAULT: '#BA7517', // estrellas de calificación, notificaciones
          claro:   '#FFF3DC',
        },
        crema: '#F5F0E8',     // fondo general de la app
      }
    }
  },
  plugins: [],
}