import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
  editingGoal?: Goal | null;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

const primaryGoalOptions = [
  { value: 'cut', label: 'Cut (Lose Weight)', description: 'Focus on fat loss and maintaining muscle' },
  { value: 'bulk', label: 'Bulk (Gain Weight)', description: 'Focus on muscle building and weight gain' },
  { value: 'maintenance', label: 'Maintenance (Maintain Weight)', description: 'Maintain current weight and body composition' }
];

const categoryOptions = {
  weight: [
    { value: 'lose-fat', label: 'Lose Fat', unit: 'lbs' },
    { value: 'gain-weight', label: 'Gain Weight', unit: 'lbs' },
    { value: 'maintain-weight', label: 'Maintain Weight', unit: 'lbs' }
  ],
  strength: [
    { value: 'bench-press', label: 'Bench Press PR', unit: 'lbs' },
    { value: 'squat', label: 'Squat PR', unit: 'lbs' },
    { value: 'deadlift', label: 'Deadlift PR', unit: 'lbs' },
    { value: 'overhead-press', label: 'Overhead Press PR', unit: 'lbs' }
  ],
  cardio: [
    { value: 'running-distance', label: 'Running Distance', unit: 'miles' },
    { value: 'cycling-distance', label: 'Cycling Distance', unit: 'miles' },
    { value: 'swimming-distance', label: 'Swimming Distance', unit: 'meters' }
  ],
  nutrition: [
    { value: 'calorie-intake', label: 'Calorie Intake', unit: 'calories' },
    { value: 'protein-intake', label: 'Protein Intake', unit: 'grams' },
    { value: 'water-intake', label: 'Water Intake', unit: 'liters' }
  ]
};

export const GoalCreationModal: React.FC<GoalCreationModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
  editingGoal
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState<number | undefined>(undefined);
  const [currentValue, setCurrentValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [primaryGoal, setPrimaryGoal] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description);
      setTargetValue(editingGoal.target_value);
      setCurrentValue(editingGoal.current_value);
      setUnit(editingGoal.unit);
      setCategory(editingGoal.category);
      setDeadline(new Date(editingGoal.deadline));
    } else {
      setTitle('');
      setDescription('');
      setTargetValue(undefined);
      setCurrentValue(undefined);
      setUnit('');
      setCategory('');
      setDeadline(undefined);
    }
  }, [editingGoal]);

  const handleSubmit = async () => {
    if (!user || !title || !description || !targetValue || !unit || !category || !deadline) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const deadlineString = deadline.toISOString();

      if (editingGoal) {
        const { error } = await supabase
          .from('user_goals')
          .update({
            title,
            description,
            target_value: targetValue,
            current_value: currentValue,
            unit,
            category,
            deadline: deadlineString
          })
          .eq('id', editingGoal.id);

        if (error) throw error;
        toast.success('Goal updated successfully!');
      } else {
        const { error } = await supabase
          .from('user_goals')
          .insert({
            user_id: user.id,
            title,
            description,
            target_value: targetValue,
            current_value: currentValue || 0,
            unit,
            category,
            deadline: deadlineString,
            status: 'active'
          });

        if (error) throw error;
        toast.success('Goal created successfully!');
      }

      onGoalCreated();
    } catch (error) {
      console.error('Error creating/updating goal:', error);
      toast.error('Failed to create/update goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Primary Goal Selection */}
          <div className="space-y-2">
            <Label className="text-white">Primary Goal</Label>
            <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {primaryGoalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-400">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal Category */}
          <div className="space-y-2">
            <Label className="text-white">Goal Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="weight" className="text-white hover:bg-gray-700">Weight</SelectItem>
                <SelectItem value="strength" className="text-white hover:bg-gray-700">Strength</SelectItem>
                <SelectItem value="cardio" className="text-white hover:bg-gray-700">Cardio</SelectItem>
                <SelectItem value="nutrition" className="text-white hover:bg-gray-700">Nutrition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label className="text-white">Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Goal description"
              className="bg-gray-800 border-gray-600 text-white resize-none"
            />
          </div>

          {/* Target Value Input */}
          <div className="space-y-2">
            <Label className="text-white">Target Value</Label>
            <Input
              type="number"
              value={targetValue !== undefined ? targetValue.toString() : ''}
              onChange={(e) => setTargetValue(parseFloat(e.target.value))}
              placeholder="Target value"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Current Value Input */}
          <div className="space-y-2">
            <Label className="text-white">Current Value</Label>
            <Input
              type="number"
              value={currentValue !== undefined ? currentValue.toString() : ''}
              onChange={(e) => setCurrentValue(parseFloat(e.target.value))}
              placeholder="Current value (optional)"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Unit Input */}
          <div className="space-y-2">
            <Label className="text-white">Unit</Label>
            <Input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unit (e.g., lbs, kg, miles)"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Deadline Datepicker */}
          <div className="space-y-2">
            <Label className="text-white">Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className="w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : editingGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
