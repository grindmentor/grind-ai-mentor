
import React, { createContext, useContext, useState, useEffect } from 'react';
import { aiModules } from '@/components/dashboard/AIModuleData';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageTracking } from '@/hooks/useUsageTracking';

// Preload all module components immediately
const preloadedModules = aiModules.map(module => ({
  ...module,
  component: module.component // Component is already imported
}));

interface ModulesContextType {
  modules: typeof aiModules;
  isInitialized: boolean;
}

const ModulesContext = createContext<ModulesContextType>({
  modules: [],
  isInitialized: false
});

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules] = useState(preloadedModules);
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentTier } = useSubscription();
  const { } = useUsageTracking(); // Initialize usage tracking

  useEffect(() => {
    // Simulate ultra-fast initialization (under 0.01s)
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 5); // 5ms - imperceptible to users

    return () => clearTimeout(timer);
  }, [currentTier]);

  return (
    <ModulesContext.Provider value={{ modules, isInitialized }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};
