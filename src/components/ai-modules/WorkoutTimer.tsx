
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WorkoutTimer = () => {
  const [workTime, setWorkTime] = useState(45); // seconds
  const [restTime, setRestTime] = useState(15); // seconds
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Play sound (if audio is available)
            if (audioRef.current) {
              audioRef.current.play().catch(() => {});
            }
            
            if (isWorkPhase) {
              // Switch to rest phase
              setIsWorkPhase(false);
              return restTime;
            } else {
              // Switch to work phase or end workout
              if (currentRound >= rounds) {
                setIsRunning(false);
                setCurrentRound(1);
                setIsWorkPhase(true);
                return workTime;
              } else {
                setCurrentRound(prev => prev + 1);
                setIsWorkPhase(true);
                return workTime;
              }
            }
          }
          return prev - 1;
        });
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isWorkPhase, currentRound, rounds, workTime, restTime]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setIsWorkPhase(true);
    setTimeLeft(workTime);
    setTotalElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isWorkPhase 
    ? ((workTime - timeLeft) / workTime) * 100
    : ((restTime - timeLeft) / restTime) * 100;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/30 backdrop-blur-sm border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Timer className="w-5 h-5 mr-2 text-cyan-400" />
              Workout Timer
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSettings && (
            <Card className="bg-cyan-900/20 border-cyan-500/30">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-cyan-300 font-medium">Timer Settings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-cyan-300">Work Time (sec)</Label>
                    <Input
                      type="number"
                      value={workTime}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 45;
                        setWorkTime(value);
                        if (isWorkPhase && !isRunning) setTimeLeft(value);
                      }}
                      className="bg-cyan-900/20 border-cyan-500/30 text-white"
                      min="1"
                      max="300"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-300">Rest Time (sec)</Label>
                    <Input
                      type="number"
                      value={restTime}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 15;
                        setRestTime(value);
                        if (!isWorkPhase && !isRunning) setTimeLeft(value);
                      }}
                      className="bg-cyan-900/20 border-cyan-500/30 text-white"
                      min="1"
                      max="180"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-300">Rounds</Label>
                    <Input
                      type="number"
                      value={rounds}
                      onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                      className="bg-cyan-900/20 border-cyan-500/30 text-white"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Timer Display */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-48 h-48 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-cyan-900/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={isWorkPhase ? "text-cyan-400" : "text-green-400"}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">
                      {formatTime(timeLeft)}
                    </div>
                    <div className={`text-sm font-medium ${isWorkPhase ? 'text-cyan-400' : 'text-green-400'}`}>
                      {isWorkPhase ? 'WORK' : 'REST'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div className="text-cyan-400 font-bold text-lg">{currentRound}</div>
                <div className="text-cyan-300 text-sm">Current Round</div>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div className="text-cyan-400 font-bold text-lg">{rounds}</div>
                <div className="text-cyan-300 text-sm">Total Rounds</div>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div className="text-cyan-400 font-bold text-lg">{formatTotalTime(totalElapsed)}</div>
                <div className="text-cyan-300 text-sm">Elapsed</div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`${
                  isRunning 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } text-white px-8`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                onClick={resetTimer}
                size="lg"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            {/* Progress Info */}
            <div className="text-center">
              <div className="text-gray-400 text-sm">
                Phase {currentRound > rounds ? rounds : currentRound} of {rounds} • 
                {isWorkPhase ? ' Work Phase' : ' Rest Phase'}
              </div>
              {currentRound > rounds && !isRunning && (
                <div className="text-green-400 font-medium mt-2">
                  🎉 Workout Complete! Great job!
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for timer sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkdIzCh1pK4smuq4tSeqGSFyJaabL/MmGcvKmjFnSLBgCkELKjNpIrDaSJSgkrMLKVcgxE/r2uGlRBKfVHCYKyKw5sRPfplkpCzBSHnqYhkmhTBJgUV" type="audio/wav"/>
      </audio>
    </div>
  );
};

export default WorkoutTimer;
