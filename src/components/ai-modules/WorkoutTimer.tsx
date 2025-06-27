
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Settings, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer = ({ onBack }: WorkoutTimerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [timeLeft, setTimeLeft] = useState(60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<'work' | 'rest'>('work');
  const [workTime, setWorkTime] = useState(45);
  const [restTime, setRestTime] = useState(15);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(8);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
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
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (soundEnabled) {
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (error) {
        console.log('Audio not available');
      }
    }

    if (timerType === 'work') {
      setTimerType('rest');
      setTimeLeft(restTime);
      toast({
        title: "Work Complete!",
        description: "Time for rest period",
      });
    } else {
      if (currentRound < totalRounds) {
        setCurrentRound(prev => prev + 1);
        setTimerType('work');
        setTimeLeft(workTime);
        toast({
          title: `Round ${currentRound + 1}`,
          description: "Starting next work period",
        });
      } else {
        setIsRunning(false);
        toast({
          title: "Workout Complete!",
          description: "Great job! You finished all rounds.",
        });
        resetTimer();
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerType('work');
    setTimeLeft(workTime);
    setCurrentRound(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timerType === 'work') {
      return timeLeft <= 5 ? 'text-red-400' : 'text-cyan-400';
    } else {
      return timeLeft <= 5 ? 'text-red-400' : 'text-green-400';
    }
  };

  const getProgressPercentage = () => {
    const totalTime = timerType === 'work' ? workTime : restTime;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-cyan-900/10 to-blue-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-cyan-500/20 backdrop-blur-sm w-fit"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "Back" : "Back to Dashboard"}
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500/20 to-blue-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-cyan-400/20">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Workout Timer
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">HIIT & interval training timer</p>
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border-cyan-500/30">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center space-y-6">
                  {/* Current Phase */}
                  <div className="space-y-2">
                    <Badge className={`text-lg px-4 py-2 ${
                      timerType === 'work' 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {timerType === 'work' ? 'WORK' : 'REST'}
                    </Badge>
                    <div className="text-sm text-gray-400">
                      Round {currentRound} of {totalRounds}
                    </div>
                  </div>

                  {/* Timer Display */}
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                        className={timerType === 'work' ? 'text-cyan-400' : 'text-green-400'}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-4xl sm:text-6xl font-bold ${getTimerColor()}`}>
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={toggleTimer}
                      className={`${
                        isRunning 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-cyan-500 hover:bg-cyan-600'
                      } text-white px-6 py-3`}
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
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 px-6 py-3"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-cyan-400" />
                    Timer Settings
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="text-cyan-400 hover:bg-cyan-500/10"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Customize your interval training session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Work Time (seconds)</Label>
                    <Input
                      type="number"
                      value={workTime}
                      onChange={(e) => setWorkTime(Number(e.target.value))}
                      disabled={isRunning}
                      className="bg-gray-800 border-cyan-500/30 text-white focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Rest Time (seconds)</Label>
                    <Input
                      type="number"
                      value={restTime}
                      onChange={(e) => setRestTime(Number(e.target.value))}
                      disabled={isRunning}
                      className="bg-gray-800 border-cyan-500/30 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Total Rounds</Label>
                  <Input
                    type="number"
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(Number(e.target.value))}
                    disabled={isRunning}
                    className="bg-gray-800 border-cyan-500/30 text-white focus:border-cyan-400"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkoutTimer;
