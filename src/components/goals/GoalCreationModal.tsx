
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target, Weight, Activity, Flame, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
  editingGoal?: any;
}

const stockGoals = [
  {
    id: 'weight-loss-5kg',
    title: 'Lose 5kg',
    description: 'Achieve a sustainable weight loss of 5 kilograms',
    category: 'weight',
    target_value: 5,
    unit: 'kg',
    duration_weeks: 12
  },
  {
    id: 'weight-loss-10kg',
    title: 'Lose 10kg',
    description: 'Achieve a sustainable weight loss of 10 kilograms',
    category: 'weight',
    target_value: 10,
    unit: 'kg',
    duration_weeks: 20
  },
  {
    id: 'muscle-gain-2kg',
    title: 'Gain 2kg Muscle',
    description: 'Build lean muscle mass through consistent training',
    category: 'weight',
    target_value: 2,
    unit: 'kg',
    duration_weeks: 16
  },
  {
    id: 'weekly-workouts',
    title: '4 Workouts Per Week',
    description: 'Maintain consistent training with 4 weekly sessions',
    category: 'training',
    target_value: 4,
    unit: 'workouts',
    duration_weeks: 8
  },
  {
    id: 'daily-steps',
    title: '10,000 Daily Steps',
    description: 'Achieve 10,000 steps every day for better health',
    category: 'cardio',
    target_value: 10000,
    unit: 'steps',
    duration_weeks: 4
  },
  {
    id: 'strength-bench',
    title: 'Bench Press Body Weight',
    description: 'Press your own body weight on the bench press',
    category: 'strength',
    target_value: 1,
    unit: 'x bodyweight',
    duration_weeks: 24
  },
  {
    id: 'protein-daily',
    title: 'Daily Protein Goal',
    description: 'Meet your daily protein target consistently',
    category: 'nutrition',
    target_value: 150,
    unit: 'grams',
    duration_weeks: 4
  }
];

export const GoalCreationModal = ({ isOpen, onClose, onGoalCreated, editingGoal }: GoalCreationModalProps) => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [activeTab, setActiveTab] = useState<'stock' | 'custom'>('stock');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: '',
    unit: '',
    category: '',
    current_value: '0'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setActiveTab('custom');
      setFormData({
        title: editingGoal.title,
        description: editingGoal.description,
        target_value: editingGoal.target_value.toString(),
        unit: editingGoal.unit,
        category: editingGoal.category,
        current_value: editingGoal.current_value.toString()
      });
      setDeadline(new Date(editingGoal.deadline));
    } else {
      // Reset form when creating new goal
      setFormData({
        title: '',
        description: '',
        target_value: '',
        unit: '',
        category: '',
        current_value: '0'
      });
      setDeadline(undefined);
      setSelectedStock(null);
      setActiveTab('stock');
    }
  }, [editingGoal, isOpen]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weight': return Weight;
      case 'strength': return TrendingUp;
      case 'cardio': case 'training': return Activity;
      case 'nutrition': return Flame;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weight': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cardio': case 'training': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'nutrition': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const handleStockGoalSelect = (goalId: string) => {
    const goal = stockGoals.find(g => g.id === goalId);
    if (!goal) return;

    setSelectedStock(goalId);
    
    // Convert weight units if needed
    let targetValue = goal.target_value;
    let unit = goal.unit;
    let description = goal.description;

    if (goal.category === 'weight' && goal.unit === 'kg') {
      if (preferences.weight_unit === 'lbs') {
        targetValue = Math.round(goal.target_value * 2.20462);
        unit = 'lbs';
        description = goal.description.replace(/kilograms?/gi, 'pounds');
      }
    }

    setFormData({
      title: goal.title,
      description: description,
      target_value: targetValue.toString(),
      unit: unit,
      category: goal.category,
      current_value: '0'
    });

    // Set deadline based on duration
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + (goal.duration_weeks * 7));
    setDeadline(deadlineDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !deadline) return;

    setLoading(true);
    try {
      const goalData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        target_value: parseFloat(formData.target_value),
        current_value: parseFloat(formData.current_value),
        unit: formData.unit,
        category: formData.category,
        deadline: deadline.toISOString(),
        status: 'active'
      };

      let result;
      if (editingGoal) {
        result = await supabase
          .from('user_goals')
          .update(goalData)
          .eq('id', editingGoal.id);
      } else {
        result = await supabase
          .from('user_goals')
          .insert([goalData]);
      }

      if (result.error) throw result.error;

      toast.success(editingGoal ? 'Goal updated successfully!' : 'Goal created successfully!');
      onGoalCreated();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const displayStockGoals = stockGoals.map(goal => {
    // Convert weight units for display
    if (goal.category === 'weight' && goal.unit === 'kg' && preferences.weight_unit === 'lbs') {
      return {
        ...goal,
        target_value: Math.round(goal.target_value * 2.20462),
        unit: 'lbs',
        description: goal.description.replace(/kilograms?/gi, 'pounds')
      };
    }
    return goal;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>

        {!editingGoal && (
          <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
            <Button
              type="button"
              variant={activeTab === 'stock' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('stock')}
              className={activeTab === 'stock' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400'}
            >
              Stock Goals
            </Button>
            <Button
              type="button"
              variant={activeTab === 'custom' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('custom')}
              className={activeTab === 'custom' ? 'bg-orange-500 hover:bg-orange-600' : 'text-gray-400'}
            >
              Custom Goal
            </Button>
          </div>
        )}

        {activeTab === 'stock' && !editingGoal && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Choose a Pre-made Goal</h3>
            <div className="grid gap-3">
              {displayStockGoals.map((goal) => {
                const IconComponent = getCategoryIcon(goal.category);
                return (
                  <Card
                    key={goal.id}
                    className={`cursor-pointer transition-all hover:border-orange-500/50 ${
                      selectedStock === goal.id ? 'border-orange-500 bg-orange-500/10' : 'bg-gray-800/50 border-gray-700'
                    }`}
                    onClick={() => handleStockGoalSelect(goal.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(goal.category).split(' ')[0]}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{goal.title}</h4>
                            <Badge className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{goal.description}</p>
                          <p className="text-orange-400 text-sm mt-1">
                            Target: {goal.target_value} {goal.unit} • {goal.duration_weeks} weeks
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedStock && (
              <Button
                onClick={() => setActiveTab('custom')}
                className="w-full bg-orange-500 hover:bg-orange-600 mt-4"
              >
                Customize Selected Goal
              </Button>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-white">Goal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., Lose 5kg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Describe your goal..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="target_value" className="text-white">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.1"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="current_value" className="text-white">Current Value</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.1"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit" className="text-white">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="kg, reps, minutes..."
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
