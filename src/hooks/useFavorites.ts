
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from Supabase with debugging
  const loadFavorites = async () => {
    console.log('Loading favorites for user:', user?.id);
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

      console.log('Favorites query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading favorites:', error);
        // Fallback to localStorage
        const savedFavorites = localStorage.getItem('module-favorites');
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          console.log('Using localStorage favorites:', parsedFavorites);
          setFavorites(parsedFavorites);
        }
      } else if (data) {
        const favoritesList = data.favorite_modules || [];
        console.log('Loaded favorites from DB:', favoritesList);
        setFavorites(favoritesList);
        // Sync to localStorage as backup
        localStorage.setItem('module-favorites', JSON.stringify(favoritesList));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        console.log('Using localStorage favorites after error:', parsedFavorites);
        setFavorites(parsedFavorites);
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

  // Toggle favorite with optimistic updates and console logging
  const toggleFavorite = async (moduleId: string) => {
    console.log('Toggle favorite called for module:', moduleId);
    console.log('Current favorites:', favorites);
    
    const newFavorites = favorites.includes(moduleId) 
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    
    console.log('New favorites will be:', newFavorites);
    
    // Immediate UI update (optimistic)
    setFavorites(newFavorites);
    
    try {
      await saveFavorites(newFavorites);
      console.log('Favorites saved successfully');
    } catch (error) {
      // Revert on error
      setFavorites(favorites);
      console.error('Failed to save favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
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
