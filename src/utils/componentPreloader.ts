
// Component preloader for frequently accessed modules
const preloadedComponents = new Map<string, Promise<any>>();

export const preloadComponent = (componentImport: () => Promise<any>, key: string) => {
  if (!preloadedComponents.has(key)) {
    preloadedComponents.set(key, componentImport());
  }
  return preloadedComponents.get(key);
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Only preload if not on a slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      return;
    }
  }

  // Preload most frequently used components
  preloadComponent(() => import('@/components/ai-modules/CoachGPT'), 'CoachGPT');
  preloadComponent(() => import('@/components/ai-modules/SmartTraining'), 'SmartTraining');
  preloadComponent(() => import('@/components/ai-modules/WorkoutLoggerAI'), 'WorkoutLoggerAI');
  preloadComponent(() => import('@/components/ai-modules/SmartFoodLog'), 'SmartFoodLog');
  preloadComponent(() => import('@/components/ai-modules/BlueprintAI'), 'BlueprintAI');
  preloadComponent(() => import('@/components/ai-modules/ProgressHub'), 'ProgressHub');
};

// Initialize preloading when idle
export const initializePreloading = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      preloadCriticalComponents();
    });
  } else {
    setTimeout(preloadCriticalComponents, 2000);
  }
};
