import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 🔍 This will inject a safe global object variable at runtime 
      // WITHOUT breaking Thirdweb's internal function parameter text strings.
      globals: {
        global: true,
      },
      protocolImports: true, 
    }),
  ],
  // 🔍 CRITICAL FIX: Delete the define block completely so it stops rewriting internal function names!
  define: {},
  build: {
    rollupOptions: {
      external: [/^@safe-globalThis\//],
    },
  },
});