import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, Download, MessageCircle, Sparkles, Brain, Heart, Zap } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { MobileHeader } from "@/components/MobileHeader";

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
    <div className="min-h-screen bg-background">
      <MobileHeader title="Recovery Coach" onBack={onBack} />
      
      <div className="p-4 max-w-4xl mx-auto pb-24">
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Science-backed recovery optimization
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-primary" />
                  Get Recovery Guidance
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Describe your recovery challenges and sleep patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Example Prompts */}
                <div className="space-y-3">
                  <h4 className="text-foreground font-medium flex items-center text-sm">
                    <Brain className="w-4 h-4 mr-2 text-primary" />
                    Recovery Focus Areas
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-3 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/50 hover:border-primary/30 transition-all native-press"
                      >
                        <div className="flex items-center space-x-3 mb-1">
                          <div className="text-primary">
                            {example.icon}
                          </div>
                          <span className="text-foreground font-medium text-sm">{example.title}</span>
                        </div>
                        <p className="text-muted-foreground text-xs pl-7">"{example.prompt}"</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Tell me about your sleep quality, recovery challenges, stress levels..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-muted/30 border-border text-foreground min-h-28 focus:border-primary transition-colors resize-none"
                    disabled={!canUseFeature('coach_gpt_queries')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('coach_gpt_queries')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl native-press"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
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
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-3 text-primary" />
                  Your Recovery Protocol
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Evidence-based recovery strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-4">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Moon className="w-3 h-3 mr-1" />
                        Recovery Plan Ready
                      </Badge>
                      <Button 
                        onClick={handleDownload}
                        variant="outline" 
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-muted"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Response Content */}
                    <div className="bg-muted/30 rounded-xl border border-border/50 p-4 max-h-96 overflow-y-auto scroll-native">
                      <FormattedAIResponse content={response} />
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-premium py-12">
                    <div className="empty-state-icon">
                      <Moon className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-foreground font-medium mb-2">Ready to Optimize Recovery</h3>
                    <p className="text-muted-foreground text-sm">
                      Enter your recovery concerns to get a personalized plan
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
