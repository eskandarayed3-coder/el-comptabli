import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // listen on the LAN too, not just localhost — lets your phone reach it
    proxy: {
      '/api': 'http://localhost:3001',
      // Only the standalone static admin pages (server/public/*.html) go to
      // Express — /admin, /admin/users, /admin/codes etc. are React routes
      // and must stay with Vite so client-side routing handles them.
      '^/admin/.*\\.html$': 'http://localhost:3001',
    },
  },
});
