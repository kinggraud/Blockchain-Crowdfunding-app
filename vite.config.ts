import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Custom plugin to completely neutralize the missing Gnosis Safe packages
const ignoreSafeGlobalPlugin = {
  name: 'ignore-safe-global',
  resolveId(id: string) {
    if (id.startsWith('@safe-globalThis/')) {
      return id; // Tell Vite we will handle this import manually
    }
    return null;
  },
  load(id: string) {
    if (id.startsWith('@safe-globalThis/')) {
      // Returns a magical mock module that swallows all named and default imports safely
      return `
        const mock = new Proxy({}, { get: () => mock });
        export default mock;
        export const SafeService = mock;
        export const SafeEthersAdapter = mock;
      `;
    }
    return null;
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true, 
    }),
    ignoreSafeGlobalPlugin, // Inject our plugin here
  ],
  define: {
    global: "globalThis",
  },
});