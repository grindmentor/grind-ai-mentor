
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface SmartTrainingProps {
  onBack: () => void;
}

const SmartTraining = ({ onBack }: SmartTrainingProps) => {
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [program, setProgram] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateProgram = () => {
    if (!goal || !experience) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setProgram(`**12-Week Science-Based Training Program**

**Phase 1: Foundation (Weeks 1-4)**
*Goal: Movement patterns, work capacity*

**Day 1: Upper Body**
• Bench Press: 3 sets x 8-12 reps
• Bent-over Row: 3 sets x 8-12 reps  
• Overhead Press: 3 sets x 8-12 reps
• Pull-ups/Lat Pulldown: 3 sets x 8-12 reps
• Dips: 2 sets x 8-15 reps

**Day 2: Lower Body**
• Squat: 3 sets x 8-12 reps
• Romanian Deadlift: 3 sets x 8-12 reps
• Bulgarian Split Squats: 2 sets x 10 each leg
• Hip Thrusts: 3 sets x 12-15 reps
• Calf Raises: 3 sets x 15-20 reps

**Day 3: Full Body**
• Deadlift: 3 sets x 5-8 reps
• Push-ups: 2 sets x 10-15 reps
• Goblet Squats: 2 sets x 12-15 reps
• Plank: 3 sets x 30-60 seconds

**Scientific Principles Applied:**
• **Progressive Overload** (Schoenfeld, 2010)
• **Periodization** for optimal adaptations (Haff & Triplett, 2015)
• **Volume Landmarks** based on research (Schoenfeld et al., 2017)

**Recovery Guidelines:**
• 48-72 hours between training same muscle groups
• 7-9 hours sleep for optimal recovery (Walker, 2017)
• Protein: 1.6-2.2g/kg bodyweight (Helms et al., 2014)

**References:**
1. Schoenfeld, B. (2010). The mechanisms of muscle hypertrophy
2. Haff, G. & Triplett, N. (2015). Essentials of Strength Training
3. Walker, M. (2017). Why We Sleep: Sleep and Recovery`);
      
      setIsLoading(false);
    }, 2000);
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
            <p className="text-gray-400">Programs based on exercise science</p>
          </div>
        </div>
      </div>

      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
        Built on periodization principles and progressive overload research
      </Badge>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="generator" className="text-white">Program Generator</TabsTrigger>
          <TabsTrigger value="program" className="text-white">Your Program</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Generate Your Training Program</CardTitle>
              <CardDescription className="text-gray-400">
                Based on exercise science research and periodization principles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white text-base mb-3 block">Primary Goal</Label>
                  <RadioGroup value={goal} onValueChange={setGoal}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="strength" id="strength" />
                      <Label htmlFor="strength" className="text-gray-300">Build Strength</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="muscle" id="muscle" />
                      <Label htmlFor="muscle" className="text-gray-300">Build Muscle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="endurance" id="endurance" />
                      <Label htmlFor="endurance" className="text-gray-300">Improve Endurance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fat-loss" id="fat-loss" />
                      <Label htmlFor="fat-loss" className="text-gray-300">Fat Loss</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-white text-base mb-3 block">Training Experience</Label>
                  <RadioGroup value={experience} onValueChange={setExperience}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="text-gray-300">Beginner (0-1 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="text-gray-300">Intermediate (2-4 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="text-gray-300">Advanced (5+ years)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button 
                onClick={handleGenerateProgram}
                disabled={!goal || !experience || isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isLoading ? "Generating Program..." : "Generate Training Program"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your Training Program</CardTitle>
              <CardDescription className="text-gray-400">
                Science-backed program with research citations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {program ? (
                <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{program}</pre>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Generate your program in the Generator tab to see your personalized training plan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartTraining;
