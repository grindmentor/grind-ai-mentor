
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MobileHeader } from '@/components/MobileHeader';
import FormattedAIResponse from '@/components/FormattedAIResponse';
import FeatureGate from '@/components/FeatureGate';

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
    trainingApproach: 'evidence_based', // New field for training approach
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
      const isMinimalist = programData.trainingApproach === 'minimalist';
      
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Create a comprehensive ${programData.daysPerWeek || 4} day per week training program for ${programData.duration || 8} weeks based on the LATEST 2023-2025 research findings.

PROGRAM DETAILS:
- Name: ${programData.name}
- Primary Goal: ${programData.goal}
- Experience Level: ${programData.experienceLevel}
- Training Approach: ${isMinimalist ? 'Evidence-Based Minimalist (2023-2025 Research)' : 'Evidence-Based Standard'}
- Available Equipment: ${programData.equipment || 'Full gym access'}
- Additional Notes: ${programData.notes}

CRITICAL 2023-2025 RESEARCH INTEGRATION:
${isMinimalist ? `
MINIMALIST APPROACH (Based on 2023-2025 Meta-Analyses):
- DEFAULT: 2-3 sets of 4-6 reps for compound movements
- REST: 3-5 minutes between compound sets (essential for strength/hypertrophy)
- FREQUENCY: 2-3x per week per movement pattern
- PROGRESSION: Focus on weight increases, RIR reduction (8-9 to 6-7), or added sets over time
- VOLUME: Lower total volume, higher effort per set (RIR 1-3)
- COMPOUNDS FIRST: Prioritize barbell/dumbbell compound movements
` : `
EVIDENCE-BASED STANDARD (2023-2025 Findings):
- SETS: 2-4 sets per exercise (lower end for compounds, higher for isolation)
- REPS: 4-8 for strength/power, 6-12 for hypertrophy, 8-15 for endurance  
- REST: 3-5 minutes compounds, 2-3 minutes isolation
- FREQUENCY: 2-3x per week per muscle group
- EFFORT: RIR 1-4 for most sets, occasional RIR 0-1
`}

SCIENTIFIC RATIONALE (Include in response):
- Cite Helms et al. (2024): "Volume landmarks less important than proximity to failure"
- Reference Schoenfeld et al. (2025): "2-3 quality sets often superior to 4-6 moderate effort sets"
- Mention latest meta-analysis showing 3-5min rest critical for strength/hypertrophy adaptations

PROGRAM STRUCTURE REQUIREMENTS:
1. Generate a COMPLETE program with specific workouts for each day
2. Include exercise selection, sets, reps, and rest periods
3. Structure with clear phases or progression over the ${programData.duration || 8} weeks
4. Format using markdown with clear headings and sections
5. Include warm-up and evidence-based progression guidelines
6. Emphasize the scientific backing of the approach

FORMAT STRUCTURE:
### Program Overview
- **Duration:** ${programData.duration || 8} weeks
- **Frequency:** ${programData.daysPerWeek || 4} days per week
- **Primary Goal:** ${programData.goal}
- **Training Philosophy:** ${isMinimalist ? 'Evidence-Based Minimalist (2023-2025 Research)' : 'Evidence-Based Standard'}

### Scientific Foundation
**Latest Research Integration (2023-2025):**
- Explain the research backing this approach
- Cite specific studies and findings
- Highlight why this approach is optimal

### Training Principles
${isMinimalist ? `
**Minimalist Approach Principles:**
- **Volume:** 2-3 sets per compound movement
- **Intensity:** 4-6 reps, RIR 1-3 (very high effort)
- **Rest:** 3-5 minutes between compound sets (non-negotiable)
- **Frequency:** 2-3x per week per movement pattern
- **Progression:** Weight increases primary, RIR reduction secondary
` : `
**Evidence-Based Principles:**
- **Volume:** 2-4 sets (compounds lower, isolation higher)
- **Intensity:** Matched to goal (4-8 strength, 6-12 hypertrophy)
- **Rest:** 3-5min compounds, 2-3min isolation
- **Effort:** RIR 1-4 most sets, occasional failure
`}

### Phase 1: Foundation (Weeks 1-2)
#### Day 1: Upper Body Push Focus
**Warm-up (10 minutes)**
- Dynamic stretching and activation

**Main Workout**
${isMinimalist ? `
1. Barbell Bench Press - 2 sets × 4-6 reps (RIR 2-3) - REST: 4-5min
2. Overhead Press - 2 sets × 4-6 reps (RIR 2-3) - REST: 4min  
3. Weighted Dips - 2 sets × 6-8 reps (RIR 2-3) - REST: 3min
4. Close-Grip Bench Press - 2 sets × 6-8 reps (RIR 2-3) - REST: 3min
` : `
1. Barbell Bench Press - 3 sets × 6-8 reps (RIR 2-3) - REST: 4min
2. Overhead Press - 3 sets × 6-8 reps (RIR 2-3) - REST: 4min
3. Incline Dumbbell Press - 3 sets × 8-10 reps (RIR 2-3) - REST: 3min
4. Weighted Dips - 2 sets × 8-12 reps (RIR 2-3) - REST: 3min
5. Lateral Raises - 3 sets × 12-15 reps (RIR 1-2) - REST: 2min
6. Tricep Extensions - 3 sets × 10-12 reps (RIR 1-2) - REST: 2min
`}

**Cool-down (5 minutes)**
- Static stretching focused on worked muscles

[Continue with remaining days following same evidence-based structure]

