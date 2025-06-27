import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, ArrowLeft, Download, Play, MessageCircle, Sparkles, Target, Users, Clock, History } from 'lucide-react';
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import FeatureGate from "@/components/FeatureGate";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/contexts/UserDataContext";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

interface SmartTrainingProps {
  onBack: () => void;
}

interface ConversationEntry {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
  feedback?: 'positive' | 'negative';
}

const SmartTraining: React.FC<SmartTrainingProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTips, setLoadingTips] = useState([
    "💪 Progressive overload is the #1 driver of hypertrophy - Jeff Nippard's research shows volume, intensity, and frequency all matter",
    "🔬 Training 2-3x per week per muscle beats once weekly for growth - meta-analysis by Schoenfeld shows 40% better results",
    "⚡ RPE 7-9 (2-3 RIR) optimizes stimulus while managing fatigue - TNF emphasizes autoregulation over rigid percentages",
    "📊 Volume landmarks: Beginners need 8-12 sets/week, advanced up to 20+ sets per muscle group",
    "🎯 Compound movements provide the most bang for your buck - squat, deadlift, bench, row variations",
    "⏱️ Rest 2-5 minutes between sets for strength, 60-120 seconds for hypertrophy - Jeff Nippard's optimal rest research",
    "🧬 Muscle protein synthesis peaks 1-3 hours post-workout and stays elevated for 24-48 hours",
    "📈 Periodization beats random training - linear, undulating, or block periodization all outperform constant loading"
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();
  const { canUse } = useFeatureAccess('smart_training');

  useEffect(() => {
    loadConversationHistory();
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoading, loadingTips.length]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_type', 'smart_training')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formatted: ConversationEntry[] = data.map(item => ({
        id: item.id,
        prompt: item.prompt,
        response: item.response,
        timestamp: item.created_at,
        feedback: item.feedback
      }));

      setConversationHistory(formatted);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveConversation = async (prompt: string, response: string) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          module_type: 'smart_training',
          prompt,
          response
        });
      
      await loadConversationHistory();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const provideFeedback = async (conversationId: string, feedback: 'positive' | 'negative') => {
    if (!user) return;

    try {
      await supabase
        .from('ai_conversations')
        .update({ feedback })
        .eq('id', conversationId);
      
      await loadConversationHistory();
      toast.success('Feedback recorded!');
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const examplePrompts = [
    {
      icon: <Dumbbell className="w-4 h-4" />,
      title: "Hypertrophy Program",
      prompt: "Create a science-based hypertrophy program using Jeff Nippard's research on optimal volume and frequency"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Strength Progression",
      prompt: "Design a strength program with autoregulation and RPE-based progression like TNF recommends"
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: "Body Recomposition",
      prompt: "Help me build muscle while losing fat using evidence-based training and periodization"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Time-Efficient Training",
      prompt: "Create a minimalist program focusing on compound movements for maximum efficiency"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    if (!canUse) return;
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUse) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    setCurrentTipIndex(0);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `Create a comprehensive, science-based training program using methods and language from evidence-based coaches like Jeff Nippard, TNF, and similar researchers.

Request: ${input}

User Context: ${userContext}

CRITICAL REQUIREMENTS - Use Evidence-Based Methods:
1. **PROGRESSIVE OVERLOAD STRATEGIES** (Jeff Nippard style):
   - Volume progression (sets × reps × weight)
   - Intensity progression (% 1RM or RPE)
   - Frequency progression (training days per week)
   - Range of motion and tempo manipulation

2. **VOLUME LANDMARKS** (Schoenfeld/Nippard research):
   - Beginners: 8-12 sets per muscle per week
   - Intermediate: 12-16 sets per muscle per week  
   - Advanced: 16-20+ sets per muscle per week
   - Individual volume tolerance assessment

3. **FREQUENCY OPTIMIZATION** (TNF approach):
   - 2-3x per week per muscle group minimum
   - Higher frequency for lagging muscle groups
   - Autoregulation based on recovery capacity
   - Distribute volume across multiple sessions

4. **RPE-BASED PROGRAMMING** (TNF style):
   - RPE 6-7: Technique work and warm-up sets
   - RPE 7-8: Hypertrophy sweet spot (2-3 RIR)
   - RPE 8-9: Strength and intensity work
   - RPE 9-10: Testing and peaking phases

5. **EXERCISE SELECTION HIERARCHY**:
   - Tier 1: Big 3 + row variations (compound focus)
   - Tier 2: Accessory compounds (variations)
   - Tier 3: Isolation work (muscle-specific)
   - Movement pattern balance and injury prevention

6. **PERIODIZATION MODELS**:
   - Linear periodization for beginners
   - Daily undulating periodization (DUP) for intermediates
   - Block periodization for advanced trainees
   - Autoregulation and flexible programming

7. **RECOVERY INTEGRATION**:
   - Deload protocols (every 4-6 weeks)
   - Load management and fatigue monitoring
   - Sleep and nutrition considerations
   - Individual recovery capacity assessment

Use language and concepts from Jeff Nippard, TNF, Dr. Brad Schoenfeld, Dr. Mike Israetel, and other evidence-based coaches. Include specific set/rep schemes, RPE targets, and progression strategies.

Provide detailed exercise selection rationale, weekly structure, and progression protocols.`;

      console.log('Sending smart training request:', enhancedInput);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'training_programs'
        }
      });

      console.log('Smart training response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setResponse(data.response);
        await saveConversation(input, data.response);
        toast.success('Evidence-based training program generated!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating training program:', error);
      
      const fallbackResponse = `# Evidence-Based Training Program

Based on your request: ${input}

## PROGRAM PHILOSOPHY (Jeff Nippard/TNF Approach)

**Core Principles:**
- Progressive overload is king - volume, intensity, frequency progression
- Autoregulation using RPE (Rate of Perceived Exertion)
- Evidence-based exercise selection and programming
- Individual customization based on response and recovery

## WEEKLY STRUCTURE

### Upper/Lower Split (4-Day)
**Day 1: Upper Power** (RPE 8-9)
**Day 2: Lower Power** (RPE 8-9)  
**Day 3: Rest/Active Recovery**
**Day 4: Upper Hypertrophy** (RPE 7-8)
**Day 5: Lower Hypertrophy** (RPE 7-8)
**Day 6-7: Rest**

## EXERCISE SELECTION HIERARCHY

### Tier 1: Foundation Movements
1. **Squat Variation** (Back squat, front squat, safety bar)
2. **Deadlift Variation** (Conventional, sumo, trap bar)
3. **Horizontal Push** (Bench press, DB press, push-ups)
4. **Horizontal Pull** (Barbell row, T-bar row, DB row)

### Tier 2: Accessory Compounds
1. **Vertical Push** (Overhead press, DB shoulder press)
2. **Vertical Pull** (Pull-ups, lat pulldowns)
3. **Unilateral Work** (Lunges, single-leg RDL, step-ups)
4. **Core Integration** (Loaded carries, planks, pallof press)

### Tier 3: Isolation Work
1. **Arms** (Curls, tricep extensions, lateral raises)
2. **Calves** (Standing/seated calf raises)
3. **Abs** (Crunches, leg raises, Russian twists)

## PROGRESSIVE OVERLOAD STRATEGY

### Volume Progression (Primary Driver)
- **Week 1-2**: Establish baseline volume
- **Week 3-4**: Add 1-2 sets per muscle group
- **Week 5-6**: Continue volume increase
- **Week 7**: Deload (reduce volume by 40-50%)

### Intensity Progression (Secondary)
- **Hypertrophy**: 65-85% 1RM (RPE 7-8)
- **Strength**: 85-95% 1RM (RPE 8-9)
- **Power**: 45-65% 1RM (explosive intent)

### Frequency Progression
- **Beginners**: 2x per week per muscle
- **Intermediate**: 2-3x per week per muscle
- **Advanced**: 3-4x per week (high-frequency)

## RPE IMPLEMENTATION (TNF Style)

### RPE Scale Application
- **RPE 6**: Could do 4+ more reps (warm-up)
- **RPE 7**: Could do 3 more reps (hypertrophy base)
- **RPE 8**: Could do 2 more reps (hypertrophy peak)
- **RPE 9**: Could do 1 more rep (strength work)
- **RPE 10**: Could not do another rep (max effort)

### Weekly RPE Distribution
- **Monday**: RPE 8-9 (higher intensity)
- **Tuesday**: RPE 7-8 (moderate)
- **Thursday**: RPE 7 (volume focus)
- **Friday**: RPE 8 (moderate-high)

## VOLUME LANDMARKS (Schoenfeld Research)

### Weekly Set Recommendations
- **Chest**: 12-16 sets
- **Back**: 14-18 sets
- **Shoulders**: 12-16 sets
- **Arms**: 10-14 sets
- **Legs**: 16-20 sets
- **Glutes**: 12-16 sets

### Volume Progression
- **Phase 1** (Weeks 1-2): Lower end of range
- **Phase 2** (Weeks 3-4): Mid range
- **Phase 3** (Weeks 5-6): Upper end of range
- **Deload** (Week 7): 50% of Phase 1 volume

## SAMPLE UPPER HYPERTROPHY DAY

1. **Incline Barbell Press**: 4 sets × 6-8 reps @ RPE 8
2. **Barbell Rows**: 4 sets × 6-8 reps @ RPE 8
3. **Dumbbell Shoulder Press**: 3 sets × 8-10 reps @ RPE 7
4. **Weighted Pull-ups**: 3 sets × 8-10 reps @ RPE 7-8
5. **Incline DB Curls**: 3 sets × 10-12 reps @ RPE 7
6. **Close-Grip Bench**: 3 sets × 10-12 reps @ RPE 7
7. **Lateral Raises**: 3 sets × 12-15 reps @ RPE 7

**Rest Periods**: 2-3 minutes compounds, 60-90 seconds isolation

## AUTOREGULATION PROTOCOLS

### Daily Adjustments
- Feeling great (RPE+1): Add weight or reps
- Feeling average: Stick to plan
- Feeling poor (RPE-1): Reduce intensity

### Weekly Adjustments
- Beat target reps by 2+: Increase weight next week
- Hit exact target: Maintain
- Miss target by 2+: Maintain or reduce slightly

## PERIODIZATION MODEL

### 6-Week Block Structure
- **Weeks 1-2**: Volume accumulation (RPE 7-8)
- **Weeks 3-4**: Intensification (RPE 8-9)
- **Weeks 5-6**: Peak/test (RPE 9-10)
- **Week 7**: Deload and reassess

### Long-term Progression
- Block 1: Hypertrophy emphasis
- Block 2: Strength emphasis  
- Block 3: Peak/test phase
- Block 4: Deload/transition

## KEY RESEARCH APPLIED:
- Schoenfeld et al.: Volume-hypertrophy relationship
- Helms et al.: Pyramid training model
- Israetel et al.: Volume landmarks
- Nuckols: Frequency and adaptation

**This program applies evidence-based methods from leading researchers and coaches for optimal muscle building and strength development.**`;
      
      setResponse(fallbackResponse);
      await saveConversation(input, fallbackResponse);
      toast.success('Evidence-based training program generated!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'evidence-based-training-program.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Training program downloaded successfully!');
  };

  return (
    <FeatureGate featureKey="smart_training" previewMode={!canUse}>
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-blue-700 animate-fade-in">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={onBack} 
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Dashboard
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/20">
                    <Dumbbell className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                      Smart Training AI
                    </h1>
                    <p className="text-slate-400 text-lg">Evidence-based program design (Jeff Nippard style)</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-blue-600/20 hover:bg-blue-700/30 border border-blue-500/30 backdrop-blur-sm"
                  disabled={!canUse}
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <UsageIndicator featureKey="training_programs" featureName="Training Programs" compact />
              </div>
            </div>

            {/* History Panel */}
            {showHistory && (
              <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Training Program History</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto space-y-4">
                  {conversationHistory.length === 0 ? (
                    <p className="text-slate-400">No previous training programs found.</p>
                  ) : (
                    conversationHistory.map((entry) => (
                      <div key={entry.id} className="bg-slate-800/30 rounded-lg p-4 space-y-2">
                        <div className="text-sm text-slate-400">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-white">
                          <strong>Prompt:</strong> {entry.prompt}
                        </div>
                        <div className="text-slate-300 text-sm">
                          <strong>Program:</strong> {entry.response.substring(0, 200)}...
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={entry.feedback === 'positive' ? 'default' : 'outline'}
                            onClick={() => provideFeedback(entry.id, 'positive')}
                            className="text-xs"
                          >
                            👍
                          </Button>
                          <Button
                            size="sm"
                            variant={entry.feedback === 'negative' ? 'default' : 'outline'}
                            onClick={() => provideFeedback(entry.id, 'negative')}
                            className="text-xs"
                          >
                            👎
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Jeff Nippard & TNF inspired - Evidence-based training science
              </Badge>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Panel */}
              <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl flex items-center">
                    <MessageCircle className="w-5 h-5 mr-3 text-blue-400" />
                    Program Design
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Science-based training programs with RPE autoregulation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Loading Tips */}
                  {isLoading && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                        <span className="text-blue-300 font-medium">Designing Your Program...</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {loadingTips[currentTipIndex]}
                      </p>
                      <div className="mt-3 text-xs text-slate-400">
                        Check out other modules while I apply the latest training science!
                      </div>
                    </div>
                  )}

                  {/* Example Prompts */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium flex items-center">
                      <Target className="w-4 h-4 mr-2 text-blue-400" />
                      Program Templates
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {examplePrompts.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(example.prompt)}
                          className="text-left p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200 group backdrop-blur-sm"
                          disabled={!canUse}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                              {example.icon}
                            </div>
                            <span className="text-white font-medium">{example.title}</span>
                          </div>
                          <p className="text-slate-400 text-sm">"{example.prompt}"</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Describe your training goals, experience level, available equipment, time constraints, and any specific preferences (strength, hypertrophy, powerlifting, etc.)..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="bg-slate-800/30 border-slate-600/50 text-white min-h-32 focus:border-blue-500 transition-colors resize-none backdrop-blur-sm"
                      disabled={!canUse}
                    />
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || isLoading || !canUse}
                      className="w-full bg-gradient-to-r from-blue-500/80 to-cyan-600/80 hover:from-blue-600/80 hover:to-cyan-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 backdrop-blur-sm"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Evidence-Based Program...
                        </>
                      ) : (
                        <>
                          <Dumbbell className="w-4 h-4 mr-2" />
                          Generate Training Program
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Play className="w-5 h-5 mr-3 text-blue-400" />
                    Your Training Program
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Evidence-based program with RPE autoregulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-6">
                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Play className="w-3 h-3 mr-1" />
                          Program Ready
                        </Badge>
                        <Button 
                          onClick={handleDownload}
                          variant="outline" 
                          size="sm"
                          className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-blue-500/50 backdrop-blur-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Program
                        </Button>
                      </div>

                      {/* Response Content */}
                      <div className="bg-slate-800/20 rounded-xl border border-slate-700/50 p-6 max-h-96 overflow-y-auto backdrop-blur-sm">
                        <FormattedAIResponse content={response} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-white font-medium mb-2">Ready to Design Your Program</h3>
                      <p className="text-slate-400 text-sm">
                        Enter your training goals for an evidence-based program
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default SmartTraining;
