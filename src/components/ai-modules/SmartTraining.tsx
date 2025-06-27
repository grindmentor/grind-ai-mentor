import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Target, Calendar, Dumbbell, Clock, Crown, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscription } from '@/hooks/useSubscription';

interface SmartTrainingProps {
  onBack: () => void;
}

export const SmartTraining: React.FC<SmartTrainingProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { currentTier } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [programData, setProgramData] = useState({
    name: '',
    goal: '',
    experienceLevel: '',
    daysPerWeek: '',
    duration: '',
    equipment: '',
    notes: ''
  });
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [savedPrograms, setSavedPrograms] = useState<any[]>([]);

  const isPaidUser = currentTier !== 'free';

  useEffect(() => {
    if (user) {
      loadSavedPrograms();
    }
  }, [user]);

  const loadSavedPrograms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSavedPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const generateProgram = async () => {
    if (!user || !programData.name || !programData.goal) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in program name and goal.',
        variant: 'destructive'
      });
      return;
    }

    if (!isPaidUser) {
      toast({
        title: 'Premium Feature',
        description: 'Upgrade to generate custom training programs',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation for now - in production this would call an AI service
      const mockProgram = {
        name: programData.name,
        goal: programData.goal,
        duration: parseInt(programData.duration) || 8,
        workouts: [
          {
            day: 'Monday',
            name: 'Upper Body Strength',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: '6-8', weight: 'Progressive' },
              { name: 'Bent-Over Row', sets: 4, reps: '6-8', weight: 'Progressive' },
              { name: 'Overhead Press', sets: 3, reps: '8-10', weight: 'Progressive' },
              { name: 'Pull-ups', sets: 3, reps: 'To failure', weight: 'Bodyweight' }
            ]
          },
          {
            day: 'Wednesday',
            name: 'Lower Body Power',
            exercises: [
              { name: 'Squats', sets: 4, reps: '6-8', weight: 'Progressive' },
              { name: 'Romanian Deadlift', sets: 3, reps: '8-10', weight: 'Progressive' },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each leg', weight: 'Bodyweight' },
              { name: 'Calf Raises', sets: 4, reps: '15-20', weight: 'Progressive' }
            ]
          },
          {
            day: 'Friday',
            name: 'Full Body Circuit',
            exercises: [
              { name: 'Deadlift', sets: 3, reps: '6-8', weight: 'Progressive' },
              { name: 'Push-ups', sets: 3, reps: 'To failure', weight: 'Bodyweight' },
              { name: 'Lunges', sets: 3, reps: '12-15 each leg', weight: 'Bodyweight' },
              { name: 'Plank', sets: 3, reps: '60 seconds', weight: 'Bodyweight' }
            ]
          }
        ]
      };

      setGeneratedProgram(mockProgram);
      
      toast({
        title: 'Program Generated! 🎯',
        description: 'Your personalized training program is ready!'
      });
    } catch (error) {
      console.error('Error generating program:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate program. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveProgram = async () => {
    if (!user || !generatedProgram) return;

    try {
      const { error } = await supabase
        .from('training_programs')
        .insert({
          user_id: user.id,
          name: generatedProgram.name,
          description: `${generatedProgram.goal} - ${generatedProgram.duration} weeks`,
          duration_weeks: generatedProgram.duration,
          difficulty_level: programData.experienceLevel,
          program_data: generatedProgram
        });

      if (error) throw error;

      toast({
        title: 'Program Saved! 💾',
        description: 'Your training program has been saved to your library.'
      });

      loadSavedPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: 'Error',
        description: 'Failed to save program. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
        <MobileHeader 
          title="Smart Training" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                    Smart Training
                    <Crown className="w-5 h-5 ml-2 text-yellow-400" />
                  </CardTitle>
                  <CardDescription className="text-blue-200/80 text-sm sm:text-base">
                    Premium feature - AI-powered personalized training programs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Lock className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Premium Feature</h3>
                <p className="text-blue-300/70 mb-6 max-w-md mx-auto">
                  Unlock personalized training programs with AI-powered workout generation. 
                  Get custom programs tailored to your goals, experience level, and available equipment.
                </p>
                
                {/* Preview Interface */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 mb-6 opacity-60">
                  <h4 className="text-blue-200 font-medium mb-4">Preview: Sample Training Program</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="space-y-2">
                      <h5 className="text-blue-300 font-medium text-sm">Day 1: Upper Body</h5>
                      <p className="text-blue-200/80 text-xs">• Bench Press 4x6-8</p>
                      <p className="text-blue-200/80 text-xs">• Bent-Over Row 4x6-8</p>
                      <p className="text-blue-200/80 text-xs">• Overhead Press 3x8-10</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-blue-300 font-medium text-sm">Day 2: Lower Body</h5>
                      <p className="text-blue-200/80 text-xs">• Squats 4x6-8</p>
                      <p className="text-blue-200/80 text-xs">• Romanian Deadlift 3x8-10</p>
                      <p className="text-blue-200/80 text-xs">• Bulgarian Split Squats 3x10-12</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-blue-300 font-medium text-sm">Day 3: Full Body</h5>
                      <p className="text-blue-200/80 text-xs">• Deadlift 3x6-8</p>
                      <p className="text-blue-200/80 text-xs">• Push-ups 3xFailure</p>
                      <p className="text-blue-200/80 text-xs">• Lunges 3x12-15</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => window.location.href = '/subscription'}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <UsageLimitGuard featureKey="training_programs" featureName="Smart Training">
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
        <MobileHeader 
          title="Smart Training" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">Smart Training</CardTitle>
                  <CardDescription className="text-blue-200/80 text-sm sm:text-base">
                    AI-powered personalized training programs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!generatedProgram ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-200 text-sm sm:text-base">Program Name</Label>
                      <Input
                        value={programData.name}
                        onChange={(e) => setProgramData({...programData, name: e.target.value})}
                        placeholder="e.g., Strength Building Program"
                        className="bg-blue-900/30 border-blue-500/50 text-white text-sm sm:text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-blue-200 text-sm sm:text-base">Primary Goal</Label>
                      <Select value={programData.goal} onValueChange={(value) => setProgramData({...programData, goal: value})}>
                        <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white text-sm sm:text-base">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-900 border-blue-500">
                          <SelectItem value="strength">Build Strength</SelectItem>
                          <SelectItem value="muscle">Muscle Growth</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="fat-loss">Fat Loss</SelectItem>
                          <SelectItem value="general">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-200 text-sm sm:text-base">Experience Level</Label>
                      <Select value={programData.experienceLevel} onValueChange={(value) => setProgramData({...programData, experienceLevel: value})}>
                        <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white text-sm sm:text-base">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-900 border-blue-500">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-blue-200 text-sm sm:text-base">Days per Week</Label>
                      <Select value={programData.daysPerWeek} onValueChange={(value) => setProgramData({...programData, daysPerWeek: value})}>
                        <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white text-sm sm:text-base">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-900 border-blue-500">
                          <SelectItem value="3">3 Days</SelectItem>
                          <SelectItem value="4">4 Days</SelectItem>
                          <SelectItem value="5">5 Days</SelectItem>
                          <SelectItem value="6">6 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-blue-200 text-sm sm:text-base">Duration (weeks)</Label>
                      <Input
                        type="number"
                        value={programData.duration}
                        onChange={(e) => setProgramData({...programData, duration: e.target.value})}
                        placeholder="8"
                        className="bg-blue-900/30 border-blue-500/50 text-white text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-200 text-sm sm:text-base">Available Equipment</Label>
                    <Textarea
                      value={programData.equipment}
                      onChange={(e) => setProgramData({...programData, equipment: e.target.value})}
                      placeholder="e.g., Full gym, dumbbells only, bodyweight only"
                      className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-200/50 text-sm sm:text-base"
                    />
                  </div>

                  <Button
                    onClick={generateProgram}
                    disabled={isGenerating || !programData.name || !programData.goal}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3 text-sm sm:text-base"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating Program...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Training Program
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{generatedProgram.name}</h2>
                      <p className="text-blue-200 text-sm sm:text-base">{generatedProgram.goal} • {generatedProgram.duration} weeks</p>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={saveProgram} className="bg-green-600 hover:bg-green-700" size="sm">
                        Save Program
                      </Button>
                      <Button onClick={() => setGeneratedProgram(null)} variant="outline" size="sm">
                        Generate New
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedProgram.workouts.map((workout: any, index: number) => (
                      <Card key={index} className="bg-blue-900/40 border-blue-500/40">
                        <CardHeader>
                          <CardTitle className="text-blue-200 flex items-center text-sm sm:text-base">
                            <Calendar className="w-4 h-4 mr-2" />
                            {workout.day} - {workout.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {workout.exercises.map((exercise: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-blue-800/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Dumbbell className="w-4 h-4 text-blue-400" />
                                  <span className="text-white font-medium text-sm sm:text-base">{exercise.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-blue-200 text-xs sm:text-sm">
                                    {exercise.sets} sets × {exercise.reps}
                                  </div>
                                  <div className="text-blue-300 text-xs">{exercise.weight}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {savedPrograms.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-200 text-sm sm:text-base">Your Saved Programs</h3>
                  <div className="grid gap-3">
                    {savedPrograms.map((program) => (
                      <Card key={program.id} className="bg-blue-900/40 border-blue-500/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white text-sm sm:text-base">{program.name}</h4>
                              <p className="text-blue-300 text-xs sm:text-sm">{program.description}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {program.duration_weeks} weeks
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UsageLimitGuard>
  );
};

export default SmartTraining;
