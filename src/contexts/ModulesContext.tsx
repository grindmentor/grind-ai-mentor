
import React, { createContext, useContext, ReactNode } from 'react';
import { aiModules, AIModule } from '@/components/dashboard/AIModuleData';

export interface ModulesContextType {
  modules: AIModule[];
  getModuleById: (id: string) => AIModule | undefined;
  getModulesByCategory: (category: string) => AIModule[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

interface ModulesProviderProps {
  children: ReactNode;
}

export const ModulesProvider: React.FC<ModulesProviderProps> = ({ children }) => {
  const getModuleById = (id: string): AIModule | undefined => {
    return aiModules.find(module => module.id === id);
  };

  const getModulesByCategory = (category: string): AIModule[] => {
    return aiModules.filter(module => module.gradient.includes(category.toLowerCase()));
  };

  const value: ModulesContextType = {
    modules: aiModules,
    getModuleById,
    getModulesByCategory
  };

  return (
    <ModulesContext.Provider value={value}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = (): ModulesContextType => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

export default ModulesProvider;
