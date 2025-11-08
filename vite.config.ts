import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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