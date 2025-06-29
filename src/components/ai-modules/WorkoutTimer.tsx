import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, Play, Pause, RotateCcw, BarChart3 } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ onBack }) => {
  const [workDuration, setWorkDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(15);
  const [displayTime, setDisplayTime] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest'>('work');
  const [totalSets, setTotalSets] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentExercise, setCurrentExercise] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayTime(workDuration);
  }, [workDuration]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      setStartTime(Date.now() - (isPaused ? (workDuration - displayTime) * 1000 : 0));

      intervalId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        setSessionDuration(elapsedTime);

        const remainingTime = (currentPhase === 'work' ? workDuration : restDuration) - (elapsedTime % (workDuration + restDuration));

        if (remainingTime >= 0) {
          setDisplayTime(remainingTime);
        } else {
          clearInterval(intervalId);
          switchPhase();
        }
      }, 100);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isRunning, workDuration, restDuration, currentPhase, isPaused, startTime]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(Date.now() - (isPaused ? (workDuration - displayTime) * 1000 : 0));
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsRunning(false);
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
    setSessionDuration(0);
  };

  const switchPhase = () => {
    if (currentPhase === 'work') {
      setCurrentPhase('rest');
      setDisplayTime(restDuration);
      setTotalSets(prev => prev + 1);
      setTotalWorkTime(prev => prev + workDuration);
      if (soundEnabled) {
        new Audio('/sounds/rest-start.mp3').play();
      }
    } else {
      setCurrentPhase('work');
      setDisplayTime(workDuration);
      setTotalRestTime(prev => prev + restDuration);
      if (soundEnabled) {
        new Audio('/sounds/work-start.mp3').play();
      }
    }
  };

  const skipToRest = () => {
    if (currentPhase === 'work') {
      setIsRunning(false);
      setDisplayTime(restDuration);
      setCurrentPhase('rest');
      setTotalWorkTime(prev => prev + (workDuration - displayTime));
      setIsRunning(true);
    }
  };

  const addExtraTime = () => {
    setDisplayTime(prev => prev + 30);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950/50 to-cyan-900/30">
      <MobileHeader 
        title="Workout Timer" 
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Timer Card */}
          <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/30 backdrop-blur-sm border-cyan-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/30 to-blue-500/40 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  <Timer className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Workout Timer</CardTitle>
                  <CardDescription className="text-cyan-200/80">
                    Track your workout and rest periods
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center p-8 bg-cyan-900/20 rounded-xl border border-cyan-500/20">
                <div className="text-6xl font-mono font-bold text-cyan-400 mb-2">
                  {formatTime(displayTime)}
                </div>
                <div className="text-cyan-300 text-lg">
                  {currentPhase === 'work' ? '💪 Work Phase' : '😮‍💨 Rest Phase'}
                </div>
                {currentExercise && (
                  <div className="text-cyan-200 mt-2">
                    {currentExercise}
                  </div>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className={`px-8 py-4 text-lg font-semibold ${
                    isRunning 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {isPaused ? 'Resume' : 'Start'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={skipToRest}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                  disabled={currentPhase === 'rest'}
                >
                  Skip to Rest
                </Button>
                <Button
                  onClick={addExtraTime}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  +30 seconds
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings & Stats */}
          <div className="space-y-6">
            {/* Timer Settings */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/30 backdrop-blur-sm border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-200">Timer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-cyan-200">Work Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={workDuration}
                    onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                    className="bg-cyan-900/30 border-cyan-500/50 text-white"
                    disabled={isRunning}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-cyan-200">Rest Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={restDuration}
                    onChange={(e) => setRestDuration(parseInt(e.target.value))}
                    className="bg-cyan-900/30 border-cyan-500/50 text-white"
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-cyan-200">Current Exercise</Label>
                  <Input
                    value={currentExercise}
                    onChange={(e) => setCurrentExercise(e.target.value)}
                    placeholder="e.g., Push-ups, Squats"
                    className="bg-cyan-900/30 border-cyan-500/50 text-white placeholder:text-cyan-300/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sound"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="rounded border-cyan-500/50"
                  />
                  <Label htmlFor="sound" className="text-cyan-200">Sound notifications</Label>
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/30 backdrop-blur-sm border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-200 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{totalSets}</div>
                    <div className="text-sm text-cyan-300">Sets Completed</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{formatTime(totalWorkTime)}</div>
                    <div className="text-sm text-cyan-300">Total Work Time</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{formatTime(totalRestTime)}</div>
                    <div className="text-sm text-cyan-300">Total Rest Time</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{formatTime(sessionDuration)}</div>
                    <div className="text-sm text-cyan-300">Session Duration</div>
                  </div>
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
