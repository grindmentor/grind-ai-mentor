
import React, { createContext, useContext, useState, useEffect } from 'react';
import { aiModules } from '@/components/dashboard/AIModuleData';

interface ModulesContextType {
  modules: typeof aiModules;
  isInitialized: boolean;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Pre-load modules immediately on mount
    setIsInitialized(true);
  }, []);

  return (
    <ModulesContext.Provider value={{
      modules: aiModules,
      isInitialized
    }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};
