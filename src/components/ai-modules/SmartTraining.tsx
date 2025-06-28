
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Dumbbell, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import FormattedAIResponse from '@/components/FormattedAIResponse';

interface SmartTrainingProps {
  onBack: () => void;
}

export const SmartTraining: React.FC<SmartTrainingProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
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

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Create a comprehensive ${programData.daysPerWeek || 4} day per week training program for ${programData.duration || 8} weeks.

PROGRAM DETAILS:
- Name: ${programData.name}
- Primary Goal: ${programData.goal}
- Experience Level: ${programData.experienceLevel}
- Available Equipment: ${programData.equipment || 'Full gym access'}
- Additional Notes: ${programData.notes}

REQUIREMENTS:
1. Generate a COMPLETE program structure with specific workouts for each day
2. Include exercise selection, sets, reps, and rest periods
3. Structure with clear phases or progression over the ${programData.duration || 8} weeks
4. Format using markdown with clear headings and sections
5. Include warm-up and cool-down recommendations
6. Provide weekly progression guidelines

FORMAT STRUCTURE:
### Program Overview
- **Duration:** ${programData.duration || 8} weeks
- **Frequency:** ${programData.daysPerWeek || 4} days per week
- **Primary Goal:** ${programData.goal}
- **Experience Level:** ${programData.experienceLevel}

### Phase 1: Foundation (Weeks 1-2)
#### Day 1: Upper Body Push
**Warm-up (10 minutes)**
- Dynamic stretching and activation

**Main Workout**
1. Exercise Name - 3 x 8-10 (Rest: 90s)
2. Exercise Name - 3 x 10-12 (Rest: 60s)
[Continue with 6-8 exercises]

**Cool-down (5 minutes)**
- Static stretching

#### Day 2: Lower Body
[Similar detailed format]

#### Day 3: Upper Body Pull
[Similar detailed format]

#### Day 4: Full Body/Conditioning
[Similar detailed format]

### Phase 2: Development (Weeks 3-5)
[Detailed progression for each day]

### Phase 3: Peak (Weeks 6-8)
[Advanced progression for each day]

### Weekly Progression Guidelines
- **Week 1-2:** Focus on form and movement patterns
- **Week 3-4:** Increase intensity by 10-15%
- **Week 5-6:** Peak intensity, advanced techniques
- **Week 7-8:** Deload and reassess

### Important Notes & Tips
- Proper form guidelines
- Recovery recommendations
- Nutrition timing suggestions`,
          type: 'training',
          maxTokens: 2000
        }
      });

      if (error) throw error;

      const response = data?.response || "Failed to generate program. Please try again.";
      
      setGeneratedProgram({
        name: programData.name,
        goal: programData.goal,
        duration: parseInt(programData.duration) || 8,
        daysPerWeek: parseInt(programData.daysPerWeek) || 4,
        content: response
      });
      
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

  return (
    <UsageLimitGuard featureKey="training_programs" featureName="Smart Training">
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20">
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
                  <CardTitle className="text-white text-xl">Smart Training</CardTitle>
                  <CardDescription className="text-blue-200/80">
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
                      <Label className="text-blue-200">Program Name</Label>
                      <Input
                        value={programData.name}
                        onChange={(e) => setProgramData({...programData, name: e.target.value})}
                        placeholder="e.g., Strength Building Program"
                        className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-blue-200">Primary Goal</Label>
                      <Select value={programData.goal} onValueChange={(value) => setProgramData({...programData, goal: value})}>
                        <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-900 border-blue-500">
                          <SelectItem value="strength">Build Strength</SelectItem>
                          <SelectItem value="cut">Cut (Lose Weight)</SelectItem>
                          <SelectItem value="bulk">Bulk (Gain Muscle)</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="hybrid">Hybrid Athlete</SelectItem>
                          <SelectItem value="recomp">Body Recomp</SelectItem>
                          <SelectItem value="general">General Health</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="powerlifting">Powerlifting</SelectItem>
                          <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-200">Experience Level</Label>
                      <Select value={programData.experienceLevel} onValueChange={(value) => setProgramData({...programData, experienceLevel: value})}>
                        <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
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
                      <Label className="text-blue-200">Days per Week</Label>
                      <Select value={programData.daysPerWeek} onValueChange={(value) => setProgramData({...programData, daysPerWeek: value})}>
                        <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
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
                      <Label className="text-blue-200">Duration (weeks)</Label>
                      <Input
                        type="number"
                        value={programData.duration}
                        onChange={(e) => setProgramData({...programData, duration: e.target.value})}
                        placeholder="8"
                        className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-200">Available Equipment</Label>
                    <Textarea
                      value={programData.equipment}
                      onChange={(e) => setProgramData({...programData, equipment: e.target.value})}
                      placeholder="Describe your available equipment in detail (e.g., Full commercial gym with barbells, dumbbells, machines, cables, squat rack, bench press, leg press, etc. OR Home gym with adjustable dumbbells, resistance bands, pull-up bar, kettlebells OR Bodyweight only - no equipment available)"
                      className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50 min-h-[120px]"
                    />
                    <p className="text-blue-300/60 text-xs">
                      💡 Be specific about your equipment for better program customization
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-200">Additional Notes (Optional)</Label>
                    <Textarea
                      value={programData.notes}
                      onChange={(e) => setProgramData({...programData, notes: e.target.value})}
                      placeholder="Any specific preferences, limitations, injuries, or goals (e.g., focus on compound movements, avoid certain exercises, time constraints, etc.)"
                      className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50"
                    />
                  </div>

                  <Button
                    onClick={generateProgram}
                    disabled={isGenerating || !programData.name || !programData.goal}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{generatedProgram.name}</h2>
                      <p className="text-blue-200">{generatedProgram.goal} • {generatedProgram.duration} weeks • {generatedProgram.daysPerWeek} days/week</p>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={saveProgram} className="bg-green-600 hover:bg-green-700">
                        Save Program
                      </Button>
                      <Button onClick={() => setGeneratedProgram(null)} variant="outline" className="border-blue-500/50 text-blue-200 hover:bg-blue-500/10">
                        Generate New
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-blue-900/40 border-blue-500/40">
                    <CardContent className="p-6">
                      <FormattedAIResponse content={generatedProgram.content} moduleType="training" />
                    </CardContent>
                  </Card>
                </div>
              )}

              {savedPrograms.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-200">Your Saved Programs</h3>
                  <div className="grid gap-3">
                    {savedPrograms.map((program) => (
                      <Card key={program.id} className="bg-blue-900/40 border-blue-500/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">{program.name}</h4>
                              <p className="text-blue-300 text-sm">{program.description}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
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
