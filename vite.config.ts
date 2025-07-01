
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
        // Ultra-optimized manual chunk splitting for better caching
        manualChunks: {
          // Core vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'date-fns', 'lodash'],
          
          // AI modules (most performance critical)
          'ai-coach': ['./src/components/ai-modules/CoachGPT.tsx'],
          'ai-training': ['./src/components/ai-modules/SmartTraining.tsx'],
          'ai-logger': ['./src/components/ai-modules/WorkoutLoggerAI.tsx'],
          'ai-food': ['./src/components/ai-modules/SmartFoodLog.tsx'],
          'ai-blueprint': ['./src/components/ai-modules/BlueprintAI.tsx'],
          
          // Dashboard and core components
          'dashboard': ['./src/components/Dashboard.tsx'],
          'progress': ['./src/components/ai-modules/ProgressHub.tsx'],
          
          // Less frequently used modules
          'secondary-modules': [
            './src/components/ai-modules/MealPlanAI.tsx',
            './src/components/ai-modules/RecoveryCoach.tsx',
            './src/components/ai-modules/HabitTracker.tsx'
          ]
        },
        // Optimize asset naming
        chunkFileNames: mode === 'production' ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
        entryFileNames: mode === 'production' ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
        assetFileNames: mode === 'production' ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]',
      },
    },
    // Optimize chunk size (reduced for faster loading)
    chunkSizeWarningLimit: 800,
    // Enable source maps for production debugging (hidden)
    sourcemap: mode === 'production' ? 'hidden' : true,
    // Optimize assets (increased for better performance)
    assetsInlineLimit: 8192,
    // Enable CSS code splitting
    cssCodeSplit: true,
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
    postcss: {
      plugins: mode === 'production' ? [
        require('autoprefixer'),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            minifySelectors: true,
          }]
        })
      ] : [],
    },
  },
  // PWA and performance configurations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Experimental features for better performance
  experimental: {
    buildAdvancedBaseOptions: {
      buildTarget: 'es2020'
    }
  },
}));
