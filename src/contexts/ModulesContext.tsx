
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
  console.log('ModulesProvider: Initializing modules');
  
  try {
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

    // Ensure aiModules is an array and filter out any invalid modules
    const validAiModules = Array.isArray(aiModules) 
      ? aiModules.filter(module => 
          module && 
          typeof module.id === 'string' && 
          typeof module.title === 'string' &&
          module.component
        )
      : [];

    // Combine all modules
    const modules = [...validAiModules, progressHubModule];
    
    console.log('ModulesProvider: Successfully loaded', modules.length, 'modules');

    return (
      <ModulesContext.Provider value={{ modules }}>
        {children}
      </ModulesContext.Provider>
    );
  } catch (error) {
    console.error('ModulesProvider: Error initializing modules:', error);
    
    // Fallback with just Progress Hub if aiModules fails
    const fallbackModules = [{
      id: 'progress-hub',
      title: 'Progress Hub',
      description: 'Track your fitness journey with detailed analytics and insights',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-700',
      component: PhysiqueAI,
      isNew: false,
      isPremium: false,
      usageKey: 'progress_analyses' as const
    }];

    return (
      <ModulesContext.Provider value={{ modules: fallbackModules }}>
        {children}
      </ModulesContext.Provider>
    );
  }
};

export default ModulesProvider;
