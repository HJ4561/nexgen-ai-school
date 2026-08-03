/**
 * ============================================
 * VITE CONFIGURATION
 * ============================================
 * 
 * Purpose: Vite build tool configuration
 * Features:
 * - React with SWC for fast compilation
 * - Tailwind CSS integration
 * - Path aliases for cleaner imports (@/ → src/)
 * - API proxy for development
 * 
 * Dependencies:
 * - @vitejs/plugin-react-swc: React SWC compiler
 * - @tailwindcss/vite: Tailwind CSS integration
 * - path: Node.js path module
 * 
 * Usage:
 * - npm run dev: Start development server
 * - npm run build: Build for production
 * - npm run preview: Preview production build
 * ============================================
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * ============================================
 * VITE CONFIGURATION
 * ============================================
 * 
 * Exports the Vite configuration object
 * 
 * @constant {Object} config
 * @property {Array} plugins - List of Vite plugins
 * @property {Object} resolve - Module resolution settings
 * @property {Object} server - Development server settings
 * 
 * @example
 * // Start development server
 * npm run dev
 * 
 * // Build for production
 * npm run build
 * ============================================
 */
export default defineConfig({
  /**
   * ============================================
   * PLUGINS
   * ============================================
   * 
   * Vite plugins for additional functionality
   * 
   * - tailwindcss(): Enables Tailwind CSS v4 with JIT compilation
   * - react(): Enables React with SWC compiler for faster builds
   *   and better performance compared to Babel
   */
  plugins: [
    tailwindcss(),
    react(),
  ],

  /**
   * ============================================
   * MODULE RESOLUTION
   * ============================================
   * 
   * Path aliases for cleaner imports
   * 
   * @property {Object} alias - Path alias mappings
   * @property {string} '@' - Maps to './src' directory
   * 
   * @example
   * // Instead of:
   * import Component from '../../../components/Component'
   * 
   * // You can write:
   * import Component from '@/components/Component'
   */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  /**
   * ============================================
   * DEVELOPMENT SERVER
   * ============================================
   * 
   * Development server configuration
   * 
   * @property {Object} proxy - API proxy settings
   * @property {string} target - Target API server URL
   * @property {boolean} changeOrigin - Changes the origin of the host header
   * @property {boolean} secure - Allows HTTPS with self-signed certificates
   * 
   * @description
   * Proxies all requests starting with '/api' to the backend server.
   * This prevents CORS issues during development.
   */
  server: {
    proxy: {
      '/api': {
        target: 'https://schoolassistant-neon.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})