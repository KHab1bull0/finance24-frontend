import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // Enable service worker in dev so PWA can be installed from the dev server
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Finance24",
        short_name: "Finance24",
        description: "Personal finance tracker",
        theme_color: "#16A34A",
        background_color: "#14532D",
        display: "standalone",
        display_override: ["standalone", "fullscreen"],
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\//i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 4040,
    // Bind on the LAN so a phone can open the dev server. Without this the
    // dev server is localhost-only and unreachable from a device.
    host: true,
    proxy: {
      // In dev the app calls a relative /api, which lands here and is proxied
      // to the backend. Keeping it same-origin is what lets a phone on the LAN
      // work: an absolute http://localhost:... would resolve to the phone.
      // Target is read from env so it cannot go stale when the backend port moves.
      '/api': {
        target: env.VITE_API_URL || 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
  };
});
