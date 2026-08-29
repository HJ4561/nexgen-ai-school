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
        // Fix: manualChunks should be a function, not an object
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'redux-vendor';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('lottie-react') || id.includes('react-icons')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('axios')) {
              return 'api-vendor';
            }
            if (id.includes('gsap') || id.includes('lenis') || id.includes('split-type')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Remove these invalid options:
        // - generatedCode (should be an object, not a string)
        // - compact (invalid key)
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
      'lucide-react',
      'framer-motion',
      'recharts',
      'gsap',
      'lottie-react',
      'react-icons',
      'react-hot-toast',
      'react-textarea-autosize',
      'react-chatbot-kit',
      'react-markdown',
      '@lottiefiles/dotlottie-react',
      'lenis',
      'split-type',
    ],
    // Remove deprecated esbuildOptions
    // Use rolldownOptions instead
    rolldownOptions: {
      target: 'es2020',
      treeShaking: true,
    },
  },
  // Remove esbuild config as it's deprecated
  define: {
    'process.env.VITE_API_URL': JSON.stringify('/api'),
  },
  // Remove cacheDir if not needed
})