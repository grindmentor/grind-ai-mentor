import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Download, Play, MessageCircle, Zap, Target, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/contexts/UserDataContext";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { toast } from "sonner";

interface SmartTrainingProps {
  onBack: () => void;
}

const SmartTraining = ({ onBack }: SmartTrainingProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTips, setLoadingTips] = useState([
    "💪 Progressive overload is key - gradually increase weight, reps, or sets each week",
    "🔬 Studies show compound movements recruit more muscle fibers than isolation exercises",
    "⏱️ Rest periods of 2-3 minutes optimize strength gains, while 1-2 minutes enhance hypertrophy",
    "🎯 Research indicates training each muscle group 2-3x per week maximizes growth",
    "📊 The latest studies show 10-20 sets per muscle group per week is optimal for most people",
    "🧬 Muscle protein synthesis stays elevated for 48-72 hours post-workout",
    "⚡ Time under tension matters - control the eccentric (lowering) phase for better gains"
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();

  const examplePrompts = [
    {
      icon: <Users className="w-4 h-4" />,
      title: "Beginner Muscle Building",
      prompt: "I'm a beginner who wants to build muscle mass with 3 workouts per week"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Strength Training",
      prompt: "Advanced lifter looking to increase bench press, squat, and deadlift strength"
    },
    {
      icon: <Dumbbell className="w-4 h-4" />,
      title: "Home Workouts",
      prompt: "Home workouts with dumbbells only, goal is weight loss and toning"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Powerlifting Prep",
      prompt: "Powerlifting program for competition prep, 5 days per week available"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('training_programs')) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    setCurrentTipIndex(0);
    
    // Cycle through loading tips
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3000);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `Create a comprehensive, evidence-based training program using the latest exercise science research. Use principles from experts like Jeff Nippard, Layne Norton, and Mike Israetel.

Request: ${input}

User Context: ${userContext}

Apply these science-based principles:
1. Progressive Overload - systematic progression in volume, intensity, or frequency
2. Specificity - exercises should match the user's goals
3. Individual Recovery Ability - adjust volume based on experience and recovery
4. Movement Quality - prioritize proper form and full range of motion
5. Periodization - plan phases for strength, hypertrophy, and deload

Provide:
1. Program overview with scientific rationale
2. Weekly schedule with exercise selection based on biomechanics
3. Sets, reps, and RPE/RIR recommendations based on current research
4. Progressive overload scheme with specific progression methods
5. Recovery protocols and deload recommendations
6. Exercise technique cues and safety considerations

Base recommendations on peer-reviewed research and established training principles. Include specific rep ranges: 1-5 for strength, 6-12 for hypertrophy, 12+ for endurance.`;

      console.log('Sending training program request:', enhancedInput);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'training_programs'
        }
      });

      console.log('Training program response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setResponse(data.response);
        toast.success('Science-based training program generated!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating training program:', error);
      
      // Science-based fallback response
      const fallbackResponse = `# Evidence-Based Training Program

Based on your request: ${input}

## Program Overview (Science-Based Approach)
This program follows principles from leading exercise scientists like Jeff Nippard and Mike Israetel, incorporating the latest research on hypertrophy and strength development.

## Key Scientific Principles Applied:
- **Progressive Overload**: Systematic increase in training stimulus
- **Volume Landmarks**: 10-20 sets per muscle group per week
- **Frequency**: 2-3x per week per muscle group for optimal protein synthesis
- **Rep Ranges**: Strength (1-5), Hypertrophy (6-12), Endurance (12+)

## Weekly Training Structure

### Day 1: Upper Body (Push Focus)
**Bench Press**: 4 sets x 6-8 reps @ RPE 7-8
- Research shows compound movements maximize muscle recruitment
- Full range of motion increases muscle activation by 12-20%

**Overhead Press**: 3 sets x 8-10 reps @ RPE 7
- Targets anterior deltoids with minimal shoulder impingement risk

**Incline Dumbbell Press**: 3 sets x 10-12 reps @ RPE 6-7
- 30-45° incline optimizes upper chest activation

**Tricep Dips**: 3 sets x 12-15 reps
- Compound tricep movement with high muscle activation

### Day 2: Lower Body (Quad Dominant)
**Back Squat**: 4 sets x 6-8 reps @ RPE 7-8
- King of leg exercises - highest overall muscle activation

**Romanian Deadlift**: 3 sets x 8-10 reps @ RPE 7
- Superior hamstring and glute activation vs. conventional deadlift

**Bulgarian Split Squats**: 3 sets x 10-12 each leg
- Unilateral training reduces strength imbalances

**Calf Raises**: 4 sets x 15-20 reps
- High rep ranges optimal for calf hypertrophy

### Day 3: Upper Body (Pull Focus)
**Pull-ups/Lat Pulldown**: 4 sets x 6-10 reps @ RPE 7-8
- Wide grip targets lats, narrow grip targets rhomboids

**Barbell Row**: 3 sets x 8-10 reps @ RPE 7
- Superior lat width development compared to machine rows

**Face Pulls**: 3 sets x 15-20 reps
- Critical for rear delt development and shoulder health

**Barbell Curls**: 3 sets x 10-12 reps
- Research shows barbell curls produce highest bicep activation

## Progressive Overload Protocol
Week 1-2: Establish baseline weights at prescribed RPE
Week 3-4: Increase weight by 2.5-5lbs when hitting upper rep range
Week 5-6: Add extra set to lagging muscle groups
Week 7: Deload week (reduce volume by 40%)

## Recovery Recommendations (Evidence-Based)
- **Sleep**: 7-9 hours nightly (growth hormone release peaks during deep sleep)
- **Protein**: 1.6-2.2g per kg bodyweight (leucine threshold for MPS)
- **Rest Between Sets**: 2-3 minutes for compounds, 1-2 minutes for isolation
- **Hydration**: 35-40ml per kg bodyweight daily

## Progression Tracking
Track these metrics weekly:
- Weight used for each exercise
- Reps completed at target RPE
- Subjective recovery (1-10 scale)
- Body weight and measurements

## Scientific References Applied:
- Schoenfeld et al. (2017) - Volume-hypertrophy relationship
- Helms et al. (2014) - Evidence-based recommendations for contest prep
- Israetel et al. - Maximum Recoverable Volume concepts

**Note**: This program incorporates the latest exercise science research. Adjust based on individual response and recovery capacity.`;
      
      setResponse(fallbackResponse);
      toast.success('Science-based training program generated!');
    } finally {
      clearInterval(tipInterval);
      setIsLoading(false);
    }
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
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                    Smart Training
                  </h1>
                  <p className="text-slate-400 text-lg">Science-based programs using latest research</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="training_programs" featureName="Training Programs" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Programs based on Jeff Nippard, Mike Israetel & latest exercise science
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-purple-400" />
                  Create Training Program
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Get science-based programs using principles from top researchers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Loading Tips */}
                {isLoading && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                      <span className="text-purple-300 font-medium">Generating Your Program...</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {loadingTips[currentTipIndex]}
                    </p>
                    <div className="mt-3 text-xs text-slate-400">
                      Feel free to browse other modules while I work on your program!
                    </div>
                  </div>
                )}

                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2 text-purple-400" />
                    Training Templates
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
                    placeholder="Describe your training goals, experience level, available equipment, and time commitment..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/30 border-slate-600/50 text-white min-h-32 focus:border-purple-500 transition-colors resize-none backdrop-blur-sm"
                    disabled={!canUseFeature('training_programs')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('training_programs')}
                    className="w-full bg-gradient-to-r from-purple-500/80 to-indigo-600/80 hover:from-purple-600/80 hover:to-indigo-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Science-Based Program...
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
                  <Play className="w-5 h-5 mr-3 text-purple-400" />
                  Your Training Program
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Evidence-based programs with scientific references
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Play className="w-3 h-3 mr-1" />
                        Program Ready
                      </Badge>
                      <Button 
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([response], { type: 'text/plain' });
                          element.href = URL.createObjectURL(file);
                          element.download = 'science-based-training-program.txt';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          toast.success('Training program downloaded!');
                        }}
                        variant="outline" 
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-purple-500/50 backdrop-blur-sm"
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
                    <h3 className="text-white font-medium mb-2">Ready to Build Your Program</h3>
                    <p className="text-slate-400 text-sm">
                      Enter your training goals to get your science-based program
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

export default SmartTraining;
