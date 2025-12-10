import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  ArrowLeft, 
  Dumbbell, 
  Target, 
  Filter,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Forearms'
];

const EQUIPMENT_OPTIONS = [
  'All',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Bands'
];

const ExerciseDatabase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Exercise Library</h1>
            <p className="text-xs text-muted-foreground">{filteredExercises.length} exercises</p>
          </div>
        </div>
      </header>

      <div 
        className="px-4 pb-24"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top) + 16px)' }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
            <Input
              placeholder="Search exercises or muscles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
              <SelectTrigger className="h-11 bg-card border-border rounded-xl">
                <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Muscle Group" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                {MUSCLE_GROUPS.map(muscle => (
                  <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="h-11 bg-card border-border rounded-xl">
                <Dumbbell className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl">
                {EQUIPMENT_OPTIONS.map(equip => (
                  <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Muscle Group Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'].map(muscle => (
              <Button
                key={muscle}
                variant="outline"
                size="sm"
                onClick={() => setSelectedMuscle(muscle === 'Legs' ? 'Quadriceps' : muscle === 'Arms' ? 'Biceps' : muscle)}
                className={cn(
                  "rounded-full px-4 whitespace-nowrap transition-all",
                  (selectedMuscle === muscle || 
                   (muscle === 'Legs' && selectedMuscle === 'Quadriceps') ||
                   (muscle === 'Arms' && selectedMuscle === 'Biceps'))
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40"
                )}
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
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No exercises found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise, index) => (
                <motion.button
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleExerciseClick(exercise)}
                  className="w-full p-4 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate pr-2">
                        {exercise.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
                          {exercise.primary_muscles[0] || 'General'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Dumbbell className="w-3 h-3 mr-1" />
                          {exercise.equipment}
                        </span>
                        {exercise.difficulty_level && (
                          <Badge className={cn("text-xs", getDifficultyColor(exercise.difficulty_level))}>
                            {exercise.difficulty_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDatabase;
