
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseCreated: (exercise: any) => void;
}

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onExerciseCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_muscles: [] as string[],
    secondary_muscles: [] as string[],
    equipment: '',
    difficulty_level: 'Beginner',
    category: 'Strength',
    technique_notes: ''
  });
  const [newMuscle, setNewMuscle] = useState('');

  const muscleOptions = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Obliques'
  ];

  const equipmentOptions = [
    'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Resistance Band',
    'Kettlebell', 'Medicine Ball', 'Other'
  ];

  const handleAddMuscle = (type: 'primary' | 'secondary') => {
    if (!newMuscle.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [`${type}_muscles`]: [...prev[`${type}_muscles` as keyof typeof prev] as string[], newMuscle.trim()]
    }));
    setNewMuscle('');
  };

  const handleRemoveMuscle = (type: 'primary' | 'secondary', muscle: string) => {
    setFormData(prev => ({
      ...prev,
      [`${type}_muscles`]: (prev[`${type}_muscles` as keyof typeof prev] as string[]).filter(m => m !== muscle)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_custom_exercises')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          primary_muscles: formData.primary_muscles,
          secondary_muscles: formData.secondary_muscles,
          equipment: formData.equipment,
          difficulty_level: formData.difficulty_level,
          category: formData.category,
          technique_notes: formData.technique_notes.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Custom Exercise Created! 💪',
        description: `${formData.name} has been added to your exercise library.`
      });

      onExerciseCreated({
        ...data,
        is_custom: true
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        primary_muscles: [],
        secondary_muscles: [],
        equipment: '',
        difficulty_level: 'Beginner',
        category: 'Strength',
        technique_notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to create custom exercise. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800/95 border-gray-600/50 text-white w-[95vw] max-w-2xl mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-400">Create Custom Exercise</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-200">Exercise Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Bulgarian Split Squat"
                className="bg-blue-900/30 border-blue-500/50 text-white"
                required
              />
            </div>
            
            <div>
              <Label className="text-blue-200">Equipment</Label>
              <Select value={formData.equipment} onValueChange={(value) => setFormData(prev => ({ ...prev, equipment: value }))}>
                <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-500/30">
                  {equipmentOptions.map(equipment => (
                    <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-blue-200">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the exercise..."
              className="bg-blue-900/30 border-blue-500/50 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-200">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-500/30">
                  <SelectItem value="Strength">Strength</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Flexibility">Flexibility</SelectItem>
                  <SelectItem value="Balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-blue-200">Difficulty Level</Label>
              <Select value={formData.difficulty_level} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}>
                <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-500/30">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary Muscles */}
          <div>
            <Label className="text-blue-200">Primary Muscles</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.primary_muscles.map(muscle => (
                <div key={muscle} className="bg-blue-600/30 px-2 py-1 rounded flex items-center text-sm">
                  {muscle}
                  <button
                    type="button"
                    onClick={() => handleRemoveMuscle('primary', muscle)}
                    className="ml-1 text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newMuscle} onValueChange={setNewMuscle}>
                <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white flex-1">
                  <SelectValue placeholder="Select muscle" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-500/30">
                  {muscleOptions.map(muscle => (
                    <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => handleAddMuscle('primary')}
                disabled={!newMuscle}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Secondary Muscles */}
          <div>
            <Label className="text-blue-200">Secondary Muscles (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.secondary_muscles.map(muscle => (
                <div key={muscle} className="bg-blue-600/20 px-2 py-1 rounded flex items-center text-sm">
                  {muscle}
                  <button
                    type="button"
                    onClick={() => handleRemoveMuscle('secondary', muscle)}
                    className="ml-1 text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newMuscle} onValueChange={setNewMuscle}>
                <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white flex-1">
                  <SelectValue placeholder="Select muscle" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-500/30">
                  {muscleOptions.map(muscle => (
                    <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => handleAddMuscle('secondary')}
                disabled={!newMuscle}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-blue-200">Technique Notes (Optional)</Label>
            <Textarea
              value={formData.technique_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, technique_notes: e.target.value }))}
              placeholder="Form cues, tips, or important notes..."
              className="bg-blue-900/30 border-blue-500/50 text-white"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 bg-orange-500/30 rounded flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded animate-bounce"></div>
                  </div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exercise
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
