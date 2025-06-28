
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
      console.log('Loading favorites for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('favorite_modules')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading favorites:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating one...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              favorite_modules: []
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
            setFavorites([]);
          }
        }
        return;
      }

      console.log('Loaded favorites:', data?.favorite_modules);
      setFavorites(data?.favorite_modules || []);
    } catch (error) {
      console.error('Error in loadFavorites:', error);
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

    console.log('Toggling favorite for module:', moduleId);
    console.log('Current favorites:', favorites);

    const isCurrentlyFavorited = favorites.includes(moduleId);
    const newFavorites = isCurrentlyFavorited
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];

    console.log('New favorites will be:', newFavorites);

    // Optimistic update
    setFavorites(newFavorites);

    try {
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
        console.error('Error updating favorites:', error);
        throw error;
      }

      console.log('Successfully updated favorites');
      toast({
        title: isCurrentlyFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `${moduleId} has been ${isCurrentlyFavorited ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      // Revert the optimistic update
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
