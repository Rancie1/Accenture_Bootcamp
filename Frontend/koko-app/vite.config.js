import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Allow access from network devices (Android testing)
    port: 5173,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0', // Allow access from network devices for preview
    port: 5173,
    strictPort: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'koko-favicon.png', 'koko-1024.png'],
      manifest: {
        name: 'Koko - Your Savings Companion',
        short_name: 'Koko',
        description: 'Smart shopping assistant that helps you save money',
        theme_color: '#845EEE',
        background_color: '#ffffff',
        display: 'standalone', // Hides browser toolbar/address bar
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/koko-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/koko-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/koko-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/koko-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
