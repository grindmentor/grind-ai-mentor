
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Timer, Zap, Trophy } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer = ({ onBack }: WorkoutTimerProps) => {
  const [workTime, setWorkTime] = useState(45);
  const [restTime, setRestTime] = useState(15);
  const [currentTime, setCurrentTime] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [completedRounds, setCompletedRounds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev - 1);
      }, 1000);
    } else if (isRunning && currentTime === 0) {
      if (isWorkPhase) {
        setIsWorkPhase(false);
        setCurrentTime(restTime);
      } else {
        setIsWorkPhase(true);
        setCurrentTime(workTime);
        setCompletedRounds(prev => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, currentTime, isWorkPhase, workTime, restTime]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsWorkPhase(true);
    setCurrentTime(workTime);
    setCompletedRounds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustTime = (type: 'work' | 'rest', direction: 'up' | 'down') => {
    if (isRunning) return;
    
    if (type === 'work') {
      const newTime = direction === 'up' ? workTime + 5 : Math.max(5, workTime - 5);
      setWorkTime(newTime);
      if (isWorkPhase) setCurrentTime(newTime);
    } else {
      const newTime = direction === 'up' ? restTime + 5 : Math.max(5, restTime - 5);
      setRestTime(newTime);
      if (!isWorkPhase) setCurrentTime(newTime);
    }
  };

  const progressPercentage = isWorkPhase 
    ? ((workTime - currentTime) / workTime) * 100
    : ((restTime - currentTime) / restTime) * 100;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Workout Timer</h1>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Free Tool
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Timer Display */}
          <AnimatedCard className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="relative">
                <div className={`text-6xl md:text-7xl font-bold font-mono ${isWorkPhase ? 'text-green-400' : 'text-orange-400'} mb-4`}>
                  {formatTime(currentTime)}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      isWorkPhase ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <Badge className={`text-lg px-4 py-2 ${
                  isWorkPhase 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                }`}>
                  {isWorkPhase ? '🔥 WORK TIME' : '💪 REST TIME'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleStartPause}
                  size="lg"
                  className={`px-8 py-3 text-lg font-semibold ${
                    isRunning 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  size="lg"
                  className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
              
              <div className="text-center bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-400 font-medium">Rounds Completed</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{completedRounds}</div>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Settings Panel */}
          <AnimatedCard className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700" delay={200}>
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Timer className="w-5 h-5 mr-2 text-cyan-400" />
                Timer Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize your work and rest intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Work Time Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Work Time</label>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    High Intensity
                  </Badge>
                </div>
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <Button
                    onClick={() => adjustTime('work', 'down')}
                    disabled={isRunning}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{workTime}</div>
                    <div className="text-sm text-gray-400">seconds</div>
                  </div>
                  <Button
                    onClick={() => adjustTime('work', 'up')}
                    disabled={isRunning}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Rest Time Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Rest Time</label>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    Recovery
                  </Badge>
                </div>
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <Button
                    onClick={() => adjustTime('rest', 'down')}
                    disabled={isRunning}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{restTime}</div>
                    <div className="text-sm text-gray-400">seconds</div>
                  </div>
                  <Button
                    onClick={() => adjustTime('rest', 'up')}
                    disabled={isRunning}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "HIIT", work: 30, rest: 10 },
                    { name: "Tabata", work: 20, rest: 10 },
                    { name: "Strength", work: 60, rest: 30 },
                    { name: "Cardio", work: 45, rest: 15 }
                  ].map((preset) => (
                    <Button
                      key={preset.name}
                      onClick={() => {
                        if (!isRunning) {
                          setWorkTime(preset.work);
                          setRestTime(preset.rest);
                          setCurrentTime(preset.work);
                          setIsWorkPhase(true);
                        }
                      }}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;
