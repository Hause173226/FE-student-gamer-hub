import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      global: 'globalThis',
    },
  },
  server: {
    hmr: {
      // Tắt ping nếu không cần HMR
      // Hoặc tăng timeout để giảm spam log
      overlay: true,
    },
    // Tắt auto-reload nếu không cần
    watch: {
      usePolling: false,
    },
  },
  // Tắt HMR nếu không cần thiết trong production
  build: {
    sourcemap: false,
  },
});
