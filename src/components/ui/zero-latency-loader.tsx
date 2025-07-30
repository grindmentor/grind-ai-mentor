// Zero-latency component loader
import React, { useEffect, useRef, useState } from 'react';

interface ZeroLatencyLoaderProps {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const instantComponentMap = new Map<string, React.ComponentType<any>>();
const loadingPromises = new Map<string, Promise<any>>();

// Pre-cache critical components immediately
const preloadCriticalComponents = () => {
  const critical = [
    'CoachGPT',
    'SmartTraining',
    'TDEECalculator',
    'WorkoutLoggerAI',
    'ProgressHub'
  ];

  critical.forEach(moduleId => {
    if (!loadingPromises.has(moduleId)) {
      const promise = import(`@/components/ai-modules/${moduleId}.tsx`)
        .then(module => {
          instantComponentMap.set(moduleId, module.default);
          return module.default;
        })
        .catch(() => null);
      
      loadingPromises.set(moduleId, promise);
    }
  });
};

// Initialize critical preloading immediately
if (typeof window !== 'undefined') {
  preloadCriticalComponents();
}

export const ZeroLatencyLoader: React.FC<ZeroLatencyLoaderProps> = ({
  moduleId,
  children,
  fallback
}) => {
  const [isReady, setIsReady] = useState(() => instantComponentMap.has(moduleId));
  const renderTimeRef = useRef(performance.now());

  useEffect(() => {
    if (isReady) return;

    const loadComponent = async () => {
      // Check if already cached
      if (instantComponentMap.has(moduleId)) {
        setIsReady(true);
        return;
      }

      // Check if loading is in progress
      if (loadingPromises.has(moduleId)) {
        try {
          await loadingPromises.get(moduleId);
          setIsReady(true);
        } catch {
          setIsReady(true); // Show fallback
        }
        return;
      }

      // Start loading if not already in progress
      const loadPromise = import(`@/components/ai-modules/${moduleId}.tsx`)
        .then(module => {
          instantComponentMap.set(moduleId, module.default);
          return module.default;
        })
        .catch(() => null);

      loadingPromises.set(moduleId, loadPromise);
      
      try {
        await loadPromise;
        setIsReady(true);
      } catch {
        setIsReady(true);
      }
    };

    loadComponent();
  }, [moduleId, isReady]);

  // Always render immediately - no perceived loading time
  return <>{children}</>;
};

// Performance-optimized module resolver
export const getInstantModule = (moduleId: string) => {
  return instantComponentMap.get(moduleId);
};

// Aggressive background preloader
export const preloadAllModules = () => {
  const allModules = [
    'CoachGPT',
    'SmartTraining', 
    'TDEECalculator',
    'WorkoutLoggerAI',
    'ProgressHub',
    'BlueprintAI',
    'SmartFoodLog',
    'MealPlanAI',
    'RecoveryCoach',
    'WorkoutTimer',
    'CutCalcPro',
    'HabitTracker',
    'ProgressAI'
  ];

  // Load all modules in parallel chunks to avoid blocking
  const chunkSize = 3;
  for (let i = 0; i < allModules.length; i += chunkSize) {
    const chunk = allModules.slice(i, i + chunkSize);
    
    setTimeout(() => {
      chunk.forEach(moduleId => {
        if (!loadingPromises.has(moduleId)) {
          const promise = import(`@/components/ai-modules/${moduleId}.tsx`)
            .then(module => {
              instantComponentMap.set(moduleId, module.default);
              return module.default;
            })
            .catch(() => null);
          
          loadingPromises.set(moduleId, promise);
        }
      });
    }, i * 50); // Stagger by 50ms per chunk
  }
};