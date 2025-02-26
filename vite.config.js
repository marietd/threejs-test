import { defineConfig } from 'vite';

export default defineConfig({
  // Base options for your project
  base: './', // Ensures proper relative paths for assets
  build: {
    outDir: 'dist', // Output directory
  },
  server: {
    open: true, // Automatically opens the browser when the server starts
  },
});
