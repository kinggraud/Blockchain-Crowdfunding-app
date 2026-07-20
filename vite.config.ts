import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true, 
    }),
  ],
  define: {
    // Keeps window environments stable without breaking string patterns
    "global": "window.globalThis || window",
  },
  build: {
    rollupOptions: {
      external: [/^@safe-globalThis\//],
      // 🔍 FIX: Silences non-critical token warnings for asset files inside node_modules
      onwarn(warning, warn) {
        if (warning.code === 'PARSE_ERROR' && warning.loc?.file?.includes('node_modules')) {
          return;
        }
        warn(warning);
      }
    },
  },
});