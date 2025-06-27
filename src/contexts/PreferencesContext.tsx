
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types/userPreferences';
import { useToast } from '@/hooks/use-toast';

interface PreferencesContextType {
  preferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  updatePreference: (field: keyof Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: any) => Promise<void>;
  isLoading: boolean;
}

const defaultPreferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  weight_unit: 'kg',
  height_unit: 'cm',
  notifications: true,
  email_updates: true,
  dark_mode: true
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          weight_unit: data.weight_unit || 'kg',
          height_unit: data.height_unit || 'cm',
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

  const updatePreference = async (field: keyof typeof defaultPreferences, value: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          [field]: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [field]: value }));
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error updating preferences",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  );
};
