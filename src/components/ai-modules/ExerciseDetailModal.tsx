
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Target, Dumbbell, Clock, AlertCircle } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  primary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  description?: string;
  form_cues?: string[];
  alternatives?: string[];
}

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white pr-8">
              {exercise.name}
            </DialogTitle>
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
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-400">
                <Target className="w-4 h-4 mr-2" />
                Sets × Reps
              </div>
              <p className="text-white font-semibold">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                Rest
              </div>
              <p className="text-white font-semibold">{exercise.rest}</p>
            </div>
          </div>

          {/* Difficulty and Equipment */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(exercise.difficulty_level)}>
              {exercise.difficulty_level}
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
              <Dumbbell className="w-3 h-3 mr-1" />
              {exercise.equipment}
            </Badge>
          </div>

          {/* Primary Muscles */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Primary Muscles
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.primary_muscles.map((muscle, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="border-orange-500/30 text-orange-400 bg-orange-500/10"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {exercise.description}
              </p>
            </div>
          )}

          {/* Form Cues */}
          {exercise.form_cues && exercise.form_cues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Form Cues
              </h3>
              <ul className="space-y-1">
                {exercise.form_cues.map((cue, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives */}
          {exercise.alternatives && exercise.alternatives.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Alternatives</h3>
              <div className="space-y-1">
                {exercise.alternatives.map((alt, index) => (
                  <p key={index} className="text-gray-400 text-sm">
                    • {alt}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Notes</h3>
              <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded-lg">
                {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