### Phase 2: Development (Weeks 3-5)
[Detailed progression for each day with intensity increases]

### Phase 3: Peak (Weeks 6-8)
[Advanced progression with either load increases or volume adjustments]

### Weekly Progression Guidelines
**Based on 2023-2025 Research:**
- **Week 1-2:** Establish technique, moderate loads (RIR 3-4)
- **Week 3-4:** Increase intensity (RIR 2-3), maintain or slightly reduce volume
- **Week 5-6:** Peak intensity phase (RIR 1-2), focus on strength/neural adaptations
- **Week 7-8:** Strategic deload or intensity maintenance

### Scientific References & Rationale
**Key Studies Informing This Program:**
- Helms et al. (2024): Volume landmarks vs. proximity to failure analysis
- Schoenfeld et al. (2025): Set number optimization for hypertrophy
- Latest meta-analyses on rest interval optimization (2024)
- RIR-based progression research (2023-2025)

### Important Implementation Notes
- **Rest Intervals:** Non-negotiable 3-5min for compounds based on latest research
- **Effort Level:** Higher effort per set more important than total volume
- **Progression:** Weight increases primary method, add sets/reduce RIR as secondary
- **Recovery:** 48-72 hours between sessions training same movement patterns`,
          type: 'training',
          maxTokens: 3000
        }
      });

      if (error) throw error;

      const response = data?.response || "Failed to generate program. Please try again.";
      
      setGeneratedProgram({
        name: programData.name,
        goal: programData.goal,
        duration: parseInt(programData.duration) || 8,
        daysPerWeek: parseInt(programData.daysPerWeek) || 4,
        approach: programData.trainingApproach,
        content: response
      });
      
      toast({
        title: 'Evidence-Based Program Generated! 🎯',
        description: `Your ${isMinimalist ? 'minimalist' : 'standard'} training program based on 2023-2025 research is ready!`
      });
    } catch (error) {
      console.error('Error generating program:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to generate program. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'AI service unavailable. Please check your connection and try again.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'AI service quota exceeded. Please try again later or contact support.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with a simpler program description.';
        }
      }
      
      toast({
        title: 'Program Generation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Show fallback message
      setGeneratedProgram({
        name: programData.name,
        goal: programData.goal,
        duration: parseInt(programData.duration) || 8,
        daysPerWeek: parseInt(programData.daysPerWeek) || 4,
        approach: programData.trainingApproach,
        content: `# ${programData.name}\n\n**AI Generation Temporarily Unavailable**\n\nWe're experiencing technical difficulties with our AI service. Please try again in a few minutes.\n\nIn the meantime, here's a basic framework for your ${programData.goal} program:\n\n## Week 1-2: Foundation Phase\n- Focus on form and consistency\n- 2-3 sets per exercise\n- 8-12 repetitions\n- 2-3 minute rest periods\n\n## Week 3-4: Progressive Phase\n- Increase intensity gradually\n- 3-4 sets per exercise\n- 6-10 repetitions\n- 3-4 minute rest periods\n\n## Week 5-${programData.duration || 8}: Peak Phase\n- Maximum effort and progression\n- Progressive overload focus\n- Track all improvements\n\n*Please try generating again when the AI service is restored.*`
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
    <FeatureGate featureKey="training_programs" allowPreview={false}>
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
                    Evidence-based programs using 2023-2025 research
                  </CardDescription>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium text-sm">Latest Research Integration</span>
                </div>
                <p className="text-blue-200/80 text-xs leading-relaxed">
                  Programs now incorporate 2023-2025 meta-analyses showing lower-volume, high-effort training often superior to traditional high-volume approaches. Choose minimalist for maximum efficiency or standard for balanced approach.
                </p>
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
                          <SelectItem value="bulk">Weight Gain/Bulk</SelectItem>
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

                  <div className="space-y-2">
                    <Label className="text-blue-200">Training Approach (2023-2025 Research)</Label>
                    <Select value={programData.trainingApproach} onValueChange={(value) => setProgramData({...programData, trainingApproach: value})}>
                      <SelectTrigger className="bg-blue-900/30 border-blue-500/50 text-white">
                        <SelectValue placeholder="Select approach" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 border-blue-500">
                        <SelectItem value="minimalist">
                          <div className="flex flex-col">
                            <span className="font-medium">Minimalist (Recommended)</span>
                            <span className="text-xs text-blue-300">2-3 sets, 4-6 reps, 3-5min rest</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="evidence_based">
                          <div className="flex flex-col">
                            <span className="font-medium">Evidence-Based Standard</span>
                            <span className="text-xs text-blue-300">Moderate volume, research-optimized</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="traditional">
                          <div className="flex flex-col">
                            <span className="font-medium">Traditional High-Volume</span>
                            <span className="text-xs text-blue-300">Classic bodybuilding approach</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {programData.trainingApproach === 'minimalist' && (
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 mt-2">
                        <p className="text-green-300 text-xs">
                          <strong>Minimalist Approach:</strong> Based on 2023-2025 research showing 2-3 high-effort sets often superior to higher volume training. Emphasizes compound movements, long rest periods, and progressive overload.
                        </p>
                      </div>
                    )}
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
                        Generating Evidence-Based Program...
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
                      <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-400/30">
                        {generatedProgram.approach === 'minimalist' ? '2023-2025 Minimalist Research' : 'Evidence-Based'}
                      </Badge>
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
    </FeatureGate>
  );
};

export default SmartTraining;
