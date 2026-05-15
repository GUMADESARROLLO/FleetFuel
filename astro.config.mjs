import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'FleetFuel',
        short_name: 'FleetFuel',
        description: 'Control total de tu flota, en la palma de tu mano',
        theme_color: '#E87200',
        background_color: '#F5F7F8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/dashboard',
        scope: '/',
        categories: ['business', 'productivity'],
        lang: 'es-MX',
        shortcuts: [
          {
            name: 'Nuevo Registro',
            short_name: 'Nuevo',
            description: 'Registrar carga de combustible',
            url: '/nuevo-registro',
            icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Mis Reportes',
            short_name: 'Reportes',
            description: 'Ver historial de registros',
            url: '/reportes',
            icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [],
        prefer_related_applications: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,woff,ttf}'],
        navigateFallback: '/offline',
        navigateFallbackDenylist: [/\/api\//, /\/_astro\//, /\/reportes\//],
        runtimeCaching: [
          {
            urlPattern: /^\/(?!api\/|_astro\/)[^.]*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/api\/(vehiculos|tipos-combustible|proveedores|sub-proyectos)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'catalog-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: false,
    },
  },
});
