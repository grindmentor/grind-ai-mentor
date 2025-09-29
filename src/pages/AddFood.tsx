import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AddFood = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMealType = searchParams.get('meal') || 'breakfast';
  const initialFoodName = searchParams.get('name') || '';

  const [foodName, setFoodName] = useState(initialFoodName);
  const [portionSize, setPortionSize] = useState('');
  const [mealType, setMealType] = useState(initialMealType);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');

  useEffect(() => {
    if (initialFoodName) {
      setFoodName(initialFoodName);
    }
  }, [initialFoodName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName || !calories || !protein || !carbs || !fat) {
      toast.error('Please fill in all required fields');
      return;
    }

    const foodData = {
      name: foodName,
      portion_size: portionSize || '1 serving',
      meal_type: mealType,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      fiber: fiber ? parseFloat(fiber) : 0,
      timestamp: new Date().toISOString()
    };

    // Store in sessionStorage to pass back to SmartFoodLog
    sessionStorage.setItem('newFoodEntry', JSON.stringify(foodData));
    
    toast.success('Food added successfully!');
    navigate('/smart-food-log');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-red-900/20 pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/smart-food-log')}
          className="mb-4 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Food Log
        </Button>

        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-orange-400 mb-2">Add Custom Food</h1>
          <p className="text-gray-400 text-sm mb-6">
            Manually input nutritional information for custom foods
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="foodName" className="text-white">Food Name *</Label>
              <Input
                id="foodName"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Chicken Breast"
                required
              />
            </div>

            <div>
              <Label htmlFor="portionSize" className="text-white">Portion Size</Label>
              <Input
                id="portionSize"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., 100g, 1 cup, 1 serving"
              />
            </div>

            <div>
              <Label htmlFor="mealType" className="text-white">Meal Type *</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories" className="text-white">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  step="0.1"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 200"
                  required
                />
              </div>

              <div>
                <Label htmlFor="protein" className="text-white">Protein (g) *</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carbs" className="text-white">Carbs (g) *</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fat" className="text-white">Fat (g) *</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 5"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fiber" className="text-white">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., 2"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/smart-food-log')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Add Food
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
