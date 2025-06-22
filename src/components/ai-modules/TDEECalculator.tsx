
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface TDEECalculatorProps {
  onBack: () => void;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [results, setResults] = useState("");

  const calculateTDEE = () => {
    if (!weight || !height || !age || !gender || !activity) return;

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === "male") {
      bmr = (10 * weightNum * 0.453592) + (6.25 * heightNum * 2.54) - (5 * ageNum) + 5;
    } else {
      bmr = (10 * weightNum * 0.453592) + (6.25 * heightNum * 2.54) - (5 * ageNum) - 161;
    }

    // Activity multipliers
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };

    const tdee = Math.round(bmr * multipliers[activity as keyof typeof multipliers]);
    const maintenance = tdee;
    const cutting = Math.round(tdee - 500);
    const bulking = Math.round(tdee + 300);

    // FFMI Calculation
    const heightM = heightNum * 2.54 / 100;
    const weightKg = weightNum * 0.453592;
    const bmi = weightKg / (heightM * heightM);
    
    // Estimate body fat (rough approximation)
    const estimatedBF = gender === "male" ? 
      Math.max(5, Math.min(25, (bmi - 20) * 2 + 12)) : 
      Math.max(10, Math.min(35, (bmi - 20) * 2 + 20));
    
    const leanMass = weightKg * (1 - estimatedBF / 100);
    const ffmi = leanMass / (heightM * heightM);

    setResults(`**TDEE & Body Composition Analysis**

**Basal Metabolic Rate (BMR):** ${Math.round(bmr)} calories/day
*The calories your body burns at rest*

**Total Daily Energy Expenditure (TDEE):** ${tdee} calories/day
*Your total calorie needs including activity*

**Calorie Recommendations:**
• **Maintenance:** ${maintenance} calories/day
• **Fat Loss (Cut):** ${cutting} calories/day (-500 deficit)
• **Muscle Gain (Bulk):** ${bulking} calories/day (+300 surplus)

**Body Composition Estimates:**
• **BMI:** ${bmi.toFixed(1)} kg/m²
• **Estimated Body Fat:** ${estimatedBF.toFixed(1)}%
• **Fat-Free Mass Index (FFMI):** ${ffmi.toFixed(1)}

**FFMI Interpretation:**
${ffmi < 17 ? "• Below average muscle mass - focus on resistance training" :
  ffmi < 20 ? "• Average muscle mass - good foundation" :
  ffmi < 23 ? "• Above average muscle mass - excellent progress" :
  "• Exceptional muscle mass - elite level"}

**Scientific References:**
• BMR calculated using Mifflin-St Jeor equation (most accurate for general population)
• TDEE based on validated activity multipliers from metabolic research
• FFMI provides drug-free muscle mass potential assessment

**Important Notes:**
• These are estimates based on population averages
• Individual metabolic rates can vary by ±200-300 calories
• Body fat estimates require DEXA/BodPod for accuracy
• Adjust calories based on weekly weight changes

**Recommendations:**
• Track weight daily, use weekly averages
• Adjust calories by ±100-200 based on progress
• Prioritize protein: ${Math.round(weightNum * 1.2)}g per day
• Include resistance training for muscle preservation`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">TDEE & FFMI Calculator</h1>
            <p className="text-gray-400">Calculate your metabolic needs and muscle mass potential</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Science-backed formulas
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Mifflin-St Jeor equation
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          FFMI analysis included
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Information</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your details for accurate calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="180"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height" className="text-white">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="70"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
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
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Activity Level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="light">Lightly active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderately active (3-5 days/week)</SelectItem>
                  <SelectItem value="very">Very active (6-7 days/week)</SelectItem>
                  <SelectItem value="extra">Extra active (2x/day, intense)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateTDEE}
              disabled={!weight || !height || !age || !gender || !activity}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Calculate TDEE & FFMI
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Results</CardTitle>
            <CardDescription className="text-gray-400">
              Metabolic rate and body composition analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{results}</pre>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your information above to calculate your TDEE and FFMI
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDEECalculator;
