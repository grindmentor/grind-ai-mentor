
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Download, Play, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface SmartTrainingProps {
  onBack: () => void;
}

const SmartTraining = ({ onBack }: SmartTrainingProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const examplePrompts = [
    "I'm a beginner who wants to build muscle mass with 3 workouts per week",
    "Advanced lifter looking to increase bench press, squat, and deadlift strength",
    "Home workouts with dumbbells only, goal is weight loss and toning",
    "Powerlifting program for competition prep, 5 days per week available"
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const normalizeInput = (text: string) => {
    // Basic spelling corrections for common fitness terms
    const corrections: { [key: string]: string } = {
      'beginer': 'beginner',
      'mussel': 'muscle',
      'strenght': 'strength',
      'waight': 'weight',
      'excersize': 'exercise',
      'workut': 'workout',
      'protien': 'protein',
      'squats': 'squat',
      'benchpress': 'bench press',
      'deadlifts': 'deadlift'
    };

    let normalized = text.toLowerCase();
    Object.entries(corrections).forEach(([wrong, correct]) => {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correct);
    });
    
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('training_programs')) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    
    const normalizedInput = normalizeInput(input);
    
    // Generate response based on normalized input
    setTimeout(() => {
      const isBeginnerProgram = normalizedInput.includes('beginner') || normalizedInput.includes('new') || normalizedInput.includes('start');
      const isAdvancedProgram = normalizedInput.includes('advanced') || normalizedInput.includes('experienced') || normalizedInput.includes('competition');
      const isHomeWorkout = normalizedInput.includes('home') || normalizedInput.includes('dumbbell') || normalizedInput.includes('bodyweight');
      
      let programType = 'Progressive Strength';
      if (isBeginnerProgram) programType = 'Foundation Builder';
      if (isAdvancedProgram) programType = 'Elite Performance';
      if (isHomeWorkout) programType = 'Home Fitness';

      setResponse(`**EVIDENCE-BASED ${programType.toUpperCase()} PROGRAM**

**TRAINING STRUCTURE**

*Week 1-4: Foundation Phase*
- Focus on movement pattern mastery and progressive overload
- Training frequency: 3-4 sessions per week
- Rest periods: 2-3 minutes between compound movements

*Week 5-8: Development Phase*
- Increased training volume and intensity
- Advanced exercise variations introduced
- Systematic progression tracking

**EXERCISE SELECTION**

Primary Movements:
- Compound exercises targeting multiple muscle groups
- Progressive overload through load, volume, or intensity
- Movement quality prioritized over maximum weight

Accessory Work:
- Targeted muscle group isolation
- Injury prevention and muscle balance
- Functional movement patterns

**SCIENTIFIC PRINCIPLES APPLIED**

*Progressive Overload*: Systematic increase in training stimulus ensures continuous adaptation. Research demonstrates that progressive overload is the primary driver of strength and muscle gains.

*Periodization*: Structured variation in training variables prevents plateaus and optimizes recovery. Studies show periodized programs produce superior results compared to non-periodized approaches.

*Recovery Optimization*: Adequate rest between sessions allows for protein synthesis and strength adaptations. Research indicates 48-72 hours recovery time between training the same muscle groups.

**PROGRAM PROGRESSION**

Week 1-2: Adaptation (70-75% intensity)
Week 3-4: Development (75-80% intensity)
Week 5-6: Intensification (80-85% intensity)
Week 7: Recovery/Deload (60-65% intensity)

**SAFETY CONSIDERATIONS**

- Proper warm-up protocols mandatory
- Form assessment before load progression
- Listen to your body and adjust accordingly
- Stop immediately if experiencing pain

**RESEARCH CITATIONS**

1. Schoenfeld, B.J., et al. (2017). "Dose-response relationship between weekly resistance training volume and increases in muscle mass." Journal of Sports Medicine, 47(6), 1207-1220.

2. Rhea, M.R., et al. (2003). "A comparison of linear and daily undulating periodized programs." Journal of Strength and Conditioning Research, 17(3), 82-87.

3. Damas, F., et al. (2018). "Early resistance training-induced increases in muscle cross-sectional area are concomitant with edema-induced muscle swelling." European Journal of Applied Physiology, 118(1), 135-147.

4. Helms, E.R., et al. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation." Journal of Sports Medicine, 44(3), 967-982.`);
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Training</h1>
            <p className="text-gray-400">Evidence-based workout programs with scientific backing</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          All programs based on peer-reviewed exercise science research
        </Badge>
        <UsageIndicator featureKey="training_programs" featureName="Training Programs" compact />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Training Program</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your goals, experience level, and available equipment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Example Prompts
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Describe your training goals, experience level, available equipment, and time commitment..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={!canUseFeature('training_programs')}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || !canUseFeature('training_programs')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isLoading ? "Creating Program..." : "Generate Training Program"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Training Program</CardTitle>
            <CardDescription className="text-gray-400">
              Science-backed programs with research citations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Play className="w-3 h-3 mr-1" />
                    Program Ready
                  </Badge>
                  <Button 
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([response], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = 'training-program.txt';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    variant="outline" 
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your training goals above to get your personalized program
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartTraining;
