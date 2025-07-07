
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from Supabase
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('favorite_modules')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading favorites:', error);
        // Fallback to localStorage
        const savedFavorites = localStorage.getItem('module-favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } else if (data) {
        setFavorites(data.favorite_modules || []);
        // Sync to localStorage as backup
        localStorage.setItem('module-favorites', JSON.stringify(data.favorite_modules || []));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save favorites to Supabase
  const saveFavorites = async (newFavorites: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_modules: newFavorites
        });

      if (error) {
        console.error('Error saving favorites:', error);
        // Silent fallback - favorites still saved locally
      }

      // Always save to localStorage as backup
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    }
  };

  // Toggle favorite with optimistic updates
  const toggleFavorite = async (moduleId: string) => {
    const newFavorites = favorites.includes(moduleId) 
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    
    // Immediate UI update (optimistic)
    setFavorites(newFavorites);
    
    try {
      await saveFavorites(newFavorites);
    } catch (error) {
      // Revert on error
      setFavorites(favorites);
      console.error('Failed to save favorites:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    toggleFavorite,
    reload: loadFavorites
  };
};
