
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ModulesContextType {
  activeModule: string | null;
  setActiveModule: (moduleId: string | null) => void;
  moduleHistory: string[];
  addToHistory: (moduleId: string) => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

interface ModulesProviderProps {
  children: ReactNode;
}

export const ModulesProvider: React.FC<ModulesProviderProps> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [moduleHistory, setModuleHistory] = useState<string[]>([]);

  const addToHistory = (moduleId: string) => {
    setModuleHistory(prev => {
      const filtered = prev.filter(id => id !== moduleId);
      return [moduleId, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  useEffect(() => {
    if (activeModule) {
      addToHistory(activeModule);
    }
  }, [activeModule]);

  return (
    <ModulesContext.Provider value={{
      activeModule,
      setActiveModule,
      moduleHistory,
      addToHistory
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
