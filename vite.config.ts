import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only plugin: receive client logs and print to terminal
const consoleRedirectPlugin = () => {
  return {
    name: 'console-redirect',
    configureServer(server) {
      server.middlewares.use('/__log', (req, res) => {
        let body = '';
        try {
          // Kumpulkan body tanpa async/await untuk kompatibilitas ES5 lib
          (req as any).on('data', (chunk: unknown) => {
            try {
              body += typeof chunk === 'string' ? chunk : (chunk as any).toString('utf8');
            } catch {
              body += String(chunk);
            }
          });
          (req as any).on('end', () => {
            try {
              let payload: any;
              try {
                payload = JSON.parse(body);
              } catch {
                payload = { level: 'log', messages: [body] };
              }
              const level = String((payload && payload.level) || 'log').toLowerCase();
              const msgsRaw = Array.isArray(payload && payload.messages) ? payload.messages : [payload && payload.messages];
              const msgs = msgsRaw.filter((m) => m !== undefined && m !== null);
              const ts = (payload && payload.timestamp) || new Date().toISOString();
              const prefix = `[client ${ts}]`;
              switch (level) {
                case 'error':
                  console.error(prefix, ...msgs);
                  break;
                case 'warn':
                  console.warn(prefix, ...msgs);
                  break;
                case 'info':
                  console.info(prefix, ...msgs);
                  break;
                default:
                  console.log(prefix, ...msgs);
              }
              res.statusCode = 204;
              res.end();
            } catch (e) {
              console.error('[console-redirect] failed to handle client log', e);
              res.statusCode = 500;
              res.end();
            }
          });
        } catch (e) {
          console.error('[console-redirect] failed to setup client log handler', e);
          res.statusCode = 500;
          res.end();
        }
      });
    },
  } as any;
};

export default defineConfig({
  plugins: [react(), consoleRedirectPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    host: true,
    // Izinkan akses via reverse proxy / container hostname saat pengembangan
    allowedHosts: ['localhost', '127.0.0.1', '::1', 'frontend_app', 'tmc-frontend-prod'],
    proxy: {
      '/api': {
        target: 'https://api.tmclub.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    // Gunakan 'hidden' agar sourcemap tetap dihasilkan tanpa direferensikan di bundle
    // Menghindari request devtools ke path seperti /node_modules/.vite/deps/* di produksi
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@headlessui/react', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
  // Hapus semua console/debugger dari bundle produksi
  esbuild: {
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    include: ['@headlessui/react', 'framer-motion', 'lucide-react'],
  },
});