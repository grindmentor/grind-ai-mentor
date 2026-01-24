import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Dumbbell, Clock, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { RateLimitBadge, RateLimitWarning } from '@/components/ui/rate-limit-badge';
import { MobileHeader } from '@/components/MobileHeader';
import FormattedAIResponse from '@/components/FormattedAIResponse';
import FeatureGate from '@/components/FeatureGate';
import { aiService } from '@/services/aiService';
import { handleError, handleSuccess } from '@/utils/standardErrorHandler';
import { cn } from '@/lib/utils';

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
    trainingApproach: 'evidence_based',
    notes: ''
  });
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [savedPrograms, setSavedPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadSavedPrograms();
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
    
    // Add timeout for long-running requests
    const timeoutId = setTimeout(() => {
      if (isGenerating) {
        toast({
          title: 'Still Working...',
          description: 'This is taking longer than expected. Using fallback program.',
        });
      }
    }, 15000);
    
    try {
      const isMinimalist = programData.trainingApproach === 'minimalist';
      
      const prompt = `Create a ${programData.daysPerWeek || 4} day per week training program for ${programData.duration || 8} weeks.

PROGRAM DETAILS:
- Name: ${programData.name}
- Goal: ${programData.goal}
- Experience: ${programData.experienceLevel || 'intermediate'}
- Approach: ${isMinimalist ? 'Minimalist (2-3 sets, high effort)' : 'Standard volume'}
- Equipment: ${programData.equipment || 'Full gym'}

${isMinimalist ? 'Use 2-3 sets of 4-6 reps for compounds with 3-5 min rest.' : 'Use 2-4 sets per exercise, 4-12 reps.'}

Include workout structure with exercises, sets, reps, rest periods.`;

      // Use Promise.race with timeout
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 25000)
      );
      
      const response = await Promise.race([
        aiService.getTrainingAdvice(prompt, {
          maxTokens: 1500,
          priority: 'high',
          useCache: true
        }),
        timeoutPromise
      ]);
      
      clearTimeout(timeoutId);
      
      // Check if the response indicates an error
      if (response.includes("having trouble")) {
        throw new Error('AI service unavailable');
      }
      
      setGeneratedProgram({
        name: programData.name,
        goal: programData.goal,
        duration: parseInt(programData.duration) || 8,
        daysPerWeek: parseInt(programData.daysPerWeek) || 4,
        approach: programData.trainingApproach,
        content: response
      });
      
      handleSuccess('Program Generated!', {
        description: `Your ${isMinimalist ? 'minimalist' : 'standard'} training program is ready!`
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('SmartTraining error:', error);
      
      // Always provide fallback program so user isn't stuck
      setGeneratedProgram({
        name: programData.name,
        goal: programData.goal,
        duration: parseInt(programData.duration) || 8,
        daysPerWeek: parseInt(programData.daysPerWeek) || 4,
        approach: programData.trainingApproach,
        content: generateFallbackProgram(programData)
      });
      
      toast({
        title: 'Using Fallback Program',
        description: 'AI was slow to respond. Here\'s a science-based template instead.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackProgram = (data: typeof programData) => `# ${data.name}

## Program Overview
- **Goal**: ${data.goal}
- **Duration**: ${data.duration || 8} weeks
- **Frequency**: ${data.daysPerWeek || 4} days/week
- **Approach**: ${data.trainingApproach === 'minimalist' ? 'Evidence-Based Minimalist' : 'Evidence-Based Standard'}

## Week Structure

### Day 1 - Push
1. **Bench Press**: 3x6-8 (3 min rest)
2. **Overhead Press**: 3x8-10 (2-3 min rest)
3. **Incline DB Press**: 3x10-12 (2 min rest)
4. **Lateral Raises**: 3x12-15 (90 sec rest)
5. **Tricep Pushdowns**: 3x12-15 (60 sec rest)

### Day 2 - Pull
1. **Barbell Rows**: 3x6-8 (3 min rest)
2. **Lat Pulldowns**: 3x8-10 (2-3 min rest)
3. **Seated Rows**: 3x10-12 (2 min rest)
4. **Face Pulls**: 3x15-20 (60 sec rest)
5. **Barbell Curls**: 3x10-12 (60 sec rest)

### Day 3 - Legs
1. **Back Squat**: 3x6-8 (3-4 min rest)
2. **Romanian Deadlift**: 3x8-10 (2-3 min rest)
3. **Leg Press**: 3x10-12 (2 min rest)
4. **Leg Curls**: 3x12-15 (90 sec rest)
5. **Calf Raises**: 4x15-20 (60 sec rest)

### Day 4 - Upper
1. **Incline Bench**: 3x8-10 (2-3 min rest)
2. **Pull-ups**: 3x6-10 (2-3 min rest)
3. **DB Shoulder Press**: 3x10-12 (2 min rest)
4. **Cable Rows**: 3x10-12 (90 sec rest)
5. **Arm Work**: Supersets (60 sec rest)

## Progression
- Add weight when you hit top of rep range with good form
- Track all lifts and aim for progressive overload
- Deload every 4-6 weeks if needed`;

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
      toast({ title: 'Program Saved!', description: 'Your program has been saved.' });
      loadSavedPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      toast({ title: 'Error', description: 'Failed to save program.', variant: 'destructive' });
    }
  };

  return (
    <FeatureGate featureKey="training_programs" allowPreview={false}>
      <UsageLimitGuard featureKey="training_programs" featureName="Smart Training">
        <div className="min-h-screen bg-background">
          <MobileHeader title="Smart Training" onBack={onBack} />
          
          <div className="px-4 pb-28">
            {/* Hero */}
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-3 border border-blue-500/20">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">AI Training Programs</h2>
              <p className="text-sm text-muted-foreground">Evidence-based 2023-2025 research</p>
            </div>

            {/* Research Banner */}
            <div className="mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium text-xs">Latest Research</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Programs incorporate 2023-2025 findings on optimal volume, frequency, and progression.
              </p>
            </div>

            <RateLimitWarning featureKey="training_programs" featureName="Smart Training" />
          
            {!generatedProgram ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">Program Details</span>
                    <RateLimitBadge featureKey="training_programs" featureName="Programs" showProgress />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Program Name *</Label>
                      <Input
                        value={programData.name}
                        onChange={(e) => setProgramData({...programData, name: e.target.value})}
                        placeholder="e.g., Strength Builder"
                        className="h-11 bg-muted/30 border-border rounded-xl text-sm"
                        aria-label="Program name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Goal *</Label>
                      <Select value={programData.goal} onValueChange={(value) => setProgramData({...programData, goal: value})}>
                        <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl" aria-label="Select goal">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Build Strength</SelectItem>
                          <SelectItem value="cut">Cut (Lose Weight)</SelectItem>
                          <SelectItem value="bulk">Bulk (Gain Mass)</SelectItem>
                          <SelectItem value="recomp">Body Recomp</SelectItem>
                          <SelectItem value="general">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Training Approach</Label>
                    <Select value={programData.trainingApproach} onValueChange={(value) => setProgramData({...programData, trainingApproach: value})}>
                      <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl" aria-label="Training approach">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimalist">Minimalist (2-3 sets, high effort)</SelectItem>
                        <SelectItem value="evidence_based">Standard (moderate volume)</SelectItem>
                        <SelectItem value="traditional">Traditional High-Volume</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Experience</Label>
                      <Select value={programData.experienceLevel} onValueChange={(value) => setProgramData({...programData, experienceLevel: value})}>
                        <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl" aria-label="Experience level">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Days/Week</Label>
                      <Select value={programData.daysPerWeek} onValueChange={(value) => setProgramData({...programData, daysPerWeek: value})}>
                        <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl" aria-label="Days per week">
                          <SelectValue placeholder="Days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Days</SelectItem>
                          <SelectItem value="4">4 Days</SelectItem>
                          <SelectItem value="5">5 Days</SelectItem>
                          <SelectItem value="6">6 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Weeks</Label>
                      <Input
                        type="number"
                        value={programData.duration}
                        onChange={(e) => setProgramData({...programData, duration: e.target.value})}
                        placeholder="8"
                        className="h-11 bg-muted/30 border-border rounded-xl text-sm"
                        aria-label="Duration in weeks"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Equipment</Label>
                    <Textarea
                      value={programData.equipment}
                      onChange={(e) => setProgramData({...programData, equipment: e.target.value})}
                      placeholder="e.g., Full gym, home gym with dumbbells..."
                      className="bg-muted/30 border-border rounded-xl min-h-[70px] resize-none text-sm"
                      aria-label="Available equipment"
                    />
                  </div>

                  <Button 
                    onClick={generateProgram}
                    disabled={!programData.name || !programData.goal || isGenerating}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl text-sm font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Program
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Program Header */}
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{generatedProgram.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{generatedProgram.goal} • {generatedProgram.duration} weeks</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {generatedProgram.daysPerWeek}x/week
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-background/50 rounded-lg">
                      <Calendar className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="text-sm font-medium text-foreground">{generatedProgram.duration} weeks</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded-lg">
                      <Dumbbell className="w-4 h-4 mx-auto mb-1 text-green-400" />
                      <div className="text-xs text-muted-foreground">Frequency</div>
                      <div className="text-sm font-medium text-foreground">{generatedProgram.daysPerWeek}x/week</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded-lg">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                      <div className="text-xs text-muted-foreground">Approach</div>
                      <div className="text-sm font-medium text-foreground capitalize">{generatedProgram.approach.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                {/* Program Content */}
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20">Program Details</Badge>
                      <Button onClick={saveProgram} size="sm" variant="ghost" className="text-xs" aria-label="Save program">
                        Save Program
                      </Button>
                    </div>
                    
                    <div className="bg-muted/30 rounded-xl border border-border/50 p-4 max-h-[400px] overflow-y-auto scroll-native">
                      <FormattedAIResponse content={generatedProgram.content} />
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={() => setGeneratedProgram(null)}
                  variant="outline"
                  className="w-full h-11 rounded-xl border-border"
                >
                  Create New Program
                </Button>
              </div>
            )}

            {/* Saved Programs */}
            {savedPrograms.length > 0 && !generatedProgram && (
              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-foreground text-sm">Saved Programs</h3>
                {savedPrograms.map((program) => (
                  <div key={program.id} className="p-3 bg-card/50 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{program.name}</h4>
                        <p className="text-xs text-muted-foreground">{program.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{program.difficulty_level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </UsageLimitGuard>
    </FeatureGate>
  );
};

export default SmartTraining;
