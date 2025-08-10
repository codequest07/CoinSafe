import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Production-specific configuration for deployment servers with memory constraints
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore pure comment warnings from thirdweb, ox, and walletconnect
        if (warning.code === "PURE_COMMENT") {
          return;
        }
        // Ignore other common bundling warnings that don't affect functionality
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        // Show other warnings
        warn(warning);
      },
      // Minimal parallel operations for memory-constrained servers
      maxParallelFileOps: 1,
      output: {
        // Aggressive chunking for minimal memory usage
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split React into its own chunk
            if (id.includes('react-dom')) {
              return 'vendor-react-dom';
            }
            if (id.includes('react')) {
              return 'vendor-react';
            }
            // Split thirdweb into smaller chunks
            if (id.includes('thirdweb/dist/esm/react')) {
              return 'vendor-thirdweb-react';
            }
            if (id.includes('thirdweb')) {
              return 'vendor-thirdweb-core';
            }
            // Split WalletConnect
            if (id.includes('@walletconnect/universal-provider')) {
              return 'vendor-wc-provider';
            }
            if (id.includes('@walletconnect')) {
              return 'vendor-wc-utils';
            }
            // Crypto libraries
            if (id.includes('ethers') || id.includes('viem')) {
              return 'vendor-crypto';
            }
            // UI libraries
            if (id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Split remaining into smaller chunks
            const chunks = ['vendor-misc-1', 'vendor-misc-2', 'vendor-misc-3'];
            const hash = id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            return chunks[Math.abs(hash) % chunks.length];
          }
        },
        // Smaller chunk size limit
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Aggressive memory optimizations
    chunkSizeWarningLimit: 1000, // Very small chunks
    target: 'esnext',
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
        passes: 1, // Single pass to reduce memory
      },
      mangle: {
        safari10: true,
      },
      maxWorkers: 1, // Single worker
    },
    reportCompressedSize: false,
    write: true,
    // Force garbage collection
    emptyOutDir: true,
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: false,
    },
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
    ],
    exclude: [
      "thirdweb", // Let it be bundled normally to reduce pre-bundling memory
      "@walletconnect/universal-provider",
      "@walletconnect/utils",
    ],
    esbuildOptions: {
      target: 'esnext',
      logLevel: 'error',
    },
  },
});