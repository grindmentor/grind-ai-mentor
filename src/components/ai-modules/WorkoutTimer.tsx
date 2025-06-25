
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, ArrowLeft, Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import UsageIndicator from '@/components/UsageIndicator';

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ onBack }) => {
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [workoutTime, setWorkoutTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isRestActive, setIsRestActive] = useState(false);
  const [restTarget, setRestTarget] = useState(60);
  const [sets, setSets] = useState(0);
  const [currentExercise, setCurrentExercise] = useState('');

  // Workout timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestActive && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsRestActive(false);
            toast.success('Rest period complete! Time for your next set.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restTime]);

  const startWorkout = async () => {
    if (!canUseFeature('workout_timer_sessions')) return;
    
    const success = await incrementUsage('workout_timer_sessions');
    if (!success) return;

    setIsWorkoutActive(true);
    setWorkoutTime(0);
    setSets(0);
    toast.success('Workout started!');
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
    toast('Workout paused');
  };

  const resumeWorkout = () => {
    setIsWorkoutActive(true);
    toast('Workout resumed');
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    setIsRestActive(false);
    toast.success(`Workout completed! Duration: ${formatTime(workoutTime)}`);
  };

  const resetWorkout = () => {
    setIsWorkoutActive(false);
    setIsRestActive(false);
    setWorkoutTime(0);
    setRestTime(0);
    setSets(0);
    setCurrentExercise('');
    toast('Timer reset');
  };

  const startRest = (duration: number) => {
    setRestTime(duration);
    setIsRestActive(true);
    setSets(prev => prev + 1);
    toast(`Rest started: ${duration} seconds`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const restPresets = [30, 60, 90, 120, 180];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-900/20 to-cyan-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-cyan-200 hover:text-white hover:bg-cyan-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-cyan-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/25 border border-cyan-400/20">
                  <Timer className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
                    Workout Timer
                  </h1>
                  <p className="text-cyan-200 text-lg">Smart workout and rest timing</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="workout_timer_sessions" featureName="Timer Sessions" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Smart timing for optimal workout performance
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Timer */}
            <Card className="bg-cyan-900/20 border-cyan-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center flex items-center justify-center">
                  <Clock className="w-6 h-6 mr-3 text-cyan-400" />
                  Workout Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Main Display */}
                <div className="text-center">
                  <div className="text-8xl font-bold text-white mb-4 font-mono">
                    {formatTime(workoutTime)}
                  </div>
                  {isWorkoutActive && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-2">
                      Active
                    </Badge>
                  )}
                  {sets > 0 && (
                    <div className="mt-4">
                      <p className="text-cyan-200">Sets completed: <span className="text-white font-bold">{sets}</span></p>
                    </div>
                  )}
                </div>

                {/* Current Exercise */}
                <div className="text-center">
                  <input
                    type="text"
                    placeholder="Enter current exercise..."
                    value={currentExercise}
                    onChange={(e) => setCurrentExercise(e.target.value)}
                    className="bg-cyan-800/20 border-cyan-600/50 text-white text-center text-lg p-3 rounded-xl focus:border-cyan-500 backdrop-blur-sm w-full"
                  />
                </div>

                {/* Main Controls */}
                <div className="flex justify-center space-x-4">
                  {!isWorkoutActive ? (
                    <Button
                      onClick={workoutTime === 0 ? startWorkout : resumeWorkout}
                      disabled={!canUseFeature('workout_timer_sessions')}
                      className="bg-gradient-to-r from-green-500/80 to-green-700/80 hover:from-green-600/80 hover:to-green-800/80 px-8 py-4 text-lg backdrop-blur-sm"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {workoutTime === 0 ? 'Start Workout' : 'Resume'}
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseWorkout}
                      className="bg-gradient-to-r from-yellow-500/80 to-yellow-700/80 hover:from-yellow-600/80 hover:to-yellow-800/80 px-8 py-4 text-lg backdrop-blur-sm"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  {workoutTime > 0 && (
                    <>
                      <Button
                        onClick={finishWorkout}
                        className="bg-gradient-to-r from-blue-500/80 to-blue-700/80 hover:from-blue-600/80 hover:to-blue-800/80 px-8 py-4 text-lg backdrop-blur-sm"
                      >
                        Finish
                      </Button>
                      <Button
                        onClick={resetWorkout}
                        variant="outline"
                        className="border-cyan-600/50 text-cyan-300 hover:bg-cyan-800/50 hover:border-cyan-500/50 px-6 py-4 backdrop-blur-sm"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rest Timer */}
            <Card className="bg-cyan-900/20 border-cyan-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center flex items-center justify-center">
                  <Timer className="w-6 h-6 mr-3 text-cyan-400" />
                  Rest Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Rest Display */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-4 font-mono">
                    {formatTime(restTime)}
                  </div>
                  {isRestActive && (
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-lg px-4 py-2">
                      Resting
                    </Badge>
                  )}
                </div>

                {/* Rest Presets */}
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-semibold text-center">Quick Rest Times</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {restPresets.map((duration) => (
                      <Button
                        key={duration}
                        onClick={() => startRest(duration)}
                        disabled={!isWorkoutActive}
                        className="bg-cyan-600/20 hover:bg-cyan-700/30 border border-cyan-500/30 backdrop-blur-sm"
                      >
                        {duration}s
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Rest Time */}
                <div className="space-y-3">
                  <h3 className="text-white text-lg font-semibold text-center">Custom Rest</h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Seconds"
                      value={restTarget}
                      onChange={(e) => setRestTarget(parseInt(e.target.value) || 60)}
                      className="bg-cyan-800/20 border-cyan-600/50 text-white p-3 rounded-xl focus:border-cyan-500 backdrop-blur-sm flex-1"
                      min="1"
                      max="600"
                    />
                    <Button
                      onClick={() => startRest(restTarget)}
                      disabled={!isWorkoutActive}
                      className="bg-gradient-to-r from-cyan-500/80 to-cyan-700/80 hover:from-cyan-600/80 hover:to-cyan-800/80 px-6 backdrop-blur-sm"
                    >
                      Start
                    </Button>
                  </div>
                </div>

                {/* Rest Controls */}
                {isRestActive && (
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={() => setIsRestActive(false)}
                      variant="outline"
                      className="border-cyan-600/50 text-cyan-300 hover:bg-cyan-800/50 hover:border-cyan-500/50 backdrop-blur-sm"
                    >
                      Skip Rest
                    </Button>
                    <Button
                      onClick={() => setRestTime(prev => prev + 30)}
                      variant="outline"
                      className="border-cyan-600/50 text-cyan-300 hover:bg-cyan-800/50 hover:border-cyan-500/50 backdrop-blur-sm"
                    >
                      +30s
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats and Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-cyan-900/20 border-cyan-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Session Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{sets}</p>
                    <p className="text-cyan-200 text-sm">Sets Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatTime(workoutTime)}</p>
                    <p className="text-cyan-200 text-sm">Total Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-900/20 border-cyan-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Rest Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-cyan-200"><strong className="text-white">Strength:</strong> 2-5 minutes</p>
                  <p className="text-cyan-200"><strong className="text-white">Hypertrophy:</strong> 1-3 minutes</p>
                  <p className="text-cyan-200"><strong className="text-white">Endurance:</strong> 30-90 seconds</p>
                  <p className="text-cyan-200"><strong className="text-white">Power:</strong> 2-5 minutes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;
