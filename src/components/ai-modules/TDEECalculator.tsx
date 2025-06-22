
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";

interface TDEECalculatorProps {
  onBack: () => void;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const calculateBMI = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    if (gender === "male") {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const getActivityMultiplier = (level: string): number => {
    const multipliers: Record<string, number> = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extremely_active': 1.9
    };
    return multipliers[level] || 1.2;
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const handleCalculate = async () => {
    if (!canUseFeature('tdee_calculations')) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your TDEE calculation limit for this month.",
        variant: "destructive",
      });
      return;
    }

    if (!age || !gender || !weight || !height || !activityLevel) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to calculate your TDEE.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseInt(age);

      // Validate inputs
      if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
        throw new Error("Please enter valid positive numbers for all fields");
      }

      // Calculate BMI and BMR - BMI uses weight in kg and height in cm
      const bmi = calculateBMI(weightNum, heightNum);
      const bmr = calculateBMR(weightNum, heightNum, ageNum, gender);
      const tdee = bmr * getActivityMultiplier(activityLevel);

      const calculationResults = {
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory: getBMICategory(bmi),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        weightLoss: Math.round(tdee - 500),
        weightGain: Math.round(tdee + 500),
        maintenance: Math.round(tdee)
      };

      setResults(calculationResults);

      // Save to database
      if (user) {
        await supabase.from('tdee_calculations').insert({
          user_id: user.id,
          age: ageNum,
          gender,
          weight: weightNum,
          height: heightNum,
          activity_level: activityLevel,
          bmi: calculationResults.bmi,
          bmr: calculationResults.bmr,
          tdee: calculationResults.tdee
        });

        await incrementUsage('tdee_calculations');
      }

      toast({
        title: "TDEE calculated successfully!",
        description: "Your personalized results are ready.",
      });
    } catch (error) {
      console.error('Error calculating TDEE:', error);
      toast({
        title: "Calculation error",
        description: error instanceof Error ? error.message : "There was an error calculating your TDEE. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">TDEE Calculator</h1>
              <p className="text-gray-400">Calculate your daily calorie needs with scientific precision</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your Information</CardTitle>
              <CardDescription>Enter your details for accurate calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Age (years)</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    min="15"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="70"
                    min="30"
                    max="300"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Height (cm)</Label>
                  <Input
                    type="number"
                    placeholder="175"
                    min="100"
                    max="250"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active (2x/day or intense)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isLoading ? "Calculating..." : "Calculate TDEE"}
              </Button>
            </CardContent>
          </Card>

          {results && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Your Results</CardTitle>
                <CardDescription>Your personalized calorie recommendations based on scientific formulas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{results.bmi}</div>
                    <div className="text-sm text-gray-400">BMI</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {results.bmiCategory}
                    </Badge>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{results.bmr}</div>
                    <div className="text-sm text-gray-400">BMR (calories/day)</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 p-4 rounded-lg border border-orange-500/30">
                  <div className="text-3xl font-bold text-white">{results.tdee}</div>
                  <div className="text-sm text-orange-200">TDEE - Maintenance Calories</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-white">Weight Loss (-500 cal)</span>
                    <span className="font-bold text-green-400">{results.weightLoss} cal/day</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-white">Maintenance</span>
                    <span className="font-bold text-yellow-400">{results.maintenance} cal/day</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-white">Weight Gain (+500 cal)</span>
                    <span className="font-bold text-blue-400">{results.weightGain} cal/day</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-200">
                    <strong>Note:</strong> These calculations use the Mifflin-St Jeor equation, validated by extensive research as the most accurate predictor of metabolic rate.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TDEECalculator;
