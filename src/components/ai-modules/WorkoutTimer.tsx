
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Timer, Settings, Volume2, VolumeX, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MobileHeader } from "@/components/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutTimerProps {
  onBack: () => void;
}

interface TimerPreset {
  name: string;
  description: string;
  workTime: number;
  restTime: number;
  totalRounds: number;
  icon: string;
}

const WorkoutTimer = ({ onBack }: WorkoutTimerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [timeLeft, setTimeLeft] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<'work' | 'rest'>('work');
  const [workTime, setWorkTime] = useState(45);
  const [restTime, setRestTime] = useState(15);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(8);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPresets, setShowPresets] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presetTimers: TimerPreset[] = [
    {
      name: "HIIT Classic",
      description: "High intensity interval training",
      workTime: 45,
      restTime: 15,
      totalRounds: 8,
      icon: "🔥"
    },
    {
      name: "Tabata",
      description: "4-minute intense workout",
      workTime: 20,
      restTime: 10,
      totalRounds: 8,
      icon: "⚡"
    },
    {
      name: "EMOM",
      description: "Every minute on the minute",
      workTime: 45,
      restTime: 15,
      totalRounds: 10,
      icon: "⏱️"
    },
    {
      name: "Boxing Rounds",
      description: "3-minute rounds with 1-min rest",
      workTime: 180,
      restTime: 60,
      totalRounds: 5,
      icon: "🥊"
    },
    {
      name: "Sprint Intervals",
      description: "30-second sprints",
      workTime: 30,
      restTime: 90,
      totalRounds: 6,
      icon: "🏃"
    },
    {
      name: "Circuit Training",
      description: "Station-based workout",
      workTime: 60,
      restTime: 20,
      totalRounds: 12,
      icon: "🔄"
    }
  ];

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

  const loadPreset = (preset: TimerPreset) => {
    setWorkTime(preset.workTime);
    setRestTime(preset.restTime);
    setTotalRounds(preset.totalRounds);
    setTimeLeft(preset.workTime);
    setTimerType('work');
    setCurrentRound(1);
    setIsRunning(false);
    setShowPresets(false);
    toast({
      title: `${preset.name} Loaded!`,
      description: preset.description,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-900/10 to-cyan-800/20">
      <MobileHeader
        title="Workout Timer"
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-900/30 backdrop-blur-sm border-cyan-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/30 to-cyan-500/40 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <Timer className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Workout Timer</CardTitle>
                <CardDescription className="text-cyan-200/80">
                  HIIT & interval training timer with presets
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowPresets(!showPresets)}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Presets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-cyan-400 hover:bg-cyan-500/10"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>

            {/* Preset Cards */}
            {showPresets && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                {presetTimers.map((preset, index) => (
                  <Card 
                    key={index}
                    className="bg-cyan-900/30 border-cyan-500/30 cursor-pointer hover:bg-cyan-800/40 transition-colors"
                    onClick={() => loadPreset(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">{preset.icon}</div>
                        <h4 className="font-semibold text-cyan-300 mb-1">{preset.name}</h4>
                        <p className="text-xs text-cyan-200/80 mb-2">{preset.description}</p>
                        <div className="text-xs text-cyan-400">
                          {formatTime(preset.workTime)} work / {formatTime(preset.restTime)} rest × {preset.totalRounds}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Timer Display */}
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <Badge className={`text-lg px-4 py-2 ${
                  timerType === 'work' 
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {timerType === 'work' ? 'WORK' : 'REST'}
                </Badge>
                <div className="text-sm text-cyan-200">
                  Round {currentRound} of {totalRounds}
                </div>
              </div>

              {/* Circular Progress Timer */}
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-cyan-900/50"
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

            {/* Custom Settings */}
            <Card className="bg-cyan-900/40 border-cyan-500/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-cyan-400" />
                  Custom Timer Settings
                </CardTitle>
                <CardDescription className="text-cyan-200/80">
                  Customize your interval training session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-cyan-200">Work Time (seconds)</Label>
                    <Input
                      type="number"
                      value={workTime}
                      onChange={(e) => setWorkTime(Number(e.target.value))}
                      disabled={isRunning}
                      className="bg-cyan-900/30 border-cyan-500/30 text-white focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-cyan-200">Rest Time (seconds)</Label>
                    <Input
                      type="number"
                      value={restTime}
                      onChange={(e) => setRestTime(Number(e.target.value))}
                      disabled={isRunning}
                      className="bg-cyan-900/30 border-cyan-500/30 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-cyan-200">Total Rounds</Label>
                  <Input
                    type="number"
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(Number(e.target.value))}
                    disabled={isRunning}
                    className="bg-cyan-900/30 border-cyan-500/30 text-white focus:border-cyan-400"
                  />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutTimer;
