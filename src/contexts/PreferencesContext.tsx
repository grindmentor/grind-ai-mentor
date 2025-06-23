
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

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
      console.log('Loading preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        console.log('Loaded preferences:', data);
        setPreferences({
          weight_unit: data.weight_unit || 'kg',
          height_unit: data.height_unit || 'cm',
          notifications: data.notifications ?? true,
          email_updates: data.email_updates ?? true,
          dark_mode: data.dark_mode ?? true
        });
      } else {
        console.log('No preferences found, creating default preferences');
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error in loadPreferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          ...defaultPreferences
        });

      if (error) {
        console.error('Error creating default preferences:', error);
      } else {
        console.log('Created default preferences');
      }
    } catch (error) {
      console.error('Error in createDefaultPreferences:', error);
    }
  };

  const updatePreference = async (field: keyof typeof preferences, value: any) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    console.log(`Updating preference ${field} to:`, value);

    // Update local state immediately
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          [field]: value
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error(`Error updating ${field}:`, error);
        // Revert local state on error
        setPreferences(preferences);
        toast({
          title: "Error saving preference",
          description: `Failed to update ${field}. Please try again.`,
          variant: "destructive",
        });
        throw error;
      } else {
        console.log(`Successfully updated ${field}`);
        toast({
          title: "Preference saved",
          description: `${field.replace('_', ' ')} updated successfully`,
        });
      }
    } catch (error) {
      console.error(`Error in updatePreference for ${field}:`, error);
      throw error;
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference, isLoading }}>
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
