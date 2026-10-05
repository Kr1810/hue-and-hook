import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, Vite serves the React app on :5173 and forwards API requests to
// Express on :5000, so the client only ever uses relative URLs.
const API_TARGET = `http://localhost:${process.env.PORT || 5000}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
  worker: {
    format: "es",
  },
});
