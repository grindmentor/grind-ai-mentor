import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, Play, Pause, RotateCcw, SkipForward, Plus, Volume2, VolumeX } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ onBack }) => {
  const [workDuration, setWorkDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(60);
  const [displayTime, setDisplayTime] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest'>('work');
  const [totalSets, setTotalSets] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentExercise, setCurrentExercise] = useState('');

  useEffect(() => {
    if (!isRunning) {
      setDisplayTime(currentPhase === 'work' ? workDuration : restDuration);
    }
  }, [workDuration, restDuration, currentPhase, isRunning]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      intervalId = setInterval(() => {
        setDisplayTime(prev => {
          if (prev <= 1) {
            switchPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, isPaused]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    } else if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setDisplayTime(workDuration);
    setCurrentPhase('work');
    setTotalSets(0);
    setTotalWorkTime(0);
    setTotalRestTime(0);
  };

  const switchPhase = useCallback(() => {
    if (currentPhase === 'work') {
      setCurrentPhase('rest');
      setDisplayTime(restDuration);
      setTotalSets(prev => prev + 1);
      setTotalWorkTime(prev => prev + workDuration);
      if (soundEnabled) {
        try { new Audio('/sounds/rest-start.mp3').play(); } catch {}
      }
    } else {
      setCurrentPhase('work');
      setDisplayTime(workDuration);
      setTotalRestTime(prev => prev + restDuration);
      if (soundEnabled) {
        try { new Audio('/sounds/work-start.mp3').play(); } catch {}
      }
    }
  }, [currentPhase, workDuration, restDuration, soundEnabled]);

  const skipToRest = () => {
    if (currentPhase === 'work' && isRunning) {
      setTotalWorkTime(prev => prev + (workDuration - displayTime));
      setCurrentPhase('rest');
      setDisplayTime(restDuration);
      setTotalSets(prev => prev + 1);
    }
  };

  const addExtraTime = () => {
    setDisplayTime(prev => prev + 30);
  };

  const progress = currentPhase === 'work' 
    ? (workDuration - displayTime) / workDuration * 100
    : (restDuration - displayTime) / restDuration * 100;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="Workout Timer" 
        onBack={onBack}
      />
      
      <div className="px-4 pb-24" style={{ paddingTop: 'calc(56px + env(safe-area-inset-top) + 16px)' }}>
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Main Timer Display */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Circular Progress Background */}
            <div className="relative aspect-square max-w-[280px] mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={currentPhase === 'work' ? 'hsl(var(--primary))' : 'hsl(142 76% 45%)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              
              {/* Timer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider mb-2",
                      currentPhase === 'work' ? 'text-primary' : 'text-green-400'
                    )}
                  >
                    {currentPhase === 'work' ? '💪 Work' : '😮‍💨 Rest'}
                  </motion.div>
                </AnimatePresence>
                
                <div className="timer-display timer-display-xl text-foreground">
                  {formatTime(displayTime)}
                </div>
                
                {currentExercise && (
                  <div className="text-muted-foreground text-sm mt-2 max-w-[180px] truncate text-center">
                    {currentExercise}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-border text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={toggleTimer}
              size="lg"
              className={cn(
                "h-20 w-20 rounded-full text-lg font-semibold",
                isRunning && !isPaused
                  ? 'bg-destructive hover:bg-destructive/90' 
                  : 'bg-primary hover:bg-primary/90'
              )}
            >
              {isRunning && !isPaused ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            <Button
              onClick={skipToRest}
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-border text-muted-foreground hover:text-foreground"
              disabled={currentPhase === 'rest' || !isRunning}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              onClick={addExtraTime}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-border text-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              30 sec
            </Button>
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              className={cn(
                "h-12 w-12 rounded-xl border-border",
                soundEnabled ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>

          {/* Session Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalSets}</div>
              <div className="stat-label">Sets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(totalWorkTime)}</div>
              <div className="stat-label">Work Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(totalRestTime)}</div>
              <div className="stat-label">Rest Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(totalWorkTime + totalRestTime)}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
            <h3 className="caption-premium">Timer Settings</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="label-premium mb-2 block">Work Duration (seconds)</Label>
                <Input
                  type="number"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(parseInt(e.target.value) || 30)}
                  className="input-premium h-12"
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <Label className="label-premium mb-2 block">Rest Duration (seconds)</Label>
                <Input
                  type="number"
                  value={restDuration}
                  onChange={(e) => setRestDuration(parseInt(e.target.value) || 60)}
                  className="input-premium h-12"
                  disabled={isRunning}
                />
              </div>

              <div>
                <Label className="label-premium mb-2 block">Current Exercise (optional)</Label>
                <Input
                  value={currentExercise}
                  onChange={(e) => setCurrentExercise(e.target.value)}
                  placeholder="e.g., Bench Press"
                  className="input-premium h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;
