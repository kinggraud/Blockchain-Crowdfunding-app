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
      // Bypasses all three problematic missing Gnosis wallet packages completely
      "@safe-globalThis/safe-ethers-adapters": "Object",
      "@safe-globalThis/safe-core-sdk": "Object",
      "@safe-globalThis/safe-ethers-lib": "Object",
    },
  },
});