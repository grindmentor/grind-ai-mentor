import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

const FAVORITES_CACHE_KEY = 'myotopia-favorites-cache';

// Get cached favorites immediately (sync)
const getCachedFavorites = (userId: string): string[] | null => {
  try {
    const cached = sessionStorage.getItem(`${FAVORITES_CACHE_KEY}-${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    // Fallback to localStorage
    const localCached = localStorage.getItem('module-favorites');
    if (localCached) {
      return JSON.parse(localCached);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

// Set cached favorites
const setCachedFavorites = (userId: string, favorites: string[]) => {
  try {
    sessionStorage.setItem(`${FAVORITES_CACHE_KEY}-${userId}`, JSON.stringify(favorites));
    localStorage.setItem('module-favorites', JSON.stringify(favorites));
  } catch {
    // Ignore storage errors
  }
};

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize from cache immediately (no loading state needed if cached)
  const cachedFavorites = user ? getCachedFavorites(user.id) : null;
  const [favorites, setFavorites] = useState<string[]>(cachedFavorites || []);
  const [loading, setLoading] = useState(!cachedFavorites);
  const loadingRef = useRef(false);
  const syncedRef = useRef(false);

  // Background sync with Supabase (non-blocking)
  const syncFavorites = useCallback(async () => {
    if (!user || loadingRef.current || syncedRef.current) return;
    
    loadingRef.current = true;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('favorite_modules')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Error but not "no rows" - keep using cache
        console.warn('Favorites sync error:', error.message);
      } else if (data) {
        const serverFavorites = data.favorite_modules || [];
        setFavorites(serverFavorites);
        setCachedFavorites(user.id, serverFavorites);
      }
      syncedRef.current = true;
    } catch (error) {
      console.warn('Favorites sync failed:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user]);

  // Save favorites to Supabase
  const saveFavorites = async (newFavorites: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_modules: newFavorites
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      setCachedFavorites(user.id, newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
      setCachedFavorites(user.id, newFavorites);
      throw error;
    }
  };

  // Toggle favorite with optimistic updates
  const toggleFavorite = useCallback(async (moduleId: string) => {
    const newFavorites = favorites.includes(moduleId) 
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    
    // Immediate UI update (optimistic)
    setFavorites(newFavorites);
    if (user) setCachedFavorites(user.id, newFavorites);
    triggerHapticFeedback('light');
    
    try {
      await saveFavorites(newFavorites);
      
      toast({
        title: favorites.includes(moduleId) ? "Removed from Favorites" : "Added to Favorites",
        description: `Module ${favorites.includes(moduleId) ? 'removed from' : 'added to'} your favorites.`
      });
    } catch (error) {
      // Revert on error
      setFavorites(favorites);
      if (user) setCachedFavorites(user.id, favorites);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  }, [favorites, user, toast]);

  // Reorder favorites with haptic feedback
  const reorderFavorites = useCallback(async (newOrder: string[]) => {
    setFavorites(newOrder);
    if (user) setCachedFavorites(user.id, newOrder);
    
    try {
      await saveFavorites(newOrder);
    } catch (error) {
      console.error('Failed to save favorites order:', error);
    }
  }, [user]);

  // Sync on mount (background, non-blocking)
  useEffect(() => {
    if (user) {
      // If we have cached data, mark as not loading immediately
      const cached = getCachedFavorites(user.id);
      if (cached) {
        setFavorites(cached);
        setLoading(false);
      }
      // Background sync
      syncFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
      syncedRef.current = false;
    }
  }, [user, syncFavorites]);

  return {
    favorites,
    loading,
    toggleFavorite,
    reorderFavorites,
    reload: syncFavorites
  };
};
