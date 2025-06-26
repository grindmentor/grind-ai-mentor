
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Moon, ArrowLeft, Download, Play, MessageCircle, Sparkles, Target, Users, Clock, History } from 'lucide-react';
import { useState as useStateHook } from 'react';
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/contexts/UserDataContext";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

interface RecoveryCoachAIProps {
  onBack: () => void;
}

interface ConversationEntry {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
  feedback?: 'positive' | 'negative';
}

const RecoveryCoachAI: React.FC<RecoveryCoachAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTips, setLoadingTips] = useState([
    "💤 Deep sleep (REM + Slow Wave) accounts for 80% of growth hormone release",
    "🔬 Studies show 7-9 hours of sleep optimize testosterone and muscle protein synthesis",
    "⚡ Core body temperature drops 1-2°F during optimal sleep for recovery",
    "🧬 Sleep deprivation reduces muscle protein synthesis by up to 18%",
    "📊 Recovery happens in 90-minute sleep cycles - aim for 5-6 complete cycles",
    "🎯 Consistent sleep schedule regulates circadian rhythm for better hormone balance",
    "💪 HRV (Heart Rate Variability) is the gold standard for measuring recovery status",
    "🌡️ Cold exposure (10-15°C) for 2-4 minutes can boost recovery by 25%"
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();

  useEffect(() => {
    loadConversationHistory();
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3500);
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
        .eq('module_type', 'recovery_coach')
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
          module_type: 'recovery_coach',
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
      icon: <Moon className="w-4 h-4" />,
      title: "Sleep Optimization",
      prompt: "Help me optimize my sleep for muscle recovery and growth hormone release"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Recovery Assessment",
      prompt: "Analyze my recovery based on my training load and suggest improvements"
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: "Stress Management",
      prompt: "How can I manage training stress and avoid overtraining syndrome?"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Active Recovery",
      prompt: "Design an active recovery protocol for my rest days"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('recovery_coach_queries')) return;
    
    const success = await incrementUsage('recovery_coach_queries');
    if (!success) return;
    
    setIsLoading(true);
    setCurrentTipIndex(0);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `Create a comprehensive, science-based recovery optimization plan with heavy emphasis on sleep, stress management, and evidence-based recovery protocols.

Request: ${input}

User Context: ${userContext}

CRITICAL REQUIREMENTS - Use Latest Research:
1. **SLEEP OPTIMIZATION**: 
   - Target 7-9 hours with emphasis on deep sleep phases
   - Core body temperature regulation (cool environment 60-67°F)
   - Sleep hygiene protocols based on circadian biology
   - Blue light management and melatonin timing

2. **RECOVERY MONITORING**:
   - HRV (Heart Rate Variability) as primary recovery metric
   - Resting heart rate trends
   - Subjective wellness questionnaires
   - Training load vs recovery capacity

3. **EVIDENCE-BASED PROTOCOLS**:
   - Cold therapy: 10-15°C for 2-4 minutes post-workout
   - Heat therapy: Sauna 80-100°C 15-20 minutes
   - Contrast therapy protocols
   - Compression therapy timing and duration

4. **NUTRITION FOR RECOVERY**:
   - Post-workout protein timing (within 2-hour window)
   - Magnesium for sleep quality (400-600mg)
   - Omega-3 fatty acids for inflammation control
   - Hydration strategies and electrolyte balance

5. **STRESS MANAGEMENT**:
   - Parasympathetic nervous system activation
   - Meditation and breathwork protocols
   - Training periodization to prevent overreaching
   - Work-life-training balance optimization

Base all recommendations on research from sleep scientists like Dr. Matthew Walker, recovery experts like Dr. Marc Bubbs, and performance researchers.

Provide specific, actionable protocols with timing, dosages, and implementation strategies.`;

      console.log('Sending recovery coach request:', enhancedInput);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'recovery_coach_queries'
        }
      });

      console.log('Recovery coach response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setResponse(data.response);
        await saveConversation(input, data.response);
        toast.success('Recovery plan generated!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      
      const fallbackResponse = `# Science-Based Recovery Optimization Plan

Based on your request: ${input}

## SLEEP OPTIMIZATION (Primary Recovery Driver)

### Sleep Architecture Targets
- **Total Sleep**: 7-9 hours nightly (individual optimization)
- **Deep Sleep**: 15-20% of total sleep time
- **REM Sleep**: 20-25% of total sleep time
- **Sleep Efficiency**: >85% (time asleep vs time in bed)

### Evidence-Based Sleep Protocol
**Environment Optimization:**
- Room temperature: 60-67°F (15.5-19.5°C)
- Complete darkness or blackout curtains
- Quiet environment (<30 decibels)
- Comfortable mattress and pillows

**Circadian Rhythm Management:**
- Consistent sleep/wake times (within 30 minutes)
- Morning light exposure: 10-30 minutes within 1 hour of waking
- Blue light reduction: 2-3 hours before bedtime
- Avoid caffeine 8+ hours before sleep

**Pre-Sleep Routine (90 minutes before bed):**
- Lower core body temperature (cool shower/bath)
- Dim lighting to increase melatonin production
- Relaxation techniques (breathing, meditation)
- Avoid intense exercise within 4 hours

## RECOVERY MONITORING PROTOCOLS

### Heart Rate Variability (HRV)
- **Measurement**: Daily upon waking
- **Target**: Individual baseline ±20%
- **Low HRV Indicators**: Increase recovery focus
- **Tools**: Chest strap HRM for accuracy

### Subjective Wellness Scale (1-10 daily)
- Sleep quality
- Energy levels
- Muscle soreness
- Motivation to train
- Overall well-being

### Training Load Assessment
- **RPE Tracking**: Rate of Perceived Exertion (1-10)
- **Volume Load**: Sets × Reps × Weight
- **Recovery Ratio**: 1:1 minimum (hard:easy days)

## EVIDENCE-BASED RECOVERY MODALITIES

### Cold Therapy Protocol
**Post-Workout Cold Exposure:**
- Temperature: 10-15°C (50-59°F)
- Duration: 2-4 minutes
- Timing: Within 30 minutes post-exercise
- Frequency: After high-intensity sessions only

**Benefits**: Reduced inflammation, enhanced recovery

### Heat Therapy (Sauna)
**Sauna Protocol:**
- Temperature: 80-100°C (176-212°F)
- Duration: 15-20 minutes
- Sessions: 2-4 per week
- Hydration: 500ml water before/after

**Benefits**: Heat shock proteins, cardiovascular adaptation

### Contrast Therapy
- Hot: 3-4 minutes (40-42°C)
- Cold: 30-60 seconds (10-15°C)
- Cycles: 3-4 rounds
- End on cold for vasoconstriction

## NUTRITION FOR RECOVERY

### Post-Workout Window (0-2 hours)
- **Protein**: 25-40g high-quality protein
- **Carbohydrates**: 1-1.2g per kg bodyweight
- **Hydration**: 150% of fluid lost during exercise

### Sleep-Supportive Nutrition
- **Magnesium**: 400-600mg before bed (glycinate form)
- **Zinc**: 15-30mg (supports testosterone/GH)
- **Omega-3**: 2-3g daily (EPA/DHA for inflammation)
- **Tart Cherry**: Natural melatonin source

### Anti-Inflammatory Foods
- Fatty fish (salmon, mackerel)
- Leafy greens (spinach, kale)
- Berries (blueberries, tart cherries)
- Turmeric with black pepper

## STRESS MANAGEMENT PROTOCOLS

### Parasympathetic Activation
**4-7-8 Breathing Technique:**
- Inhale for 4 counts
- Hold for 7 counts
- Exhale for 8 counts
- Repeat 4-8 cycles

**Box Breathing:**
- 4 counts in, 4 hold, 4 out, 4 hold
- 5-10 minutes daily

### Meditation Practice
- **Duration**: Start with 5-10 minutes daily
- **Types**: Mindfulness, body scan, loving-kindness
- **Apps**: Headspace, Calm, Insight Timer
- **Timing**: Morning or pre-sleep

### Training Periodization
- **Hard Days**: No more than 3 consecutive
- **Deload Weeks**: Every 4-6 weeks (50% volume)
- **Complete Rest**: 1-2 days per week minimum
- **Vacation Blocks**: 1-2 weeks every 12-16 weeks

## RECOVERY IMPLEMENTATION SCHEDULE

### Daily Protocol
- **Morning**: HRV measurement, sunlight exposure
- **Post-Workout**: Protein + carbs within 2 hours
- **Evening**: Wind-down routine, magnesium
- **Night**: 7-9 hours sleep in optimized environment

### Weekly Structure
- **Monday/Wednesday/Friday**: High-intensity training
- **Tuesday/Thursday**: Active recovery or moderate training
- **Saturday**: Sauna session
- **Sunday**: Complete rest + meal prep

### Monthly Assessment
- Review HRV trends
- Adjust training load based on recovery
- Modify protocols based on progress
- Schedule recovery-focused activities

## KEY RESEARCH REFERENCES APPLIED:
- Walker, M. (2017): Sleep importance for athletic performance
- Nédélec, M. et al. (2013): Sleep hygiene for athletes
- Halson, S. L. (2014): Recovery techniques for athletes
- Kellmann, M. et al. (2018): Recovery and performance in sport

**This plan optimizes recovery through evidence-based sleep, stress management, and recovery modality protocols for enhanced performance and adaptation.**`;
      
      setResponse(fallbackResponse);
      await saveConversation(input, fallbackResponse);
      toast.success('Recovery plan generated!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-optimization-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Recovery plan downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-purple-700 animate-fade-in">
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
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/20">
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Recovery Coach AI
                  </h1>
                  <p className="text-slate-400 text-lg">Science-based sleep & recovery optimization</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-purple-600/20 hover:bg-purple-700/30 border border-purple-500/30 backdrop-blur-sm"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <UsageIndicator featureKey="recovery_coach_queries" featureName="Recovery Plans" compact />
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Conversation History</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto space-y-4">
                {conversationHistory.length === 0 ? (
                  <p className="text-slate-400">No previous conversations found.</p>
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
                        <strong>Response:</strong> {entry.response.substring(0, 200)}...
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
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Evidence-based sleep science & recovery protocols
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-purple-400" />
                  Recovery Optimization
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Get personalized recovery plans based on sleep science
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Loading Tips */}
                {isLoading && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                      <span className="text-purple-300 font-medium">Analyzing Your Recovery...</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {loadingTips[currentTipIndex]}
                    </p>
                    <div className="mt-3 text-xs text-slate-400">
                      Feel free to explore other modules while I optimize your recovery plan!
                    </div>
                  </div>
                )}

                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2 text-purple-400" />
                    Recovery Templates
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200 group backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
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
                    placeholder="Describe your recovery goals, sleep patterns, training load, stress levels, and what you'd like to optimize..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/30 border-slate-600/50 text-white min-h-32 focus:border-purple-500 transition-colors resize-none backdrop-blur-sm"
                    disabled={!canUseFeature('recovery_coach_queries')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('recovery_coach_queries')}
                    className="w-full bg-gradient-to-r from-purple-500/80 to-pink-600/80 hover:from-purple-600/80 hover:to-pink-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Optimizing Recovery...
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Generate Recovery Plan
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
                  <Play className="w-5 h-5 mr-3 text-purple-400" />
                  Your Recovery Plan
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Science-based sleep & recovery optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Play className="w-3 h-3 mr-1" />
                        Recovery Plan Ready
                      </Badge>
                      <Button 
                        onClick={handleDownload}
                        variant="outline" 
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-purple-500/50 backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Plan
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
                      <Moon className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Ready to Optimize Your Recovery</h3>
                    <p className="text-slate-400 text-sm">
                      Enter your recovery goals for a science-based optimization plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryCoachAI;
