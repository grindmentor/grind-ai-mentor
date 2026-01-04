import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Check, ChevronRight, AlertCircle } from 'lucide-react';
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

// Generate workout day names based on template - predictable cycling
const generateWorkoutDayNames = (template: WorkoutTemplate): string[] => {
  const title = template.title.toLowerCase();
  const daysPerWeek = template.daysPerWeek || 1;
  
  if (title.includes('push pull legs') || title.includes('ppl')) {
    if (daysPerWeek === 6) {
      return ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'];
    }
    return ['Push', 'Pull', 'Legs'];
  }
  
  if (title.includes('upper') && title.includes('lower')) {
    if (daysPerWeek === 4) {
      return ['Upper A', 'Lower A', 'Upper B', 'Lower B'];
    }
    return ['Upper', 'Lower'];
  }
  
  if (title.includes('full body')) {
    return Array.from({ length: daysPerWeek }, (_, i) => 
      `Full Body ${String.fromCharCode(65 + i)}`
    );
  }
  
  // Single workout - just use the title
  if (daysPerWeek === 1) {
    return [template.title];
  }
  
  // Default: generate numbered sessions
  return Array.from({ length: daysPerWeek }, (_, i) => 
    `${template.title} - Day ${i + 1}`
  );
};

const FollowPlanModalComponent: React.FC<FollowPlanModalProps> = ({ workout, isOpen, onClose }) => {
  const { followPlan, isFollowing } = useActivePlan();
  const { trigger } = useNativeHaptics();
  
  const workoutDayNames = useMemo(() => generateWorkoutDayNames(workout), [workout]);
  const requiredDays = workout.daysPerWeek || workoutDayNames.length;
  
  // Get smart default schedule
  const getDefaultSchedule = (): ScheduleDay[] => {
    const scheduleItems: ScheduleDay[] = [];
    
    if (requiredDays === 6) {
      // 6-day PPL: Mon-Sat
      const dayAssignments = [1, 2, 3, 4, 5, 6]; // Mon-Sat
      dayAssignments.forEach((day, i) => {
        scheduleItems.push({
          dayOfWeek: day,
          workoutName: workoutDayNames[i] || workoutDayNames[i % workoutDayNames.length],
          workoutType: workoutDayNames[i]?.toLowerCase().split(' ')[0] || 'workout'
        });
      });
    } else if (requiredDays === 5) {
      // 5-day: Mon-Fri
      const dayAssignments = [1, 2, 3, 4, 5];
      dayAssignments.forEach((day, i) => {
        scheduleItems.push({
          dayOfWeek: day,
          workoutName: workoutDayNames[i % workoutDayNames.length],
          workoutType: 'workout'
        });
      });
    } else if (requiredDays === 4) {
      // 4-day Upper/Lower: Mon, Tue, Thu, Fri
      const dayAssignments = [1, 2, 4, 5];
      dayAssignments.forEach((day, i) => {
        scheduleItems.push({
          dayOfWeek: day,
          workoutName: workoutDayNames[i % workoutDayNames.length],
          workoutType: workoutDayNames[i]?.toLowerCase().split(' ')[0] || 'workout'
        });
      });
    } else if (requiredDays === 3) {
      // 3-day: Mon, Wed, Fri
      const dayAssignments = [1, 3, 5];
      dayAssignments.forEach((day, i) => {
        scheduleItems.push({
          dayOfWeek: day,
          workoutName: workoutDayNames[i % workoutDayNames.length],
          workoutType: 'workout'
        });
      });
    } else if (requiredDays === 2) {
      // 2-day: Mon, Thu
      const dayAssignments = [1, 4];
      dayAssignments.forEach((day, i) => {
        scheduleItems.push({
          dayOfWeek: day,
          workoutName: workoutDayNames[i % workoutDayNames.length],
          workoutType: 'workout'
        });
      });
    } else {
      // Single day: Monday
      scheduleItems.push({
        dayOfWeek: 1,
        workoutName: workoutDayNames[0],
        workoutType: 'workout'
      });
    }
    
    return scheduleItems;
  };

  const [schedule, setSchedule] = useState<ScheduleDay[]>(getDefaultSchedule());
  const [step, setStep] = useState<'info' | 'schedule'>('info');

  // Toggle a day - cycles through workout names
  const toggleDay = (dayId: number) => {
    trigger('light');
    const existingIndex = schedule.findIndex(s => s.dayOfWeek === dayId);
    
    if (existingIndex >= 0) {
      // Remove this day
      setSchedule(prev => prev.filter(s => s.dayOfWeek !== dayId));
    } else if (schedule.length < requiredDays) {
      // Add this day with next workout in cycle
      // Find which workout names are already used
      const usedCount = new Map<string, number>();
      schedule.forEach(s => {
        usedCount.set(s.workoutName, (usedCount.get(s.workoutName) || 0) + 1);
      });
      
      // Find the next workout that should be assigned (maintains cycle order)
      let nextName = workoutDayNames[0];
      for (const name of workoutDayNames) {
        const used = usedCount.get(name) || 0;
        const expected = Math.floor(schedule.length / workoutDayNames.length);
        if (used <= expected) {
          nextName = name;
          break;
        }
      }
      
      setSchedule(prev => [
        ...prev, 
        { 
          dayOfWeek: dayId, 
          workoutName: nextName, 
          workoutType: nextName.toLowerCase().split(' ')[0] 
        }
      ].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
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

  // Check if schedule is valid (correct number of days, evenly distributed if possible)
  const isScheduleValid = schedule.length === requiredDays;

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

                  {/* Session Preview */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Weekly Sessions</h4>
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
                    Select {requiredDays} days for your workouts. Sessions will cycle in order.
                  </p>

                  {/* Day Selection */}
                  <div className="space-y-2">
                    {DAYS.map((day) => {
                      const scheduleItem = getScheduleForDay(day.id);
                      const isSelected = !!scheduleItem;
                      const canSelect = isSelected || schedule.length < requiredDays;
                      
                      return (
                        <button
                          key={day.id}
                          onClick={() => canSelect && toggleDay(day.id)}
                          disabled={!canSelect}
                          className={cn(
                            "w-full p-4 rounded-xl border transition-all",
                            "flex items-center justify-between",
                            "active:scale-[0.98]",
                            isSelected 
                              ? "border-primary bg-primary/10" 
                              : canSelect
                                ? "border-border bg-muted/30 hover:border-muted-foreground/50"
                                : "border-border/50 bg-muted/20 opacity-50"
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
                  <div className={cn(
                    "p-3 rounded-lg border",
                    isScheduleValid 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-muted/50 border-border"
                  )}>
                    <div className="flex items-center gap-2">
                      {isScheduleValid ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <p className={cn(
                        "text-xs",
                        isScheduleValid ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {schedule.length} of {requiredDays} days selected
                      </p>
                    </div>
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
                      disabled={!isScheduleValid || isFollowing}
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
