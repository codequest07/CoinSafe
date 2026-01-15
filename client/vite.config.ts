import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, ViteDevServer } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import type { IncomingMessage, ServerResponse } from "http";

// Plugin to replace Firebase env vars in service worker during build
function firebaseServiceWorkerPlugin() {
  let originalContent: string | null = null;
  const swPath = path.resolve(__dirname, "public/firebase-messaging-sw.js");

  return {
    name: "firebase-service-worker",
    buildStart() {
      // Store original content and process the file
      if (existsSync(swPath)) {
        originalContent = readFileSync(swPath, "utf-8");
        let content = originalContent;

        // Replace placeholders with environment variables
        const replacements = {
          "__VITE_FIREBASE_API_KEY__": process.env.VITE_FIREBASE_API_KEY || "",
          "__VITE_FIREBASE_AUTH_DOMAIN__": process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
          "__VITE_FIREBASE_PROJECT_ID__": process.env.VITE_FIREBASE_PROJECT_ID || "",
          "__VITE_FIREBASE_STORAGE_BUCKET__": process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
          "__VITE_FIREBASE_MESSAGING_SENDER_ID__": process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
          "__VITE_FIREBASE_APP_ID__": process.env.VITE_FIREBASE_APP_ID || "",
        };

        Object.entries(replacements).forEach(([placeholder, value]) => {
          content = content.replace(new RegExp(placeholder, "g"), value);
        });

        // Write processed content (Vite will copy this from public during build)
        writeFileSync(swPath, content);
      }
    },
    buildEnd() {
      // Restore original content after build
      if (originalContent && existsSync(swPath)) {
        writeFileSync(swPath, originalContent);
      }
    },
  };
}

// Plugin to handle PWA plugin 404 errors (stale references)
function pwaPluginStub() {
  return {
    name: "pwa-plugin-stub",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // Intercept requests for non-existent PWA plugin endpoints
        if (req.url?.includes("@vite-plugin-pwa")) {
          res.statusCode = 404;
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), firebaseServiceWorkerPlugin(), pwaPluginStub()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["eventemitter3"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    commonjsOptions: {
      include: [/eventemitter3/, /node_modules/],
    },
  },
});
