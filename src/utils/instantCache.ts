// Instant cache for zero-loading components
class InstantComponentCache {
  private cache = new Map<string, React.ComponentType<any>>();
  private loadingPromises = new Map<string, Promise<any>>();
  private priorityQueue: string[] = [];

  constructor() {
    this.initializeCriticalComponents();
  }

  private async initializeCriticalComponents() {
    // Define critical loading order
    this.priorityQueue = [
      'CoachGPT',
      'SmartTraining',
      'TDEECalculator', 
      'WorkoutLoggerAI',
      'ProgressHub',
      'BlueprintAI'
    ];

    // Load highest priority components first
    for (const moduleId of this.priorityQueue.slice(0, 3)) {
      this.preloadComponent(moduleId);
    }

    // Load remaining components in background
    setTimeout(() => {
      for (const moduleId of this.priorityQueue.slice(3)) {
        this.preloadComponent(moduleId);
      }
    }, 100);
  }

  async preloadComponent(moduleId: string) {
    if (this.cache.has(moduleId) || this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    const loadPromise = import(`@/components/ai-modules/${moduleId}.tsx`)
      .then(module => {
        this.cache.set(moduleId, module.default);
        this.loadingPromises.delete(moduleId);
        return module.default;
      })
      .catch(error => {
        console.warn(`Failed to preload ${moduleId}:`, error);
        this.loadingPromises.delete(moduleId);
        return null;
      });

    this.loadingPromises.set(moduleId, loadPromise);
    return loadPromise;
  }

  getComponent(moduleId: string): React.ComponentType<any> | null {
    return this.cache.get(moduleId) || null;
  }

  isComponentReady(moduleId: string): boolean {
    return this.cache.has(moduleId);
  }

  async waitForComponent(moduleId: string): Promise<React.ComponentType<any> | null> {
    if (this.cache.has(moduleId)) {
      return this.cache.get(moduleId)!;
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    return this.preloadComponent(moduleId);
  }

  // Preload all remaining modules
  preloadAll() {
    const allModules = [
      'CoachGPT', 'SmartTraining', 'TDEECalculator', 'WorkoutLoggerAI',
      'ProgressHub', 'BlueprintAI', 'SmartFoodLog', 'MealPlanAI',
      'RecoveryCoach', 'WorkoutTimer', 'CutCalcPro', 'HabitTracker',
      'ProgressAI'
    ];

    allModules.forEach(moduleId => {
      if (!this.cache.has(moduleId)) {
        this.preloadComponent(moduleId);
      }
    });
  }
}

// Global instant cache instance
export const instantCache = new InstantComponentCache();

// Auto-preload all modules on app start
if (typeof window !== 'undefined') {
  setTimeout(() => {
    instantCache.preloadAll();
  }, 200);
}