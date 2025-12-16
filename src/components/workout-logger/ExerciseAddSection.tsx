import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus } from 'lucide-react';
import { ExerciseSearch } from '@/components/exercise/ExerciseSearch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** Exercise data from search - can be string (custom) or object from DB */
type ExerciseInput = string | { name: string };

interface ExerciseAddSectionProps {
  userId?: string;
  onAddExercise: (exerciseData: ExerciseInput) => void;
}

const ExerciseAddSection = React.memo(({ userId, onAddExercise }: ExerciseAddSectionProps) => {
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseMuscles, setCustomExerciseMuscles] = useState('');
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState('');

  const handleExerciseSelect = (exerciseData: ExerciseInput) => {
    onAddExercise(exerciseData);
    setShowExerciseSearch(false);
  };

  const createCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    try {
      // Save custom exercise to database if user is logged in
      if (userId) {
        const muscles = customExerciseMuscles.split(',').map(m => m.trim()).filter(m => m);
        
        const { error } = await supabase
          .from('user_custom_exercises')
          .insert({
            user_id: userId,
            name: customExerciseName,
            primary_muscles: muscles.length > 0 ? muscles : ['Other'],
            secondary_muscles: [],
            equipment: customExerciseEquipment || 'Unknown',
            category: 'Custom',
            difficulty_level: 'Beginner'
          });

        if (error) throw error;
        toast.success('Custom exercise created!');
      }

      // Add to current workout
      onAddExercise(customExerciseName);
      
      // Reset form
      setShowCustomExerciseForm(false);
      setCustomExerciseName('');
      setCustomExerciseMuscles('');
      setCustomExerciseEquipment('');
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      // Still add to workout even if database save fails
      onAddExercise(customExerciseName);
      setShowCustomExerciseForm(false);
      setCustomExerciseName('');
      setCustomExerciseMuscles('');
      setCustomExerciseEquipment('');
      toast.error('Exercise added to workout, but failed to save for future use');
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold text-sm" id="add-exercise-title">Add Exercise</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowExerciseSearch(!showExerciseSearch)}
            size="sm"
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-9 min-h-[36px] text-xs rounded-lg"
            aria-label="Browse exercises"
            aria-expanded={showExerciseSearch}
          >
            <Search className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Browse
          </Button>
          <Button
            onClick={() => setShowCustomExerciseForm(!showCustomExerciseForm)}
            size="sm"
            variant="outline"
            className="border-border/50 text-muted-foreground hover:bg-muted/30 h-9 min-h-[36px] text-xs rounded-lg"
            aria-label="Create custom exercise"
            aria-expanded={showCustomExerciseForm}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Custom
          </Button>
        </div>
      </div>

      {showExerciseSearch && (
        <div className="mb-4 relative z-20">
          <ExerciseSearch
            onExerciseSelect={handleExerciseSelect}
            placeholder="Search exercises or muscle groups..."
            className="mb-3"
          />
        </div>
      )}

      {showCustomExerciseForm && (
        <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/30">
          <h4 className="text-foreground font-medium text-sm">Create Custom Exercise</h4>
          
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Exercise Name *</Label>
            <Input
              placeholder="e.g., Cable Lateral Raises"
              value={customExerciseName}
              onChange={(e) => setCustomExerciseName(e.target.value)}
              className="bg-background/50 border-border/50 text-foreground h-10 rounded-lg"
            />
          </div>
          
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Primary Muscles (optional)</Label>
            <Input
              placeholder="e.g., Shoulders, Chest"
              value={customExerciseMuscles}
              onChange={(e) => setCustomExerciseMuscles(e.target.value)}
              className="bg-background/50 border-border/50 text-foreground h-10 rounded-lg"
            />
          </div>
          
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Equipment (optional)</Label>
            <Input
              placeholder="e.g., Cable Machine"
              value={customExerciseEquipment}
              onChange={(e) => setCustomExerciseEquipment(e.target.value)}
              className="bg-background/50 border-border/50 text-foreground h-10 rounded-lg"
            />
          </div>
          
          <div className="flex gap-2 pt-1">
            <Button
              onClick={createCustomExercise}
              size="sm"
              className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 h-9 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create & Add
            </Button>
            <Button
              onClick={() => setShowCustomExerciseForm(false)}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground h-9"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

ExerciseAddSection.displayName = 'ExerciseAddSection';

export default ExerciseAddSection;
