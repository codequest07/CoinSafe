import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // injectRegister: false, // We handle registration manually
      // strategies: "injectManifest",
      // srcDir: "public",
      // filename: "service-worker.js",
      // manifest: false, // We use public/manifest.json
      // devOptions: {
      //   enabled: true,
      //   type: "module",
      // },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5000000,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
