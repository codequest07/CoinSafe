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
            onwarn: function (warning, warn) {
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
            // Reduce memory allocation to prevent build from being killed
            maxParallelFileOps: 2,
            output: {
                // Manual chunking to optimize bundle size
                manualChunks: {
                    // Vendor chunks
                    "vendor-react": ["react", "react-dom"],
                    "vendor-thirdweb": ["thirdweb"],
                    "vendor-walletconnect": [
                        "@walletconnect/universal-provider",
                        "@walletconnect/utils",
                    ],
                    // Crypto libraries
                    // "vendor-crypto": ["sha256"],
                    // UI components
                    "vendor-ui": ["lucide-react"],
                },
                // Asset file naming
                assetFileNames: function (assetInfo) {
                    if (!assetInfo.name)
                        return "assets/[name]-[hash][extname]";
                    var info = assetInfo.name.split(".");
                    var ext = info[info.length - 1];
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                        return "assets/images/[name]-[hash][extname]";
                    }
                    return "assets/[name]-[hash][extname]";
                },
            },
        },
        // Additional build optimizations
        chunkSizeWarningLimit: 3000, // Single location, increased limit
        // Memory optimization settings
        target: 'esnext',
        sourcemap: false, // Disable sourcemaps to reduce memory usage
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true, // Remove console logs in production
                drop_debugger: true,
                pure_funcs: ["console.log"], // Remove specific functions
            },
            mangle: {
                safari10: true,
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
