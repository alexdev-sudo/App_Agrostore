import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // autoUpdate: la app se actualiza sola cuando hay nueva versión
      // El usuario no tiene que tocar nada, la próxima vez que la abra ya tiene la nueva versión

      manifest: {
        name: 'AgroStore — La Esperanza',
        short_name: 'AgroStore',
        // short_name: texto que aparece bajo el ícono en la pantalla del teléfono
        description: 'Comercialización agrícola comunitaria',
        theme_color: '#3B6D11',
        // theme_color: color de la barra de estado del teléfono Android
        background_color: '#F5F0E8',
        // background_color: color de la pantalla de carga mientras abre la app
        display: 'standalone',
        // standalone: se abre sin barra de URL, como una app nativa
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
          // Crea estas dos imágenes con el logo de AgroStore sobre fondo verde
          // y ponlas en frontend/public/icons/
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
    // host: true permite acceder desde un teléfono real en la misma red WiFi.
    // Cuando Vite inicie, mostrará una IP tipo 192.168.x.x:5173
    // Ábrela en el teléfono para probar la PWA en un dispositivo real
  }
})