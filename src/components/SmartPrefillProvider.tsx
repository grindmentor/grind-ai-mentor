
import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedCustomerMemory } from '@/hooks/useEnhancedCustomerMemory';

interface SmartPrefillContextType {
  prefills: any;
  updateData: (data: any) => Promise<void>;
  insights: string[];
}

const SmartPrefillContext = createContext<SmartPrefillContextType | undefined>(undefined);

export const useSmartPrefill = () => {
  const context = useContext(SmartPrefillContext);
  if (!context) {
    throw new Error('useSmartPrefill must be used within SmartPrefillProvider');
  }
  return context;
};

interface SmartPrefillProviderProps {
  children: ReactNode;
}

export const SmartPrefillProvider = ({ children }: SmartPrefillProviderProps) => {
  const { getSmartPrefills, updateDetailedData, getPersonalizationInsights } = useEnhancedCustomerMemory();

  return (
    <SmartPrefillContext.Provider value={{
      prefills: getSmartPrefills(),
      updateData: updateDetailedData,
      insights: getPersonalizationInsights()
    }}>
      {children}
    </SmartPrefillContext.Provider>
  );
};
