import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target:
          "https://eth-sepolia.g.alchemy.com/v2/Kh0Fgt5Vf2vfAz0CvUT1KHKHICZ-RGlh",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
