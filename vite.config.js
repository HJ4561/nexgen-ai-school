// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://school-backend-new-rho.vercel.app',
        changeOrigin: true,
        secure: false,
        headers: {
          'X-Tenant-Slug': 'default-school',
        },
      }
    }
  },
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        // ✅ This MUST be a function
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify('/api'),
  },
})