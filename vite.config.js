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
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
    target: 'es2020',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        // Simplified chunking to reduce memory usage
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['lucide-react', 'framer-motion', 'lottie-react', 'react-icons'],
          'chart-vendor': ['recharts'],
          'api-vendor': ['axios'],
          'animation-vendor': ['gsap', 'lenis'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        compact: true,
        generatedCode: 'es2015',
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
    force: true,
    esbuildOptions: {
      target: 'es2020',
      treeShaking: true,
    },
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify('/api'),
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  cacheDir: '.vite-cache',
})