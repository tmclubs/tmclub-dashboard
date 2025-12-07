import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin sederhana untuk menangani fallback SPA pada path yang mengandung titik
const spaFallbackWithDots = () => {
  return {
    name: 'spa-fallback-with-dots',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const reqPath = req.url.split('?')[0];
        // Jika request bukan untuk API, bukan untuk file statis (biasanya di assets/public), 
        // dan accept header meminta HTML, maka serve index.html
        if (
          req.method === 'GET' &&
          !reqPath.startsWith('/api') &&
          !reqPath.startsWith('/media') &&
          !reqPath.startsWith('/static') &&
          !reqPath.includes('/assets/') && 
          !reqPath.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) &&
          req.headers.accept?.includes('text/html')
        ) {
          req.url = '/index.html';
        }
        next();
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), spaFallbackWithDots()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    host: true,
    // Izinkan akses via reverse proxy / container hostname saat pengembangan
    allowedHosts: ['localhost', '127.0.0.1', '::1', 'frontend_app', 'tmc-frontend-prod', 'api.tmclub.id', 'tmclub.id'],
    proxy: {
      '/api': {
        target: 'https://api.tmclub.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
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
          tiptap: ['@tiptap/react', '@tiptap/starter-kit'],
          markdown: [
            'react-markdown',
            'remark-parse',
            'remark-rehype',
            'remark-gfm',
            'rehype-raw',
            'rehype-stringify',
            'unified',
            'katex',
            'mermaid',
          ],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['date-fns', 'axios', 'clsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: [
      '@headlessui/react',
      'framer-motion',
      'lucide-react',
      '@tiptap/react',
      '@tiptap/starter-kit',
      // '@tiptap/pm' dihindari: gunakan subpath import seperti '@tiptap/pm/state'
      'react-markdown',
      'remark-parse',
      'remark-rehype',
      'remark-gfm',
      'rehype-raw',
      'rehype-stringify',
      'unified',
      'katex',
      'mermaid',
      'recharts',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'date-fns',
      'axios',
      'clsx',
    ],
    exclude: ['@tiptap/pm'],
  },
});
