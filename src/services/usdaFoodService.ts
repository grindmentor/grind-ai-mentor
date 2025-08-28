
import { supabase } from '@/integrations/supabase/client';

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients: USDANutrient[];
}

interface USDASearchResponse {
  foods: USDAFoodItem[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

class USDAFoodService {
  private cache = new Map<string, { data: USDASearchResponse; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async searchFoods(query: string, pageSize = 20): Promise<USDASearchResponse> {
    const cacheKey = `${query}_${pageSize}`;
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      console.log('Invoking usda-food-proxy', { q: query.trim(), pageSize });
      const { data, error } = await supabase.functions.invoke('usda-food-proxy', {
        body: { query: query.trim(), pageSize }
      });

      if (error) {
        console.error('USDA proxy error:', error);
        throw new Error(error.message || 'Failed to search foods');
      }

      if (!data) {
        throw new Error('No data returned from USDA search');
      }

      // Cache the results
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('USDA API search error:', error);
      throw error;
    }
  }

  private prioritizeResults(foods: USDAFoodItem[]): USDAFoodItem[] {
    // Priority order: Survey (FNDDS) > Foundation > Branded > SR Legacy
    const priorityOrder = {
      'Survey (FNDDS)': 1,
      'Foundation': 2,
      'Branded': 3,
      'SR Legacy': 4
    };

    return foods
      .filter(food => food.foodNutrients && food.foodNutrients.length > 0)
      .sort((a, b) => {
        const aPriority = priorityOrder[a.dataType as keyof typeof priorityOrder] || 5;
        const bPriority = priorityOrder[b.dataType as keyof typeof priorityOrder] || 5;
        return aPriority - bPriority;
      })
      .slice(0, 20); // Limit to 20 results
  }

  extractNutrients(food: USDAFoodItem) {
    const nutrients = food.foodNutrients;
    
    // USDA nutrient IDs (consistent across all data types)
    const findNutrient = (nutrientIds: number[]) => {
      for (const id of nutrientIds) {
        const nutrient = nutrients.find(n => n.nutrientId === id);
        if (nutrient) return nutrient.value;
      }
      return 0;
    };

    return {
      calories: findNutrient([1008]), // Energy (kcal)
      protein: findNutrient([1003]), // Protein
      carbs: findNutrient([1005, 1050]), // Carbohydrate, by difference OR Total carbohydrate
      fat: findNutrient([1004]), // Total lipid (fat)
      fiber: findNutrient([1079]), // Fiber, total dietary
      sugar: findNutrient([2000]), // Sugars, total including NLEA
      sodium: findNutrient([1093]), // Sodium, Na (mg)
      servingSize: food.servingSize || 100,
      servingSizeUnit: food.servingSizeUnit || 'g'
    };
  }

  formatFoodDisplay(food: USDAFoodItem) {
    const nutrients = this.extractNutrients(food);
    
    return {
      fdcId: food.fdcId,
      name: food.description,
      brand: food.brandOwner || food.brandName || null,
      dataType: food.dataType,
      calories: Math.round(nutrients.calories),
      protein: Math.round(nutrients.protein * 10) / 10,
      carbs: Math.round(nutrients.carbs * 10) / 10,
      fat: Math.round(nutrients.fat * 10) / 10,
      fiber: Math.round(nutrients.fiber * 10) / 10,
      servingSize: nutrients.servingSize,
      servingSizeUnit: nutrients.servingSizeUnit,
      householdServing: food.householdServingFullText || null
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

export const usdaFoodService = new USDAFoodService();
export type { USDAFoodItem, USDASearchResponse };
