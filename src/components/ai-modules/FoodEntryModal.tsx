
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FoodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodEntry: any) => void;
}

const FoodEntryModal: React.FC<FoodEntryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [foodEntry, setFoodEntry] = useState({
    food_name: '',
    portion_size: '',
    meal_type: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFoodEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!foodEntry.food_name || !foodEntry.meal_type) {
      toast.error('Please fill in food name and meal type');
      return;
    }

    const processedEntry = {
      ...foodEntry,
      calories: parseInt(foodEntry.calories) || 0,
      protein: parseFloat(foodEntry.protein) || 0,
      carbs: parseFloat(foodEntry.carbs) || 0,
      fat: parseFloat(foodEntry.fat) || 0,
      fiber: parseFloat(foodEntry.fiber) || 0
    };

    onSave(processedEntry);
    setFoodEntry({
      food_name: '',
      portion_size: '',
      meal_type: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-400">
            <Plus className="w-5 h-5 mr-2" />
            Add Food Entry
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Manually add a food entry with accurate nutritional information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Food Name */}
          <div className="space-y-2">
            <Label htmlFor="food_name" className="text-white">Food Name *</Label>
            <Input
              id="food_name"
              value={foodEntry.food_name}
              onChange={(e) => handleInputChange('food_name', e.target.value)}
              placeholder="e.g., Grilled Chicken Breast"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Portion Size */}
          <div className="space-y-2">
            <Label htmlFor="portion_size" className="text-white">Portion Size</Label>
            <Input
              id="portion_size"
              value={foodEntry.portion_size}
              onChange={(e) => handleInputChange('portion_size', e.target.value)}
              placeholder="e.g., 1 cup, 100g, 1 medium"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Meal Type */}
          <div className="space-y-2">
            <Label htmlFor="meal_type" className="text-white">Meal Type *</Label>
            <Select value={foodEntry.meal_type} onValueChange={(value) => handleInputChange('meal_type', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Macronutrients */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-white">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={foodEntry.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein" className="text-white">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={foodEntry.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-white">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={foodEntry.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat" className="text-white">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={foodEntry.fat}
                onChange={(e) => handleInputChange('fat', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="space-y-2">
            <Label htmlFor="fiber" className="text-white">Fiber (g)</Label>
            <Input
              id="fiber"
              type="number"
              step="0.1"
              value={foodEntry.fiber}
              onChange={(e) => handleInputChange('fiber', e.target.value)}
              placeholder="0"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Add Food Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodEntryModal;
