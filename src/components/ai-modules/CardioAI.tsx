
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Download, Play } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface CardioAIProps {
  onBack: () => void;
}

const CardioAI = ({ onBack }: CardioAIProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('training_programs')) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    
    // Simulate AI response with science-backed cardio programs
    setTimeout(() => {
      setResponse(`Based on cardiovascular exercise science, here's your personalized cardio program:

**PROGRAM: ${input.includes('weight loss') ? 'Fat Burn Accelerator' : input.includes('endurance') ? 'Aerobic Base Builder' : 'Cardiovascular Conditioning'}**

**Week 1-4: Foundation Phase**

*Monday - HIIT Intervals*
- Warm-up: 5 minutes easy pace
- Main Set: 8 x 30 seconds high intensity / 90 seconds recovery
- Cool-down: 5 minutes easy pace
- Target: 85-95% HRmax during intervals

*Wednesday - Steady State Cardio*
- Duration: 30-45 minutes
- Intensity: 65-75% HRmax (Zone 2)
- Focus: Aerobic base building
- RPE: 6-7/10 (conversational pace)

*Friday - Tempo Training*
- Warm-up: 10 minutes easy
- Main Set: 20 minutes at lactate threshold (80-85% HRmax)
- Cool-down: 10 minutes easy
- RPE: 8/10 (comfortably hard)

*Saturday - Active Recovery*
- 20-30 minutes low intensity
- Options: Walking, easy cycling, swimming
- Heart rate: 50-60% HRmax

**Scientific Principles Applied:**
- **Progressive Overload**: Gradual increase in duration and intensity (Laursen & Buchheit, 2019)
- **Polarized Training**: 80% low intensity, 20% high intensity (Seiler, 2010)
- **Recovery Optimization**: Adequate rest between high-intensity sessions (Bompa & Buzzichelli, 2018)

**Heart Rate Zones:**
- Zone 1 (50-60% HRmax): Active recovery
- Zone 2 (60-70% HRmax): Aerobic base
- Zone 3 (70-80% HRmax): Aerobic threshold
- Zone 4 (80-90% HRmax): Lactate threshold
- Zone 5 (90-100% HRmax): Neuromuscular power

**Progression Schedule:**
Week 1-2: Adaptation (shorter intervals, longer recovery)
Week 3-4: Build (maintain intervals, reduce recovery)
Week 5-6: Peak (longer intervals, shorter recovery)
Week 7: Recovery week (reduce volume by 40%)

**Metabolic Adaptations Expected:**
- Increased VO2max (8-15% improvement in 8-12 weeks)
- Enhanced fat oxidation capacity
- Improved cardiac output and stroke volume
- Better lactate clearance and buffering

**Research Citations:**
1. Laursen, P.B. & Buchheit, M. (2019). "Science and application of high-intensity interval training"
2. Seiler, S. (2010). "What is best practice for training intensity and duration distribution in endurance athletes?"
3. Bompa, T. & Buzzichelli, C. (2018). "Periodization Training for Sports, 3rd Edition"

**Nutrition Guidelines:**
- Pre-workout: 30-60g carbs 1-3 hours before
- During workout: Electrolytes for sessions >60 minutes
- Post-workout: 3:1 carb to protein ratio within 30 minutes

**Safety Monitoring:**
- Use RPE scale (1-10) to monitor intensity
- Track morning heart rate for overtraining signs
- Stop if experiencing chest pain, dizziness, or unusual fatigue

⚠️ **Medical Clearance**: Consult healthcare provider before starting if you have cardiovascular conditions.

**Next Steps**: Start with Week 1 protocol and track your progress using heart rate monitor or RPE scale.`);
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
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CardioAI</h1>
            <p className="text-gray-400">Science-based cardiovascular training programs</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          All programs based on cardiovascular exercise science research
        </Badge>
        <UsageIndicator featureKey="training_programs" featureName="Cardio Programs" compact />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Cardio Program</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your cardio goals, fitness level, and available equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Example: I want to improve my cardiovascular endurance for running. I'm a beginner who can currently run for 15 minutes without stopping. I have access to a treadmill and outdoor running paths. My goal is to be able to run a 5K in under 30 minutes within 3 months..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={!canUseFeature('training_programs')}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || !canUseFeature('training_programs')}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                {isLoading ? "Creating Program..." : "Generate Cardio Program"}
              </Button>
            </form>

            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">💡 Program Tips:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Specify your current fitness level and experience</li>
                <li>• Mention specific goals (weight loss, endurance, speed)</li>
                <li>• Include available equipment and time constraints</li>
                <li>• Note any injuries or physical limitations</li>
                <li>• Describe your preferred activities (running, cycling, etc.)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Cardio Program</CardTitle>
            <CardDescription className="text-gray-400">
              Evidence-based cardiovascular training with research citations
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
                      element.download = 'cardio-program.txt';
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
                <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p>Enter your cardio goals above to get your personalized program</p>
                <p className="text-sm mt-2">Science-backed training plans with heart rate zones</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardioAI;
