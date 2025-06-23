
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer = ({ onBack }: WorkoutTimerProps) => {
  const [workTime, setWorkTime] = useState(45); // seconds
  const [restTime, setRestTime] = useState(15); // seconds
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
      // Switch phases
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-white">Workout Timer</h1>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Free Tool
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timer Display */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className={`text-4xl ${isWorkPhase ? 'text-green-400' : 'text-orange-400'}`}>
              {formatTime(currentTime)}
            </CardTitle>
            <CardDescription className="text-xl">
              <Badge className={`${isWorkPhase ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                {isWorkPhase ? 'WORK' : 'REST'}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleStartPause}
                className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={handleReset} variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Rounds Completed</p>
              <p className="text-2xl font-bold text-white">{completedRounds}</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Timer Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Adjust work and rest intervals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Work Time */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Work Time (seconds)</label>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => adjustTime('work', 'down')}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold text-white">{workTime}s</span>
                <Button
                  onClick={() => adjustTime('work', 'up')}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Rest Time */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Rest Time (seconds)</label>
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => adjustTime('rest', 'down')}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold text-white">{restTime}s</span>
                <Button
                  onClick={() => adjustTime('rest', 'up')}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutTimer;
