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
    global: "globalThis",
  },
  resolve: {
    alias: {
      // Directs Vite to resolve these modules immediately to an empty inline export string
      "@safe-globalThis/safe-ethers-adapters": "data:text/javascript,export default {}",
      "@safe-globalThis/safe-core-sdk": "data:text/javascript,export default {}",
      "@safe-globalThis/safe-ethers-lib": "data:text/javascript,export default {}",
    },
  },
});