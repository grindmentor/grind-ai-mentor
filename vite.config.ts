
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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
        dead_code: true,
        unused: true,
        passes: 3,
        ecma: 2020,
        module: true,
        toplevel: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
        ecma: 2020,
      },
    },
    rollupOptions: {
      output: {
        // Optimized chunk splitting - smaller initial bundle
        manualChunks(id) {
          // Core React - loaded first
          if (id.includes('react-dom') || id.includes('react/')) {
            return 'vendor-react';
          }
          // Router - needed for navigation
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          // Supabase - loaded when auth needed
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // UI components - split by usage
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }
          // Animation library
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          // Charts - loaded only when needed
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          // Query library
          if (id.includes('@tanstack')) {
            return 'vendor-query';
          }
          // Form handling
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'vendor-forms';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 400,
    sourcemap: false,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
    ],
    exclude: ['@vite/client'],
  },
  css: {
    devSourcemap: mode === 'development',
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
}));
