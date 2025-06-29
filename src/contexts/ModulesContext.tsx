
import React, { createContext, useContext, ReactNode } from 'react';
import { aiModules, AIModule } from '@/components/dashboard/AIModuleData';

interface ModulesContextType {
  modules: AIModule[];
  getModuleById: (id: string) => AIModule | undefined;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

interface ModulesProviderProps {
  children: ReactNode;
}

export const ModulesProvider: React.FC<ModulesProviderProps> = ({ children }) => {
  const getModuleById = (id: string) => {
    return aiModules.find(module => module.id === id);
  };

  const value = {
    modules: aiModules,
    getModuleById
  };

  return (
    <ModulesContext.Provider value={value}>
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

export default ModulesProvider;
