
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

interface FoodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodData: any) => void;
  defaultMealType: string;
}

const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultMealType
}) => {
  const [foodData, setFoodData] = useState({
    name: '',
    portion: '100',
    mealType: defaultMealType,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFoodData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!foodData.name || !foodData.calories) {
      return;
    }

    const processedData = {
      ...foodData,
      calories: parseInt(foodData.calories) || 0,
      protein: parseFloat(foodData.protein) || 0,
      carbs: parseFloat(foodData.carbs) || 0,
      fat: parseFloat(foodData.fat) || 0,
      fiber: parseFloat(foodData.fiber) || 0
    };

    onSave(processedData);
    
    // Reset form
    setFoodData({
      name: '',
      portion: '100',
      mealType: defaultMealType,
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFoodData({
      name: '',
      portion: '100',
      mealType: defaultMealType,
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-orange-400 flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Add Custom Food
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-orange-200">Food Name *</Label>
              <Input
                value={foodData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Homemade Smoothie"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Portion (g)</Label>
              <Input
                type="number"
                value={foodData.portion}
                onChange={(e) => handleInputChange('portion', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Meal Type</Label>
              <Select value={foodData.mealType} onValueChange={(value) => handleInputChange('mealType', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🥨 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-orange-200">Calories *</Label>
              <Input
                type="number"
                value={foodData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Protein (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Carbs (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Fat (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.fat}
                onChange={(e) => handleInputChange('fat', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-orange-200">Fiber (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={foodData.fiber}
                onChange={(e) => handleInputChange('fiber', e.target.value)}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!foodData.name || !foodData.calories}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Add Food
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodEntryModal;
