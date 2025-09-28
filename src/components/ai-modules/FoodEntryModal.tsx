
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface FoodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (foodData: {
    food_name: string;
    portion_size: string;
    meal_type: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => void;
  mealType: string;
  initialFoodName?: string;
}

const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  isOpen,
  onClose,
  onAddFood,
  mealType,
  initialFoodName = ''
}) => {
  const [foodName, setFoodName] = useState('');
  const [portionSize, setPortionSize] = useState('100');
  const [selectedMealType, setSelectedMealType] = useState(mealType);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('0');

  // Set initial food name when prop changes
  useEffect(() => {
    if (initialFoodName && isOpen) {
      setFoodName(initialFoodName);
    }
  }, [initialFoodName, isOpen]);

  const handleSubmit = () => {
    if (!foodName || !calories || !protein || !carbs || !fat) {
      return;
    }

    onAddFood({
      food_name: `📝 ${foodName}`,
      portion_size: `${portionSize}g`,
      meal_type: selectedMealType,
      calories: parseInt(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      fiber: parseFloat(fiber)
    });

    // Reset form
    setFoodName('');
    setPortionSize('100');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('0');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white w-[95vw] max-w-md mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-400">Add Custom Food</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the nutritional information for your custom food item
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-orange-200">Food Name</Label>
            <Input
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Homemade Protein Shake"
              className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-orange-200">Portion (grams)</Label>
              <Input
                type="number"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                className="bg-orange-800/50 border-orange-500/30 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Meal Type</Label>
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger className="bg-orange-800/50 border-orange-500/30 text-white">
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
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="250"
                className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Protein (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="25.0"
                className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-orange-200">Carbs (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="30.0"
                className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Fat (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="10.0"
                className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
              />
            </div>
          </div>

          <div>
            <Label className="text-orange-200">Fiber (g)</Label>
            <Input
              type="number"
              step="0.1"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              placeholder="2.0"
              className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            disabled={!foodName || !calories || !protein || !carbs || !fat}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodEntryModal;
