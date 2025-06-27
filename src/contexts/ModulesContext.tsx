
import React, { createContext, useContext, ReactNode } from 'react';
import { aiModules } from '@/components/dashboard/AIModuleData';
import PhysiqueAI from '@/components/ai-modules/ProgressAI';
import { TrendingUp } from 'lucide-react';

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  component: React.ComponentType<any>;
  isNew: boolean;
  isPremium: boolean;
  usageKey: string;
}

interface ModulesContextType {
  modules: Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add Progress Hub as a special module
  const progressHubModule: Module = {
    id: 'progress-hub',
    title: 'Progress Hub',
    description: 'Track your fitness journey with detailed analytics and insights',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-purple-700',
    component: PhysiqueAI,
    isNew: false,
    isPremium: false,
    usageKey: 'progress_analyses' as const
  };

  // Combine all modules
  const modules = [...aiModules, progressHubModule];

  return (
    <ModulesContext.Provider value={{ modules }}>
      {children}
    </ModulesContext.Provider>
  );
};

export default ModulesProvider;
