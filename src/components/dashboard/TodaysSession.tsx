import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Calendar, 
  ChevronRight, 
  Clock, 
  SkipForward,
  CalendarPlus,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useActivePlan, ScheduledWorkout } from '@/hooks/useActivePlan';
import { useNavigate } from 'react-router-dom';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';
import { Skeleton } from '@/components/ui/skeleton';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TodaysSessionComponent: React.FC = () => {
  const { 
    activePlan, 
    todaysWorkout, 
    upcomingWorkouts,
    isLoading, 
    rescheduleWorkout,
    skipWorkout,
    getDayName
  } = useActivePlan();
  const navigate = useNavigate();
  const { navigateToModule } = useModuleNavigation();
  const { trigger } = useNativeHaptics();
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const handleStartWorkout = () => {
    trigger('medium');
    // Navigate to workout logger with scheduled workout context
    // This allows WorkoutLogger to pre-fill data and mark as completed on save
    navigate('/workout-logger', { 
      state: { 
        scheduledWorkout: todaysWorkout,
        returnTo: '/app'
      } 
    });
  };

  const handleReschedule = (workoutId: string) => {
    trigger('light');
    setSelectedWorkoutId(workoutId);
    setShowReschedule(true);
  };

  const handleSelectNewDate = (date: Date) => {
    if (selectedWorkoutId) {
      rescheduleWorkout({ 
        workoutId: selectedWorkoutId, 
        newDate: date.toISOString().split('T')[0] 
      });
      setShowReschedule(false);
      setSelectedWorkoutId(null);
    }
  };

  const handleSkip = (workoutId: string) => {
    trigger('light');
    skipWorkout(workoutId);
  };

  // Generate next 7 days for rescheduling
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        <Skeleton className="h-[140px] rounded-2xl" />
      </motion.div>
    );
  }

  // No active plan
  if (!activePlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        <button
          onClick={() => {
            trigger('light');
            navigateToModule('/blueprint-ai');
          }}
          className={cn(
            "w-full p-4 rounded-2xl text-left",
            "bg-gradient-to-br from-primary/10 to-primary/5",
            "border border-primary/20",
            "active:scale-[0.98] transition-transform touch-manipulation"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Start a Workout Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose a program and we'll schedule your sessions
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.25 }}
      className="space-y-3"
    >
      {/* Active Plan Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">
            <Calendar className="w-3 h-3 mr-1" />
            {activePlan.template_title}
          </Badge>
        </div>
        <button
          onClick={() => navigateToModule('/blueprint-ai')}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Change
        </button>
      </div>

      {/* Today's Session Card */}
      {todaysWorkout ? (
        <div className={cn(
          "p-4 rounded-2xl",
          "bg-gradient-to-br from-blue-500/15 to-cyan-500/10",
          "border border-blue-500/20"
        )}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-blue-400 font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Today's Session
              </p>
              <h3 className="font-bold text-foreground">{todaysWorkout.workout_name}</h3>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReschedule(todaysWorkout.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Reschedule workout"
              >
                <CalendarPlus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSkip(todaysWorkout.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Skip workout"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleStartWorkout}
            className={cn(
              "w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold",
              "active:scale-[0.98] transition-transform"
            )}
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </div>
      ) : (
        <div className={cn(
          "p-4 rounded-2xl",
          "bg-gradient-to-br from-emerald-500/10 to-green-500/5",
          "border border-emerald-500/20"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Rest Day</h3>
              <p className="text-xs text-muted-foreground">No workout scheduled for today</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Workouts Preview */}
      {upcomingWorkouts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Coming Up</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {upcomingWorkouts.slice(0, 4).map((workout) => {
              const date = new Date(workout.scheduled_date);
              const isToday = date.toDateString() === new Date().toDateString();
              if (isToday) return null;
              
              return (
                <div
                  key={workout.id}
                  className={cn(
                    "flex-shrink-0 px-3 py-2 rounded-xl",
                    "bg-muted/50 border border-border/50",
                    "min-w-[100px]"
                  )}
                >
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {DAY_NAMES[date.getDay()]} {date.getDate()}
                  </p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {workout.workout_name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showReschedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => setShowReschedule(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full max-w-lg rounded-t-3xl p-6 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground">Reschedule Workout</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReschedule(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a new day for this workout:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {getNextDays().map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleSelectNewDate(date)}
                    className={cn(
                      "p-3 rounded-xl border border-border bg-muted/50",
                      "hover:border-primary hover:bg-primary/10",
                      "active:scale-95 transition-all",
                      "flex flex-col items-center"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {DAY_NAMES[date.getDay()]}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {date.getDate()}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const TodaysSession = memo(TodaysSessionComponent);
export default TodaysSession;