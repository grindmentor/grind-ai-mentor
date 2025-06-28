
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorite_modules')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading favorites:', error);
        return;
      }

      setFavorites(data?.favorite_modules || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
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

    const newFavorites = favorites.includes(moduleId)
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];

    setFavorites(newFavorites);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_modules: newFavorites })
        .eq('id', user.id);

      if (error) throw error;

      // Removed sync warning - just show success message
      toast({
        title: favorites.includes(moduleId) ? 'Removed from favorites' : 'Added to favorites',
        description: `${moduleId} has been ${favorites.includes(moduleId) ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert the local state change
      setFavorites(favorites);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isFavorite = (moduleId: string) => favorites.includes(moduleId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
  };
};
