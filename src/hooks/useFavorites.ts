
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('favorite_modules')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
        return;
      }

      // If no profile exists, we'll create it when they first favorite something
      if (!profile) {
        setFavorites([]);
        return;
      }

      setFavorites(profile.favorite_modules || []);
    } catch (error) {
      console.error('Unexpected error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (moduleId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites.',
        variant: 'destructive',
      });
      return;
    }

    if (updating) {
      return; // Prevent multiple simultaneous updates
    }

    setUpdating(true);

    try {
      const isCurrentlyFavorited = favorites.includes(moduleId);
      const newFavorites = isCurrentlyFavorited
        ? favorites.filter(id => id !== moduleId)
        : [...favorites, moduleId];

      // Optimistic update
      setFavorites(newFavorites);

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          favorite_modules: newFavorites
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: isCurrentlyFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `Module has been ${isCurrentlyFavorited ? 'removed from' : 'added to'} your favorites.`,
      });

    } catch (error) {
      console.error('Error updating favorites:', error);
      
      // Revert optimistic update on error
      await loadFavorites();
      
      toast({
        title: 'Failed to update favorites',
        description: 'Please try again. If the problem persists, refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const isFavorite = (moduleId: string) => favorites.includes(moduleId);

  const addToFavorites = async (moduleId: string) => {
    if (!isFavorite(moduleId)) {
      await toggleFavorite(moduleId);
    }
  };

  const removeFromFavorites = async (moduleId: string) => {
    if (isFavorite(moduleId)) {
      await toggleFavorite(moduleId);
    }
  };

  return {
    favorites,
    loading,
    updating,
    toggleFavorite,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    refreshFavorites: loadFavorites,
  };
};
