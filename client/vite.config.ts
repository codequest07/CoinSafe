import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
      // Increase memory allocation for large builds
      maxParallelFileOps: 5,
    },
    // Additional build optimizations
    chunkSizeWarningLimit: 1600,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ["console.log"], // Remove specific functions
      },
    },
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: false, // Disable error overlay for warnings
    },
  },
  // Optimize dependencies to prevent memory issues
  optimizeDeps: {
    include: [
      "thirdweb",
      "@walletconnect/universal-provider",
      "@walletconnect/utils",
    ],
    exclude: [
      // Add any problematic packages here if needed
    ],
  },
});
