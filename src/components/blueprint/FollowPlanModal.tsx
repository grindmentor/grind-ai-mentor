import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WorkoutTemplate } from '@/data/expandedWorkoutTemplates';
import { useActivePlan, ScheduleDay } from '@/hooks/useActivePlan';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';

interface FollowPlanModalProps {
  workout: WorkoutTemplate;
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

// Generate workout day names based on template
const generateWorkoutDayNames = (template: WorkoutTemplate): string[] => {
  const title = template.title.toLowerCase();
  
  if (title.includes('push pull legs') || title.includes('ppl')) {
    if (template.daysPerWeek === 6) {
      return ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'];
    }
    return ['Push', 'Pull', 'Legs'];
  }
  
  if (title.includes('upper') && title.includes('lower')) {
    if (template.daysPerWeek === 4) {
      return ['Upper A', 'Lower A', 'Upper B', 'Lower B'];
    }
    return ['Upper', 'Lower'];
  }
  
  if (title.includes('full body')) {
    const count = template.daysPerWeek || 3;
    return Array.from({ length: count }, (_, i) => `Full Body ${String.fromCharCode(65 + i)}`);
  }
  
  // Default: use workout title
  return [template.title];
};

const FollowPlanModalComponent: React.FC<FollowPlanModalProps> = ({ workout, isOpen, onClose }) => {
  const { followPlan, isFollowing } = useActivePlan();
  const { trigger } = useNativeHaptics();
  
  const workoutDayNames = generateWorkoutDayNames(workout);
  const requiredDays = workout.daysPerWeek || workoutDayNames.length;
  
  // Initialize schedule based on workout type
  const getDefaultSchedule = (): ScheduleDay[] => {
    // Default schedule patterns
    if (requiredDays === 6) {
      // PPL 6-day: Mon, Tue, Wed, Thu, Fri, Sat
      return [
        { dayOfWeek: 1, workoutName: workoutDayNames[0], workoutType: 'push' },
        { dayOfWeek: 2, workoutName: workoutDayNames[1], workoutType: 'pull' },
        { dayOfWeek: 3, workoutName: workoutDayNames[2], workoutType: 'legs' },
        { dayOfWeek: 4, workoutName: workoutDayNames[3] || workoutDayNames[0], workoutType: 'push' },
        { dayOfWeek: 5, workoutName: workoutDayNames[4] || workoutDayNames[1], workoutType: 'pull' },
        { dayOfWeek: 6, workoutName: workoutDayNames[5] || workoutDayNames[2], workoutType: 'legs' },
      ];
    }
    if (requiredDays === 4) {
      // Upper/Lower 4-day: Mon, Tue, Thu, Fri
      return [
        { dayOfWeek: 1, workoutName: workoutDayNames[0], workoutType: 'upper' },
        { dayOfWeek: 2, workoutName: workoutDayNames[1], workoutType: 'lower' },
        { dayOfWeek: 4, workoutName: workoutDayNames[2] || workoutDayNames[0], workoutType: 'upper' },
        { dayOfWeek: 5, workoutName: workoutDayNames[3] || workoutDayNames[1], workoutType: 'lower' },
      ];
    }
    if (requiredDays === 3) {
      // 3-day: Mon, Wed, Fri
      return [
        { dayOfWeek: 1, workoutName: workoutDayNames[0], workoutType: 'full' },
        { dayOfWeek: 3, workoutName: workoutDayNames[1] || workoutDayNames[0], workoutType: 'full' },
        { dayOfWeek: 5, workoutName: workoutDayNames[2] || workoutDayNames[0], workoutType: 'full' },
      ];
    }
    // Single workout or default
    return [{ dayOfWeek: 1, workoutName: workoutDayNames[0], workoutType: 'workout' }];
  };

  const [schedule, setSchedule] = useState<ScheduleDay[]>(getDefaultSchedule());
  const [step, setStep] = useState<'info' | 'schedule'>('info');

  const toggleDay = (dayId: number, workoutName: string) => {
    trigger('light');
    const existingIndex = schedule.findIndex(s => s.dayOfWeek === dayId);
    
    if (existingIndex >= 0) {
      // Remove this day
      setSchedule(prev => prev.filter(s => s.dayOfWeek !== dayId));
    } else if (schedule.length < requiredDays) {
      // Add this day with next available workout
      const usedNames = schedule.map(s => s.workoutName);
      const nextName = workoutDayNames.find(n => !usedNames.includes(n)) || workoutDayNames[0];
      setSchedule(prev => [...prev, { dayOfWeek: dayId, workoutName: nextName, workoutType: 'workout' }]);
    }
  };

  const handleConfirm = () => {
    trigger('medium');
    followPlan({ template: workout, schedule });
    onClose();
  };

  const getScheduleForDay = (dayId: number) => {
    return schedule.find(s => s.dayOfWeek === dayId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card w-full max-w-lg rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">
                {step === 'info' ? 'Follow This Plan' : 'Set Your Schedule'}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {step === 'info' ? (
                <div className="space-y-4">
                  {/* Plan Info */}
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">{workout.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{workout.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {requiredDays}x per week
                      </span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        {workout.duration}
                      </span>
                    </div>
                  </div>

                  {/* What you'll do each session */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Your Weekly Sessions</h4>
                    <div className="space-y-2">
                      {workoutDayNames.map((name, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium text-foreground">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('schedule')}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    Set My Schedule
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select {requiredDays} days for your workouts:
                  </p>

                  {/* Day Selection */}
                  <div className="space-y-2">
                    {DAYS.map((day) => {
                      const scheduleItem = getScheduleForDay(day.id);
                      const isSelected = !!scheduleItem;
                      
                      return (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day.id, '')}
                          className={cn(
                            "w-full p-4 rounded-xl border transition-all",
                            "flex items-center justify-between",
                            "active:scale-[0.98]",
                            isSelected 
                              ? "border-primary bg-primary/10" 
                              : "border-border bg-muted/30 hover:border-muted-foreground/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              {isSelected ? <Check className="w-5 h-5" /> : day.short.charAt(0)}
                            </div>
                            <span className={cn(
                              "font-medium",
                              isSelected ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {day.name}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-sm text-primary font-medium">
                              {scheduleItem.workoutName}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      {schedule.length} of {requiredDays} days selected
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('info')}
                      className="flex-1 h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={schedule.length !== requiredDays || isFollowing}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90"
                    >
                      {isFollowing ? 'Setting up...' : 'Start Plan'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const FollowPlanModal = memo(FollowPlanModalComponent);
export default FollowPlanModal;