import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Make all assets relative, fixes white screen on deployment
  plugins: [react()],
  build: {
    outDir: 'dist', // Output folder for production build
    assetsDir: 'assets', // Where static assets (images, CSS, JS) go
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
