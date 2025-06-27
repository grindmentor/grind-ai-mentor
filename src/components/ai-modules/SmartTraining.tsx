
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Target, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

interface SmartTrainingProps {
  onBack: () => void;
}

interface WorkoutPlan {
  id: string;
  name: string;
  duration: string;
  exercises: Exercise[];
  totalSets: number;
  estimatedTime: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restTime: string;
  targetMuscles: string[];
  instructions: string;
}

const SmartTraining = ({ onBack }: SmartTrainingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [preferences, setPreferences] = useState({
    goal: '',
    experience: '',
    duration: '',
    equipment: '',
    focusArea: ''
  });

  const generateWorkout = async () => {
    if (!user || !preferences.goal || !preferences.experience) {
      toast({
        title: "Missing information",
        description: "Please fill in your training goal and experience level.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockExercises: Exercise[] = [
        {
          name: "Barbell Squat",
          sets: 4,
          reps: "8-10",
          restTime: "2-3 min",
          targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
          instructions: "Keep your chest up and core tight throughout the movement"
        },
        {
          name: "Bench Press",
          sets: 4,
          reps: "8-10", 
          restTime: "2-3 min",
          targetMuscles: ["Chest", "Shoulders", "Triceps"],
          instructions: "Lower the bar to your chest with control, press up explosively"
        },
        {
          name: "Bent-Over Row",
          sets: 3,
          reps: "10-12",
          restTime: "90s",
          targetMuscles: ["Back", "Biceps"],
          instructions: "Keep your back straight and pull the bar to your lower chest"
        },
        {
          name: "Overhead Press",
          sets: 3,
          reps: "8-10",
          restTime: "2 min",
          targetMuscles: ["Shoulders", "Triceps", "Core"],
          instructions: "Press the bar straight up, keep your core engaged"
        }
      ];

      const generatedPlan: WorkoutPlan = {
        id: Date.now().toString(),
        name: `${preferences.goal} Training Session`,
        duration: preferences.duration || "60-75 minutes",
        exercises: mockExercises,
        totalSets: mockExercises.reduce((sum, ex) => sum + ex.sets, 0),
        estimatedTime: 70
      };

      setWorkoutPlan(generatedPlan);

      toast({
        title: "Workout generated!",
        description: "Your personalized training plan is ready.",
      });
    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-pink-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-red-500/20 backdrop-blur-sm w-fit"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "Back" : "Back to Dashboard"}
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500/20 to-pink-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-red-400/20">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                    Smart Training
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">AI-powered workout planning</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center sm:justify-start">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Personalized Training
              </Badge>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card className="bg-gray-900/40 backdrop-blur-sm border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-red-400" />
                    Training Preferences
                  </CardTitle>
                  <CardDescription>
                    Tell us about your goals and experience for a personalized workout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Training Goal</Label>
                    <Select value={preferences.goal} onValueChange={(value) => setPreferences({...preferences, goal: value})}>
                      <SelectTrigger className="bg-gray-800 border-red-500/30 text-white">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="strength">Build Strength</SelectItem>
                        <SelectItem value="muscle">Build Muscle</SelectItem>
                        <SelectItem value="endurance">Improve Endurance</SelectItem>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="general">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Experience Level</Label>
                    <Select value={preferences.experience} onValueChange={(value) => setPreferences({...preferences, experience: value})}>
                      <SelectTrigger className="bg-gray-800 border-red-500/30 text-white">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (6 months - 2 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Workout Duration</Label>
                    <Select value={preferences.duration} onValueChange={(value) => setPreferences({...preferences, duration: value})}>
                      <SelectTrigger className="bg-gray-800 border-red-500/30 text-white">
                        <SelectValue placeholder="How long do you want to train?" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="30-45">30-45 minutes</SelectItem>
                        <SelectItem value="45-60">45-60 minutes</SelectItem>
                        <SelectItem value="60-75">60-75 minutes</SelectItem>
                        <SelectItem value="75-90">75-90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Available Equipment</Label>
                    <Select value={preferences.equipment} onValueChange={(value) => setPreferences({...preferences, equipment: value})}>
                      <SelectTrigger className="bg-gray-800 border-red-500/30 text-white">
                        <SelectValue placeholder="What equipment do you have?" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="full-gym">Full Gym</SelectItem>
                        <SelectItem value="home-gym">Home Gym (Basic)</SelectItem>
                        <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Focus Area (Optional)</Label>
                    <Select value={preferences.focusArea} onValueChange={(value) => setPreferences({...preferences, focusArea: value})}>
                      <SelectTrigger className="bg-gray-800 border-red-500/30 text-white">
                        <SelectValue placeholder="Any specific focus?" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-red-500/30">
                        <SelectItem value="upper">Upper Body</SelectItem>
                        <SelectItem value="lower">Lower Body</SelectItem>
                        <SelectItem value="core">Core & Abs</SelectItem>
                        <SelectItem value="full-body">Full Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateWorkout}
                    disabled={!preferences.goal || !preferences.experience || isGenerating}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Workout...
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Generate Workout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card className="bg-gray-900/40 backdrop-blur-sm border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
                    Your Workout Plan
                  </CardTitle>
                  <CardDescription>
                    Personalized training session based on your goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workoutPlan ? (
                    <div className="space-y-6">
                      {/* Workout Summary */}
                      <div className="bg-gray-800/20 rounded-lg p-4">
                        <h3 className="font-semibold text-white mb-2">{workoutPlan.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-red-400 ml-2">{workoutPlan.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Total Sets:</span>
                            <span className="text-red-400 ml-2">{workoutPlan.totalSets}</span>
                          </div>
                        </div>
                      </div>

                      {/* Exercises */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Exercises</h4>
                        {workoutPlan.exercises.map((exercise, index) => (
                          <div key={index} className="bg-gray-800/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-white">{exercise.name}</h5>
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                {exercise.sets} sets
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
                              <span>Reps: {exercise.reps}</span>
                              <span>Rest: {exercise.restTime}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Target: {exercise.targetMuscles.join(', ')}
                            </div>
                            <p className="text-xs text-gray-400">
                              {exercise.instructions}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-white font-medium mb-2">Ready to Train</h3>
                      <p className="text-gray-400 text-sm">
                        Set your preferences and generate your personalized workout
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SmartTraining;
