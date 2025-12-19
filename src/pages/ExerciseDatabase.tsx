import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileHeader } from '@/components/MobileHeader';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { 
  Search, 
  Dumbbell, 
  Target, 
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level: string | null;
  category: string;
  form_cues: string | null;
  technique_notes: string | null;
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Forearms'];
const EQUIPMENT_OPTIONS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Bands'];

const ExerciseDatabase = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadExercises();
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = !searchQuery || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.primary_muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMuscle = selectedMuscle === 'All' || 
        exercise.primary_muscles.some(m => m.toLowerCase().includes(selectedMuscle.toLowerCase()));

      const matchesEquipment = selectedEquipment === 'All' || 
        exercise.equipment.toLowerCase().includes(selectedEquipment.toLowerCase());

      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment]);

  const handleExerciseClick = (exercise: Exercise) => {
    navigate('/exercise-detail', { 
      state: { 
        exercise: {
          ...exercise,
          sets: 3,
          reps: '8-12',
          rest: '90 secs',
          form_cues: exercise.form_cues ? exercise.form_cues.split('. ').filter(Boolean) : [],
        } 
      } 
    });
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Let MobileHeader handle returnTo state properly */}
      <MobileHeader 
        title="Exercise Library" 
      />
      
      <PullToRefresh onRefresh={handleRefresh} skeletonVariant="list">
        <div className="px-4 pb-28">
          {/* Hero */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{filteredExercises.length} exercises available</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" aria-hidden="true" />
            <Input
              placeholder="Search exercises or muscles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border rounded-xl"
              aria-label="Search exercises"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
              <SelectTrigger className="h-11 min-h-[44px] bg-card border-border rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Filter by muscle">
                <Target className="w-4 h-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <SelectValue placeholder="Muscle" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                {MUSCLE_GROUPS.map(muscle => (
                  <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="h-11 min-h-[44px] bg-card border-border rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Filter by equipment">
                <Dumbbell className="w-4 h-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                {EQUIPMENT_OPTIONS.map(equip => (
                  <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'].map(muscle => (
              <Button
                key={muscle}
                variant="outline"
                size="sm"
                onClick={() => setSelectedMuscle(muscle === 'Legs' ? 'Quadriceps' : muscle === 'Arms' ? 'Biceps' : muscle)}
                aria-pressed={
                  selectedMuscle === muscle || 
                  (muscle === 'Legs' && selectedMuscle === 'Quadriceps') ||
                  (muscle === 'Arms' && selectedMuscle === 'Biceps')
                }
                className={cn(
                  "rounded-full px-4 whitespace-nowrap transition-all h-9 min-h-[36px] focus-visible:ring-2 focus-visible:ring-primary/50",
                  (selectedMuscle === muscle || 
                   (muscle === 'Legs' && selectedMuscle === 'Quadriceps') ||
                   (muscle === 'Arms' && selectedMuscle === 'Biceps'))
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40"
                )}
                aria-label={`Filter by ${muscle}`}
              >
                {muscle}
              </Button>
            ))}
          </div>

          {/* Exercise List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="empty-state-premium py-12">
              <div className="empty-state-icon" aria-hidden="true">
                <Dumbbell className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-foreground font-medium mb-1">No exercises found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise, index) => (
                <motion.button
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  onClick={() => handleExerciseClick(exercise)}
                  className="w-full p-4 min-h-[72px] bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl text-left transition-colors native-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`View ${exercise.name} details`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate pr-2">
                        {exercise.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">
                          {exercise.primary_muscles[0] || 'General'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          <Dumbbell className="w-3 h-3 mr-1" aria-hidden="true" />
                          {exercise.equipment}
                        </span>
                        {exercise.difficulty_level && (
                          <Badge className={cn("text-[10px]", getDifficultyColor(exercise.difficulty_level))}>
                            {exercise.difficulty_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default ExerciseDatabase;
