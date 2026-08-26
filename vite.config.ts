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
  // Stop define block from rewriting internal Thirdweb function parameters
  define: {},
  build: {
    rollupOptions: {
      external: [/^@safe-globalThis\//],
    },
  },
});