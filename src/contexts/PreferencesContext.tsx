
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types/userPreferences';

interface PreferencesContextType {
  preferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  updatePreferences: (newPreferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  isLoading: boolean;
}

const defaultPreferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  weight_unit: 'lbs',
  height_unit: 'ft-in',
  notifications: true,
  email_updates: true,
  dark_mode: true
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPreferences({
          weight_unit: data.weight_unit || 'lbs',
          height_unit: data.height_unit || 'ft-in',
          notifications: data.notifications ?? true,
          email_updates: data.email_updates ?? true,
          dark_mode: data.dark_mode ?? true
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<typeof preferences>) => {
    if (!user) return;

    // Update local state immediately
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    // Save to database
    try {
      const { error } = await (supabase as any)
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences
        });

      if (error) {
        console.error('Error saving preferences:', error);
        // Revert local state on error
        setPreferences(preferences);
        throw error;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
