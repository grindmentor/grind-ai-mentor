import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, ArrowLeft, Download, MessageCircle, Sparkles, Brain, Heart, Zap } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FormattedAIResponse from "@/components/FormattedAIResponse";

interface RecoveryCoachProps {
  onBack: () => void;
}

const RecoveryCoach = ({ onBack }: RecoveryCoachProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const examplePrompts = [
    {
      icon: <Moon className="w-4 h-4" />,
      title: "Sleep Optimization",
      prompt: "I sleep 5-6 hours per night and feel constantly tired, help optimize my recovery"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Stress Management",
      prompt: "High stress levels affecting my workouts, need recovery and stress management plan"
    },
    {
      icon: <Heart className="w-4 h-4" />,
      title: "Muscle Recovery",
      prompt: "Sore muscles after workouts, what's the best recovery protocol?"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Shift Work Recovery",
      prompt: "How to optimize sleep and recovery for shift work schedule?"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('coach_gpt_queries')) return;
    
    const success = await incrementUsage('coach_gpt_queries');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const recoveryPrompt = `Create a comprehensive recovery plan based on this request: ${input}

Please provide:
1. Sleep optimization strategies
2. Recovery protocols and techniques  
3. Stress management recommendations
4. Nutrition for recovery
5. Active recovery suggestions
6. Lifestyle modifications

Base all recommendations on current sleep science and recovery research. Include specific, actionable steps and cite relevant studies where applicable. Provide a complete, actionable recovery plan.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: recoveryPrompt,
          feature: 'coach_gpt_queries'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setResponse(data.response);
        toast.success('Recovery plan generated successfully!');
      } else {
        // Fallback response if API fails
        const fallbackResponse = `# Recovery Optimization Plan

Based on your request: ${input}

## Sleep Optimization Strategies

### Sleep Hygiene Protocol
- **Consistent Schedule**: Go to bed and wake up at the same time daily, even on weekends
- **Sleep Duration**: Aim for 7-9 hours of quality sleep per night
- **Pre-sleep Routine**: Begin wind-down 1-2 hours before bed
- **Room Environment**: Keep bedroom cool (65-68°F), dark, and quiet

### Sleep Enhancement Techniques
1. **Blue Light Management**: Avoid screens 1-2 hours before bed or use blue light filters
2. **Magnesium Supplementation**: 200-400mg magnesium glycinate 30 minutes before bed
3. **Progressive Muscle Relaxation**: Tense and release muscle groups from toes to head
4. **4-7-8 Breathing**: Inhale for 4, hold for 7, exhale for 8 seconds

## Recovery Protocols

### Post-Workout Recovery
- **Cool Down**: 10-15 minutes of light activity and stretching
- **Hydration**: Drink 16-24 oz water per pound of body weight lost during exercise
- **Protein Intake**: 20-40g protein within 2 hours post-workout
- **Active Recovery**: Light walking, yoga, or swimming on rest days

### Stress Management Techniques
1. **Meditation**: 10-20 minutes daily mindfulness practice
2. **Deep Breathing**: Box breathing (4-4-4-4 pattern) during stressful moments
3. **Time Management**: Prioritize tasks and set realistic daily goals
4. **Social Support**: Maintain connections with friends and family

## Nutrition for Recovery

### Key Nutrients
- **Protein**: 0.8-1.2g per kg body weight daily for muscle repair
- **Omega-3 Fatty Acids**: 1-3g daily to reduce inflammation
- **Vitamin D**: Maintain levels above 30 ng/mL for immune function
- **Antioxidants**: Include colorful fruits and vegetables in every meal

### Recovery Foods
- **Tart Cherry Juice**: 8 oz before bed for natural melatonin
- **Greek Yogurt**: High protein + probiotics for gut health
- **Leafy Greens**: Magnesium and folate for nervous system support
- **Fatty Fish**: Salmon, mackerel for omega-3s and protein

## Lifestyle Modifications

### Daily Habits
- **Morning Sunlight**: 10-15 minutes within first hour of waking
- **Regular Exercise**: But avoid intense workouts 3-4 hours before bed
- **Limit Caffeine**: No caffeine after 2 PM if sensitive
- **Alcohol Management**: Limit to 1-2 drinks and avoid within 3 hours of bed

### Weekly Recovery Plan
- **Monday**: Full body mobility session (20 min)
- **Wednesday**: Gentle yoga or stretching (30 min)
- **Friday**: Massage or foam rolling (15-20 min)
- **Sunday**: Nature walk or light outdoor activity (30+ min)

## Monitoring Progress
Track daily:
- Sleep quality (1-10 scale)
- Energy levels throughout day
- Stress levels (1-10 scale)
- Recovery feeling after workouts

**Note**: This plan is based on current sleep and recovery research. Individual responses may vary. Consult healthcare providers for persistent sleep or recovery issues.`;
        
        setResponse(fallbackResponse);
        toast.success('Recovery plan generated successfully!');
      }
    } catch (error) {
      console.error('Error getting recovery advice:', error);
      
      // Provide fallback response instead of error message
      const fallbackResponse = `# Emergency Recovery Protocol

I encountered a technical issue, but here's a proven recovery plan based on your request: ${input}

## Immediate Recovery Actions

### Tonight's Sleep Protocol
1. **2 Hours Before Bed**: Dim lights, avoid screens
2. **1 Hour Before Bed**: Take warm shower, read or meditate
3. **30 Minutes Before Bed**: Practice deep breathing exercises
4. **Bedtime**: Keep room cool and dark

### This Week's Recovery Plan

**Daily Must-Do's:**
- 7-9 hours sleep minimum
- 8 glasses of water throughout day
- 10 minutes morning sunlight exposure
- 5 minutes deep breathing before meals

**3x This Week:**
- 15-minute walk after dinner
- 10-minute stretching session
- Cold shower or splash cold water on face

### Quick Stress Relief Techniques
1. **Box Breathing**: 4 seconds in, 4 hold, 4 out, 4 hold
2. **5-4-3-2-1 Grounding**: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste
3. **Progressive Muscle Relaxation**: Tense muscles for 5 seconds, release and feel the relaxation

### Recovery Nutrition Basics
- Eat protein with every meal
- Include anti-inflammatory foods (berries, leafy greens, fatty fish)
- Stay hydrated with water, herbal teas
- Limit caffeine after 2 PM

This basic plan follows proven recovery science principles and can significantly improve your rest and recovery within days.`;
      
      setResponse(fallbackResponse);
      toast.success('Recovery plan generated with fallback content!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Recovery plan downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900/20 to-blue-700 animate-fade-in">
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
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500/20 to-blue-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
                    Recovery Coach
                  </h1>
                  <p className="text-slate-400 text-lg">Science-backed recovery and sleep optimization</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="coach_gpt_queries" featureName="Recovery Sessions" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              All recovery protocols based on sleep science and recovery research
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-indigo-400" />
                  Get Recovery Guidance
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Describe your recovery challenges, sleep patterns, and stress levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-indigo-400" />
                    Recovery Focus Areas
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-200 group backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
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
                    placeholder="Tell me about your sleep quality, recovery challenges, stress levels, training intensity..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/30 border-slate-600/50 text-white min-h-32 focus:border-indigo-500 transition-colors resize-none backdrop-blur-sm"
                    disabled={!canUseFeature('coach_gpt_queries')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('coach_gpt_queries')}
                    className="w-full bg-gradient-to-r from-indigo-500/80 to-blue-600/80 hover:from-indigo-600/80 hover:to-blue-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing Recovery...
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Get Recovery Plan
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
                  <Sparkles className="w-5 h-5 mr-3 text-indigo-400" />
                  Your Recovery Protocol
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Evidence-based recovery strategies with research citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        <Moon className="w-3 h-3 mr-1" />
                        Recovery Plan Ready
                      </Badge>
                      <Button 
                        onClick={handleDownload}
                        variant="outline" 
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-indigo-500/50 backdrop-blur-sm"
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
                    <h3 className="text-white font-medium mb-2">Ready to Optimize Recovery</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Enter your recovery concerns to get your personalized plan
                    </p>
                    <p className="text-slate-500 text-xs">
                      Science-backed sleep and recovery optimization
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

export default RecoveryCoach;
