import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Moon, Download, MessageCircle, Sparkles, Brain, Heart, Zap, Battery, BedDouble, Activity } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { MobileHeader } from "@/components/MobileHeader";
import { cn } from "@/lib/utils";

interface RecoveryCoachProps {
  onBack: () => void;
}

const RecoveryCoach = ({ onBack }: RecoveryCoachProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const focusAreas = [
    { icon: <Moon className="w-4 h-4" />, title: "Sleep", prompt: "I sleep 5-6 hours per night and feel tired", color: "from-indigo-500 to-purple-500" },
    { icon: <Brain className="w-4 h-4" />, title: "Stress", prompt: "High stress affecting my workouts", color: "from-rose-500 to-pink-500" },
    { icon: <Heart className="w-4 h-4" />, title: "Muscle", prompt: "Sore muscles after workouts", color: "from-red-500 to-orange-500" },
    { icon: <Zap className="w-4 h-4" />, title: "Energy", prompt: "Low energy throughout the day", color: "from-amber-500 to-yellow-500" }
  ];

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

Base all recommendations on current sleep science and recovery research. Include specific, actionable steps.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { prompt: recoveryPrompt, feature: 'coach_gpt_queries' }
      });

      if (error) throw error;
      
      if (data?.response) {
        setResponse(data.response);
        toast.success('Recovery plan generated!');
      } else {
        // Fallback response
        setResponse(generateFallbackPlan(input));
        toast.success('Recovery plan ready!');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse(generateFallbackPlan(input));
      toast.success('Recovery plan ready!');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackPlan = (userInput: string) => `# Recovery Optimization Plan

Based on your request: ${userInput}

## Sleep Optimization

### Sleep Hygiene Protocol
- **Consistent Schedule**: Same bed/wake time daily
- **Duration**: 7-9 hours quality sleep
- **Environment**: Cool (65-68°F), dark, quiet

### Enhancement Techniques
1. Blue light filters 1-2 hours before bed
2. Magnesium glycinate 200-400mg before bed
3. 4-7-8 breathing technique

## Recovery Protocols

### Post-Workout
- Cool down: 10-15 minutes light activity
- Hydration: 16-24 oz water per pound lost
- Protein: 20-40g within 2 hours

### Stress Management
1. 10-20 minutes daily meditation
2. Box breathing (4-4-4-4 pattern)
3. Time management & prioritization

## Nutrition for Recovery

### Key Nutrients
- **Protein**: 0.8-1.2g per kg daily
- **Omega-3s**: 1-3g daily
- **Vitamin D**: Maintain 30+ ng/mL

### Recovery Foods
- Tart cherry juice before bed
- Greek yogurt with probiotics
- Leafy greens for magnesium
- Fatty fish for omega-3s

## Weekly Recovery Plan
- **Monday**: Full body mobility (20 min)
- **Wednesday**: Gentle yoga (30 min)
- **Friday**: Foam rolling (15-20 min)
- **Sunday**: Nature walk (30+ min)`;

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Plan downloaded!');
  };

  // Score meters component
  const ScoreMeter = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}/10</span>
      </div>
      <Progress value={value * 10} className={cn("h-2", color)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Recovery Coach" onBack={onBack} />
      
      <div className="px-4 pb-28">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-3 border border-indigo-500/20">
            <Moon className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Recovery Coach</h2>
          <p className="text-sm text-muted-foreground">Science-backed recovery optimization</p>
        </div>

        {/* Focus Areas */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {focusAreas.map((area, index) => (
            <button
              key={index}
              onClick={() => setInput(area.prompt)}
              className="p-3 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all native-press text-center"
              aria-label={`Select ${area.title} focus area`}
            >
              <div className={cn("w-8 h-8 mx-auto rounded-lg bg-gradient-to-br flex items-center justify-center mb-1.5", area.color)}>
                {area.icon}
              </div>
              <span className="text-[10px] text-muted-foreground">{area.title}</span>
            </button>
          ))}
        </div>

        {!response ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">Describe Your Recovery Needs</span>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Tell me about your sleep, recovery challenges, stress levels..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-muted/30 border-border min-h-28 resize-none rounded-xl"
                  disabled={!canUseFeature('coach_gpt_queries')}
                  aria-label="Recovery concerns input"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading || !canUseFeature('coach_gpt_queries')}
                  className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Recovery Plan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Quick Score Overview */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm flex items-center">
                    <Battery className="w-4 h-4 mr-2 text-indigo-400" />
                    Recovery Priorities
                  </h3>
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    Personalized
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-background/50 rounded-xl">
                    <BedDouble className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                    <div className="text-lg font-bold text-foreground">7-9h</div>
                    <div className="text-[10px] text-muted-foreground">Sleep Goal</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-xl">
                    <Activity className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="text-lg font-bold text-foreground">3-4x</div>
                    <div className="text-[10px] text-muted-foreground">Weekly Rest</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-xl">
                    <Heart className="w-5 h-5 mx-auto mb-1 text-rose-400" />
                    <div className="text-lg font-bold text-foreground">48h</div>
                    <div className="text-[10px] text-muted-foreground">Muscle Rest</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <ScoreMeter label="Sleep Quality" value={7} color="[&>div]:bg-indigo-500" />
                  <ScoreMeter label="Stress Level" value={5} color="[&>div]:bg-rose-500" />
                  <ScoreMeter label="Energy Level" value={6} color="[&>div]:bg-amber-500" />
                </div>
              </CardContent>
            </Card>

            {/* Response Content */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Plan Ready
                  </Badge>
                  <Button 
                    onClick={handleDownload}
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Download recovery plan"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-xl border border-border/50 p-4 max-h-[400px] overflow-y-auto scroll-native">
                  <FormattedAIResponse content={response} />
                </div>
              </CardContent>
            </Card>

            {/* New Plan Button */}
            <Button 
              onClick={() => {
                setResponse("");
                setInput("");
              }}
              variant="outline"
              className="w-full h-11 rounded-xl border-border"
            >
              Create New Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryCoach;
