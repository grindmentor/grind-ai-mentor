
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface FoodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodData: any) => void;
  selectedDate: string;
}

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate
}) => {
  const [foodData, setFoodData] = useState({
    food_name: '',
    portion_size: '',
    meal_type: 'lunch',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  const handleSave = () => {
    if (!foodData.food_name.trim()) return;

    onSave({
      ...foodData,
      food_name: `✍️ ${foodData.food_name}`,
      calories: foodData.calories ? parseInt(foodData.calories) : null,
      protein: foodData.protein ? parseFloat(foodData.protein) : null,
      carbs: foodData.carbs ? parseFloat(foodData.carbs) : null,
      fat: foodData.fat ? parseFloat(foodData.fat) : null,
      fiber: foodData.fiber ? parseFloat(foodData.fiber) : null,
      logged_date: selectedDate
    });

    // Reset form
    setFoodData({
      food_name: '',
      portion_size: '',
      meal_type: 'lunch',
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
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-orange-400">Add Custom Food</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-orange-200">Food Name</Label>
            <Input
              value={foodData.food_name}
              onChange={(e) => setFoodData(prev => ({ ...prev, food_name: e.target.value }))}
              placeholder="Enter food name"
              className="bg-orange-900/30 border-orange-500/50 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-orange-200">Portion Size</Label>
              <Input
                value={foodData.portion_size}
                onChange={(e) => setFoodData(prev => ({ ...prev, portion_size: e.target.value }))}
                placeholder="e.g., 100g, 1 cup"
                className="bg-orange-900/30 border-orange-500/50 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Meal Type</Label>
              <Select 
                value={foodData.meal_type} 
                onValueChange={(value) => setFoodData(prev => ({ ...prev, meal_type: value }))}
              >
                <SelectTrigger className="bg-orange-900/30 border-orange-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-orange-800 border-orange-500/30">
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🥨 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-orange-200">Calories</Label>
              <Input
                type="number"
                value={foodData.calories}
                onChange={(e) => setFoodData(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="0"
                className="bg-orange-900/30 border-orange-500/50 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Protein (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.protein}
                onChange={(e) => setFoodData(prev => ({ ...prev, protein: e.target.value }))}
                placeholder="0"
                className="bg-orange-900/30 border-orange-500/50 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-orange-200">Carbs (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.carbs}
                onChange={(e) => setFoodData(prev => ({ ...prev, carbs: e.target.value }))}
                placeholder="0"
                className="bg-orange-900/30 border-orange-500/50 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Fat (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.fat}
                onChange={(e) => setFoodData(prev => ({ ...prev, fat: e.target.value }))}
                placeholder="0"
                className="bg-orange-900/30 border-orange-500/50 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Fiber (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.fiber}
                onChange={(e) => setFoodData(prev => ({ ...prev, fiber: e.target.value }))}
                placeholder="0"
                className="bg-orange-900/30 border-orange-500/50 text-white"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!foodData.food_name.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Food
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
