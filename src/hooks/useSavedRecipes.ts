import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedRecipe {
  id: string;
  name: string;
  description: string | null;
  cook_time: string | null;
  protein: number;
  calories: number;
  carbs: number | null;
  fat: number | null;
  sodium: number | null;
  fiber: number | null;
  sugar: number | null;
  ingredients: string[];
  instructions: string[];
  source: string;
  meal_type: string | null;
  created_at: string;
}

export function useSavedRecipes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recipes
  const loadRecipes = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Save a recipe
  const saveRecipe = async (recipe: {
    name: string;
    description?: string;
    cook_time?: string;
    protein: number;
    calories: number;
    carbs?: number;
    fat?: number;
    sodium?: number;
    fiber?: number;
    sugar?: number;
    ingredients: string[];
    instructions: string[];
    source?: string;
    meal_type?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          name: recipe.name,
          description: recipe.description || null,
          cook_time: recipe.cook_time || null,
          protein: recipe.protein,
          calories: recipe.calories,
          carbs: recipe.carbs || null,
          fat: recipe.fat || null,
          sodium: recipe.sodium || null,
          fiber: recipe.fiber || null,
          sugar: recipe.sugar || null,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          source: recipe.source || 'manual',
          meal_type: recipe.meal_type || null,
        });

      if (error) throw error;

      toast({
        title: 'Recipe saved!',
        description: `${recipe.name} added to your recipes`,
      });

      await loadRecipes();
      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: 'Error saving recipe',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Recipe deleted',
      });

      setRecipes(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error deleting recipe',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    recipes,
    isLoading,
    saveRecipe,
    deleteRecipe,
    loadRecipes,
  };
}
