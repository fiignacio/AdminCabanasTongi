import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, // 5 MB
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        name: 'Rent-a-Car & Tours Manager',
        short_name: 'Rent & Tours',
        description: 'Gestor de Arriendo de Vehículos y Tours',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
});
