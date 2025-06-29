
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface FoodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: {
    name: string;
    portion: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => void;
  mealType: string;
}

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  isOpen,
  onClose,
  onAddFood,
  mealType
}) => {
  const [formData, setFormData] = useState({
    name: '',
    portion: '',
    mealType: mealType,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.portion || !formData.calories) {
      return;
    }

    onAddFood({
      name: `✏️ ${formData.name}`,
      portion: formData.portion,
      mealType: formData.mealType,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
      fiber: parseFloat(formData.fiber) || 0
    });

    // Reset form
    setFormData({
      name: '',
      portion: '',
      mealType: mealType,
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    });

    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-orange-200">Add Custom Food Entry</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-orange-200">Food Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Homemade Pizza Slice"
              className="bg-orange-800/50 border-orange-500/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-orange-200">Portion Size *</Label>
            <Input
              value={formData.portion}
              onChange={(e) => handleInputChange('portion', e.target.value)}
              placeholder="e.g., 1 slice, 100g, 1 cup"
              className="bg-orange-800/50 border-orange-500/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-orange-200">Meal Type</Label>
            <Select 
              value={formData.mealType} 
              onValueChange={(value) => handleInputChange('mealType', value)}
            >
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-orange-200">Calories *</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="0"
                className="bg-orange-800/50 border-orange-500/30 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-orange-200">Protein (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                placeholder="0"
                className="bg-orange-800/50 border-orange-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-orange-200">Carbs (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => handleInputChange('carbs', e.target.value)}
                placeholder="0"
                className="bg-orange-800/50 border-orange-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-orange-200">Fat (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.fat}
                onChange={(e) => handleInputChange('fat', e.target.value)}
                placeholder="0"
                className="bg-orange-800/50 border-orange-500/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-orange-200">Fiber (g)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.fiber}
              onChange={(e) => handleInputChange('fiber', e.target.value)}
              placeholder="0"
              className="bg-orange-800/50 border-orange-500/30 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Food
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FoodEntryModal;
