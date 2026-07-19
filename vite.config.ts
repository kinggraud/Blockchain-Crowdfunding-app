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
  build: {
    rollupOptions: {
      external: [
        "@safe-globalThis/safe-ethers-adapters",
        "@safe-globalThis/safe-core-sdk"
      ],
    },
  },
});