import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { join } from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    https: true,
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@': join(import.meta.dirname, './src'),
    },
  },
});