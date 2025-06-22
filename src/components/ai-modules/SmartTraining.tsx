
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface SmartTrainingProps {
  onBack: () => void;
}

const SmartTraining = ({ onBack }: SmartTrainingProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const maxPrompts = 3; // Basic tier limit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || promptsUsed >= maxPrompts) return;
    
    setIsLoading(true);
    setPromptsUsed(prev => prev + 1);
    
    // Simulate AI response with science-backed training programs
    setTimeout(() => {
      setResponse(`Based on exercise science research, here's your personalized training program:

**PROGRAM: ${input.includes('beginner') ? 'Foundation Builder' : input.includes('advanced') ? 'Elite Performance' : 'Progressive Strength'}**

**Week 1-4: Foundation Phase**
*Monday - Upper Body Strength*
- Bench Press: 3x8-10 (Progressive overload principle)
- Pull-ups/Lat Pulldowns: 3x8-12
- Overhead Press: 3x6-8
- Barbell Rows: 3x8-10
- Rest: 2-3 minutes between sets

*Wednesday - Lower Body Power*
- Squats: 4x6-8 (Focus on eccentric control)
- Romanian Deadlifts: 3x8-10
- Bulgarian Split Squats: 3x10 each leg
- Hip Thrusts: 3x12-15

*Friday - Full Body Circuit*
- Deadlifts: 3x5 (Technical focus)
- Push-ups: 3x max reps
- Kettlebell Swings: 3x20
- Planks: 3x45-60 seconds

**Scientific Principles Applied:**
- **Progressive Overload**: Systematic increase in training stimulus (Schoenfeld et al., 2017)
- **Specificity**: Exercise selection targets your stated goals
- **Recovery**: 48-72 hours between training same muscle groups (Damas et al., 2018)

**Periodization Schedule:**
Week 1-2: Adaptation (75% 1RM)
Week 3-4: Intensification (80-85% 1RM)
Week 5: Deload (65% 1RM)

**Research Citations:**
1. Schoenfeld, B.J. (2017). "Dose-response relationship between resistance training volume and muscle hypertrophy"
2. Damas, F. (2018). "Early resistance training-induced increases in muscle cross-sectional area are concomitant with edema-induced muscle swelling"
3. Helms, E.R. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation"

⚠️ **Safety Note**: Always warm up properly and use proper form. Consult a healthcare provider before starting any new training program.

**Next Steps**: Track your progress weekly and adjust weights based on RPE (Rate of Perceived Exertion) scale.`);
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
        <Badge className={`${promptsUsed >= maxPrompts ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
          {promptsUsed}/{maxPrompts} programs used
        </Badge>
      </div>

      {promptsUsed >= maxPrompts && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Program Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              Upgrade to get unlimited training programs and advanced features
            </p>
            <Button 
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Training Program</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your goals, experience level, and available equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Example: I'm an intermediate lifter looking to build muscle. I have access to a full gym and can train 4 days per week. My goal is to increase strength in bench, squat, and deadlift while gaining lean mass..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={promptsUsed >= maxPrompts}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || promptsUsed >= maxPrompts}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
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
              <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
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
