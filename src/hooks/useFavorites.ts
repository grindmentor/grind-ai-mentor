import { useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from './useOptimizedDataLoader';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: favorites = [], loading, error } = useUserPreferences(user?.id);
  const [optimisticFavorites, setOptimisticFavorites] = useState<string[] | null>(null);
  const savingRef = useRef<boolean>(false);

  // Use optimistic favorites when available, otherwise use cached data
  const currentFavorites = useMemo(() => 
    optimisticFavorites !== null ? optimisticFavorites : favorites,
    [optimisticFavorites, favorites]
  );

  // Save favorites to Supabase with optimized updates
  const saveFavorites = useCallback(async (newFavorites: string[]) => {
    if (!user || savingRef.current) return;
    
    savingRef.current = true;
    
    try {
      console.log('Saving favorites to Supabase:', newFavorites);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_modules: newFavorites
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving favorites to Supabase:', error);
        throw error;
      }

      console.log('Successfully saved favorites to Supabase');
      
      // Clear optimistic state after a delay to allow UI to settle
      setTimeout(() => {
        setOptimisticFavorites(null);
      }, 100);
      
      // Save to localStorage as backup
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      // Still save to localStorage as fallback
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
      throw error;
    } finally {
      savingRef.current = false;
    }
  }, [user]);

  // Toggle favorite with optimistic updates
  const toggleFavorite = useCallback(async (moduleId: string) => {
    console.log('Toggle favorite called for module:', moduleId);
    console.log('Current favorites:', currentFavorites);
    
    const newFavorites = currentFavorites.includes(moduleId) 
      ? currentFavorites.filter(id => id !== moduleId)
      : [...currentFavorites, moduleId];
    
    console.log('New favorites will be:', newFavorites);
    
    // Immediate UI update (optimistic)
    setOptimisticFavorites(newFavorites);
    
    try {
      await saveFavorites(newFavorites);
      console.log('Favorites saved successfully:', newFavorites);
      
      toast({
        title: currentFavorites.includes(moduleId) ? "Removed from Favorites" : "Added to Favorites",
        description: `Module ${currentFavorites.includes(moduleId) ? 'removed from' : 'added to'} your favorites.`
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFavorites(null);
      console.error('Failed to save favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  }, [currentFavorites, saveFavorites, toast]);

  // Reload function for manual refresh
  const reload = useCallback(() => {
    setOptimisticFavorites(null);
    // The useUserPreferences hook will handle the actual reload
  }, []);

  return {
    favorites: currentFavorites,
    loading,
    error,
    toggleFavorite,
    reload
  };
};