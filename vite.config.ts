import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Inject global object at runtime without breaking Thirdweb string parsing
      globals: {
        global: true,
      },
      protocolImports: true, 
    }),
  ],
  // Configure dev server security headers for Google OAuth popups
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  // Stop define block from rewriting internal Thirdweb function parameters
  define: {},
  build: {
    rollupOptions: {
      external: [/^@safe-globalThis\//],
    },
  },
});