
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  // Load favorites from Supabase with debugging and deduplication
  const loadFavorites = useCallback(async () => {
    if (loadingRef.current) return; // Prevent concurrent loads
    
    loadingRef.current = true;
    console.log('Loading favorites for user:', user?.id);
    
    if (!user) {
      setFavorites([]);
      setLoading(false);
      loadingRef.current = false;
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
      loadingRef.current = false;
    }
  }, [user]);

  // Save favorites to Supabase
  const saveFavorites = async (newFavorites: string[]) => {
    if (!user) return;

    try {
      console.log('Saving favorites to Supabase:', newFavorites);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_modules: newFavorites
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Error saving favorites to Supabase:', error);
        throw error;
      }

      console.log('Successfully saved favorites to Supabase:', data);
      
      // Always save to localStorage as backup
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      // Still save to localStorage as fallback
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
      throw error;
    }
  };

  // Toggle favorite with optimistic updates and console logging
  const toggleFavorite = useCallback(async (moduleId: string) => {
    console.log('Toggle favorite called for module:', moduleId);
    console.log('Current favorites:', favorites);
    
    const newFavorites = favorites.includes(moduleId) 
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    
    console.log('New favorites will be:', newFavorites);
    
    // Immediate UI update (optimistic)
    setFavorites(newFavorites);
    triggerHapticFeedback('light');
    
    try {
      await saveFavorites(newFavorites);
      console.log('Favorites saved successfully:', newFavorites);
      
      toast({
        title: favorites.includes(moduleId) ? "Removed from Favorites" : "Added to Favorites",
        description: `Module ${favorites.includes(moduleId) ? 'removed from' : 'added to'} your favorites.`
      });
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
  }, [favorites, saveFavorites, toast]);

  // Reorder favorites with haptic feedback
  const reorderFavorites = useCallback(async (newOrder: string[]) => {
    console.log('Reordering favorites:', newOrder);
    
    // Immediate UI update
    setFavorites(newOrder);
    
    try {
      await saveFavorites(newOrder);
      console.log('Favorites order saved successfully');
    } catch (error) {
      console.error('Failed to save favorites order:', error);
      // Don't revert as the visual order is still correct
    }
  }, [saveFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    toggleFavorite,
    reorderFavorites,
    reload: loadFavorites
  };
};
