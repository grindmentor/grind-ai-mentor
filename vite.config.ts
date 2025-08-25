
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ultra-optimized for production
    target: 'es2020',
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        dead_code: true,
        unused: true,
      },
      mangle: {
        safari10: true,
      },
    } : undefined,
    rollupOptions: {
      output: {
        // Optimized chunk splitting to reduce critical request chains
        manualChunks: (id) => {
          // Critical vendor chunks that should load first
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            return 'vendor-other';
          }
          
          // Defer AI modules to prevent them from being in critical path
          if (id.includes('ai-modules')) {
            if (id.includes('CoachGPT')) return 'ai-coach';
            if (id.includes('SmartTraining')) return 'ai-training';
            return 'ai-other';
          }
          
          // Keep dashboard separate but not critical
          if (id.includes('Dashboard')) return 'dashboard';
          
          // Group everything else as main
          return 'main';
        },
        // Optimize asset naming for better caching
        chunkFileNames: mode === 'production' ? 'js/[name]-[hash:8].js' : 'js/[name].js',
        entryFileNames: mode === 'production' ? 'js/[name]-[hash:8].js' : 'js/[name].js',
        assetFileNames: mode === 'production' ? '[ext]/[name]-[hash:8].[ext]' : '[ext]/[name].[ext]',
      },
    },
    // Optimize chunk size for faster loading and reduce request chains
    chunkSizeWarningLimit: 500,
    // Disable source maps in production to reduce requests
    sourcemap: false,
    // Increase inline limit to reduce requests
    assetsInlineLimit: 16384,
    // Keep CSS inlined to prevent render blocking
    cssCodeSplit: false,
    // Ensure CSS doesn't block rendering
    cssMinify: 'esbuild',
  },
  // Ultra-optimized dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'framer-motion',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@vite/client', '@vite/env'],
    // Force optimization for better performance
    force: mode === 'production',
  },
  // Enhanced CSS processing
  css: {
    devSourcemap: mode === 'development',
  },
  // PWA and performance configurations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
}));
