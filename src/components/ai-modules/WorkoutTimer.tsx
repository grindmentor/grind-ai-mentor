
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Timer, ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Info } from 'lucide-react';

interface WorkoutTimerProps {
  onBack: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ onBack }) => {
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            // Play notification sound
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBzeb2/EAAQABAAABAAEBAQIBAQ');
              audio.play().catch(() => {
                // Fallback if audio fails
                console.log('Timer completed!');
              });
            } catch (e) {
              console.log('Timer completed!');
            }
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsActive(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsCompleted(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustMinutes = (increment: boolean) => {
    if (increment) {
      setMinutes(prev => Math.min(prev + 1, 60));
    } else {
      setMinutes(prev => Math.max(prev - 1, 0));
    }
  };

  const adjustSeconds = (increment: boolean) => {
    if (increment) {
      setSeconds(prev => prev === 45 ? 0 : prev + 15);
    } else {
      setSeconds(prev => prev === 0 ? 45 : prev - 15);
    }
  };

  const restRecommendations = [
    {
      title: "Hypertrophy (Muscle Building)",
      rest: "60-90 seconds",
      description: "Optimal for muscle growth with moderate fatigue",
      intensity: "RPE 7-8, 65-85% 1RM",
      science: "Maintains high training volume while allowing adequate recovery"
    },
    {
      title: "Strength Training",
      rest: "2-5 minutes",
      description: "Full recovery for maximal force production",
      intensity: "RPE 8-9, 85-95% 1RM",
      science: "Allows complete ATP-PC system recovery for strength gains"
    },
    {
      title: "Power Training",
      rest: "2-3 minutes",
      description: "Complete recovery for explosive movements",
      intensity: "40-65% 1RM, explosive intent",
      science: "Prevents neuromuscular fatigue that impairs power output"
    },
    {
      title: "Endurance/Conditioning",
      rest: "30-60 seconds",
      description: "Maintain elevated heart rate for conditioning",
      intensity: "65-75% max HR",
      science: "Challenges energy systems while maintaining work capacity"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 text-white p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-orange-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 border border-orange-400/20">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Workout Timer
                </h1>
                <p className="text-slate-400 text-lg">Science-based rest periods for optimal training</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2 text-sm">
            <Timer className="w-4 h-4 mr-2" />
            Evidence-based rest recommendations
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Timer Panel */}
          <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Timer className="w-5 h-5 mr-2 text-orange-400" />
                Rest Timer
              </CardTitle>
              <CardDescription className="text-slate-400">
                Track your rest periods between sets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className={`text-8xl font-bold mb-4 ${
                  isCompleted ? 'text-green-400' : 
                  isActive ? 'text-orange-400' : 'text-white'
                }`}>
                  {formatTime(timeLeft || (minutes * 60 + seconds))}
                </div>
                {isCompleted && (
                  <div className="text-green-400 font-medium text-lg mb-4">
                    Rest Complete! Ready for next set 💪
                  </div>
                )}
              </div>

              {/* Time Controls */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Minutes</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustMinutes(false)}
                      disabled={isActive}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 h-10 w-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
                      disabled={isActive}
                      className="bg-slate-800/50 border-slate-600/50 text-white text-center"
                      min="0"
                      max="60"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustMinutes(true)}
                      disabled={isActive}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 h-10 w-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Seconds</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustSeconds(false)}
                      disabled={isActive}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 h-10 w-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={seconds}
                      onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      disabled={isActive}
                      className="bg-slate-800/50 border-slate-600/50 text-white text-center"
                      min="0"
                      max="59"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustSeconds(true)}
                      disabled={isActive}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 h-10 w-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-slate-300">Quick Presets</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "1:00", mins: 1, secs: 0 },
                    { label: "1:30", mins: 1, secs: 30 },
                    { label: "2:00", mins: 2, secs: 0 },
                    { label: "3:00", mins: 3, secs: 0 }
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMinutes(preset.mins);
                        setSeconds(preset.secs);
                      }}
                      disabled={isActive}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-4">
                {!isActive ? (
                  <Button 
                    onClick={startTimer}
                    disabled={minutes === 0 && seconds === 0}
                    className="flex-1 bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-600/80 hover:to-red-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Timer
                  </Button>
                ) : (
                  <Button 
                    onClick={pauseTimer}
                    className="flex-1 bg-slate-600/80 hover:bg-slate-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button 
                  onClick={resetTimer}
                  variant="outline"
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 py-3 px-6 rounded-xl transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rest Guidelines Panel */}
          <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-orange-400" />
                Rest Guidelines
              </CardTitle>
              <CardDescription className="text-slate-400">
                Science-based rest recommendations by training goal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {restRecommendations.map((recommendation, index) => (
                <div key={index} className="bg-slate-800/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{recommendation.title}</h4>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {recommendation.rest}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm">{recommendation.description}</p>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div><strong>Intensity:</strong> {recommendation.intensity}</div>
                    <div><strong>Science:</strong> {recommendation.science}</div>
                  </div>
                </div>
              ))}

              {/* Additional Tips */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20 mt-6">
                <h4 className="text-orange-300 font-medium mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Longer rest = better strength performance</li>
                  <li>• Shorter rest = better metabolic stress for hypertrophy</li>
                  <li>• Listen to your body - adjust based on fatigue</li>
                  <li>• Heart rate ~120 BPM indicates readiness for strength</li>
                  <li>• Supersets can reduce total workout time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;
