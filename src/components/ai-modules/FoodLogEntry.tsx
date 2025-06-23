
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FoodLogEntryProps {
  entry: {
    id: string;
    food_name: string;
    meal_type: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    portion_size?: string;
    logged_date: string;
  };
  onDelete: (id: string) => void;
}

const FoodLogEntry = ({ entry, onDelete }: FoodLogEntryProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('food_log_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      onDelete(entry.id);
      toast({
        title: "Food removed",
        description: `${entry.food_name} has been removed from your log`,
      });
    } catch (error) {
      console.error('Error deleting food entry:', error);
      toast({
        title: "Error removing food",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'lunch': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'dinner': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'snack': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-white">{entry.food_name}</h3>
              <Badge className={getMealTypeColor(entry.meal_type)}>
                {entry.meal_type}
              </Badge>
            </div>
            
            {entry.portion_size && (
              <p className="text-sm text-gray-400 mb-2">Portion: {entry.portion_size}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              {entry.calories && (
                <div>
                  <div className="font-medium text-white">{entry.calories}</div>
                  <div className="text-gray-400">Calories</div>
                </div>
              )}
              {entry.protein && (
                <div>
                  <div className="font-medium text-white">{entry.protein}g</div>
                  <div className="text-gray-400">Protein</div>
                </div>
              )}
              {entry.carbs && (
                <div>
                  <div className="font-medium text-white">{entry.carbs}g</div>
                  <div className="text-gray-400">Carbs</div>
                </div>
              )}
              {entry.fat && (
                <div>
                  <div className="font-medium text-white">{entry.fat}g</div>
                  <div className="text-gray-400">Fat</div>
                </div>
              )}
              {entry.fiber && (
                <div>
                  <div className="font-medium text-white">{entry.fiber}g</div>
                  <div className="text-gray-400">Fiber</div>
                </div>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodLogEntry;
