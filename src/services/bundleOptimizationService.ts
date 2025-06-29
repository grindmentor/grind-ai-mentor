
// Dynamic imports for code splitting optimization
export const lazyImports = {
  // AI Modules - load on demand
  CoachGPT: () => import('@/components/ai-modules/CoachGPT'),
  WorkoutTimer: () => import('@/components/ai-modules/WorkoutTimer'),
  ProgressHub: () => import('@/components/ai-modules/ProgressHub'),
  MealPlanAI: () => import('@/components/ai-modules/MealPlanAI'),
  WorkoutLoggerAI: () => import('@/components/ai-modules/WorkoutLoggerAI'),
  SmartTraining: () => import('@/components/ai-modules/SmartTraining'),
  RecoveryCoach: () => import('@/components/ai-modules/RecoveryCoach'),
  BlueprintAI: () => import('@/components/ai-modules/BlueprintAI'),
  CutCalcPro: () => import('@/components/ai-modules/CutCalcPro'),
  CardioAI: () => import('@/components/ai-modules/CardioAI'),
  TDEECalculator: () => import('@/components/ai-modules/TDEECalculator'),
  SmartFoodLog: () => import('@/components/ai-modules/SmartFoodLog'),
  HabitTracker: () => import('@/components/ai-modules/HabitTracker'),

  // Settings and other heavy components
  Settings: () => import('@/pages/Settings'),
  Profile: () => import('@/pages/Profile'),
  Pricing: () => import('@/pages/Pricing'),
  
  // Goals and achievements
  RealGoalsAchievements: () => import('@/components/goals/RealGoalsAchievements'),
  GoalCreationModal: () => import('@/components/goals/GoalCreationModal'),
};

// Resource preloading based on user behavior
export class SmartPreloader {
  private static instance: SmartPreloader;
  private preloadedModules = new Set<string>();
  private userInteractions = new Map<string, number>();

  static getInstance() {
    if (!SmartPreloader.instance) {
      SmartPreloader.instance = new SmartPreloader();
    }
    return SmartPreloader.instance;
  }

  // Track user interaction patterns
  trackInteraction(moduleName: string) {
    const count = this.userInteractions.get(moduleName) || 0;
    this.userInteractions.set(moduleName, count + 1);
    
    // Preload frequently used modules
    if (count >= 2 && !this.preloadedModules.has(moduleName)) {
      this.preloadModule(moduleName);
    }
  }

  // Intelligent preloading
  private async preloadModule(moduleName: string) {
    if (this.preloadedModules.has(moduleName)) return;
    
    try {
      const moduleLoader = lazyImports[moduleName as keyof typeof lazyImports];
      if (moduleLoader && 'requestIdleCallback' in window) {
        window.requestIdleCallback(async () => {
          await moduleLoader();
          this.preloadedModules.add(moduleName);
          console.log(`[Preloader] ${moduleName} preloaded`);
        }, { timeout: 5000 });
      }
    } catch (error) {
      console.warn(`[Preloader] Failed to preload ${moduleName}:`, error);
    }
  }

  // Preload critical modules based on route
  preloadForRoute(route: string) {
    const criticalModules = {
      '/': ['CoachGPT', 'WorkoutTimer'],
      '/settings': ['Settings'],
      '/profile': ['Profile', 'ProgressHub'],
      '/pricing': ['Pricing']
    };

    const modules = criticalModules[route as keyof typeof criticalModules] || [];
    modules.forEach(module => this.preloadModule(module));
  }
}

// Bundle size optimization utilities
export const bundleOptimizer = {
  // Remove unused CSS at runtime (aggressive tree-shaking)
  removeUnusedCSS() {
    if (typeof window === 'undefined') return;
    
    // This runs after initial render to clean up unused styles
    requestAnimationFrame(() => {
      const unusedSelectors = [
        '.unused-class',
        '[data-unused]',
        // Add more unused selectors as needed
      ];
      
      document.querySelectorAll('style').forEach(styleElement => {
        let css = styleElement.textContent || '';
        unusedSelectors.forEach(selector => {
          const regex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*}`, 'g');
          css = css.replace(regex, '');
        });
        if (css !== styleElement.textContent) {
          styleElement.textContent = css;
        }
      });
    });
  },

  // Optimize font loading
  optimizeFonts() {
    // Remove unused font weights and styles
    const fontOptimizations = {
      'Inter': ['300', '400', '500', '600'], // Keep only essential weights
      'Orbitron': ['400', '600', '700'] // Keep only essential weights
    };

    Object.entries(fontOptimizations).forEach(([family, weights]) => {
      const links = document.querySelectorAll(`link[href*="${family}"]`);
      links.forEach((link: any) => {
        if (link.href) {
          const url = new URL(link.href);
          const params = new URLSearchParams(url.search);
          
          // Update weights to include only essential ones
          const weightParam = params.get('wght');
          if (weightParam) {
            params.set('wght', weights.join(';'));
            link.href = `${url.origin}${url.pathname}?${params.toString()}`;
          }
        }
      });
    });
  }
};
