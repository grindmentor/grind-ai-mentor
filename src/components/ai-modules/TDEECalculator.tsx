
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeft, Activity, Target, TrendingUp, Info } from "lucide-react";
import { useState } from "react";

interface TDEECalculatorProps {
  onBack: () => void;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateTDEE = async () => {
    if (!age || !weight || !height || !gender || !activityLevel) {
      return;
    }

    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const bodyFatNum = bodyFat ? parseFloat(bodyFat) : null;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === "male") {
      bmr = (10 * weightNum * 0.453592) + (6.25 * heightNum * 2.54) - (5 * ageNum) + 5;
    } else {
      bmr = (10 * weightNum * 0.453592) + (6.25 * heightNum * 2.54) - (5 * ageNum) - 161;
    }
    
    // Activity multipliers
    const activityMultipliers: { [key: string]: number } = {
      "sedentary": 1.2,
      "light": 1.375,
      "moderate": 1.55,
      "active": 1.725,
      "very_active": 1.9
    };
    
    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Calculate BMI
    const heightM = heightNum * 0.0254;
    const weightKg = weightNum * 0.453592;
    const bmi = weightKg / (heightM * heightM);
    
    let additionalMetrics = null;
    if (bodyFatNum) {
      // Calculate lean body mass and muscle mass
      const fatMass = (weightNum * bodyFatNum) / 100;
      const leanBodyMass = weightNum - fatMass;
      const muscleMass = leanBodyMass * 0.45; // Approximate muscle mass as 45% of LBM
      
      // Calculate FFMI (Fat-Free Mass Index)
      const ffmi = (leanBodyMass * 0.453592) / (heightM * heightM);
      const normalizedFFMI = ffmi + (6.1 * (1.8 - heightM));
      
      additionalMetrics = {
        fatMass: Math.round(fatMass * 10) / 10,
        leanBodyMass: Math.round(leanBodyMass * 10) / 10,
        muscleMass: Math.round(muscleMass * 10) / 10,
        ffmi: Math.round(ffmi * 10) / 10,
        normalizedFFMI: Math.round(normalizedFFMI * 10) / 10
      };
    }
    
    const calculatedResults = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      bmi: Math.round(bmi * 10) / 10,
      additionalMetrics,
      goals: {
        cutting: Math.round(tdee - 500),
        bulking: Math.round(tdee + 300),
        maintenance: Math.round(tdee)
      }
    };
    
    setResults(calculatedResults);
    setIsCalculating(false);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { category: "Normal", color: "text-green-400" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-400" };
    return { category: "Obese", color: "text-red-400" };
  };

  const getFFMICategory = (ffmi: number) => {
    if (ffmi < 16) return { category: "Below Average", color: "text-blue-400" };
    if (ffmi < 18) return { category: "Average", color: "text-green-400" };
    if (ffmi < 20) return { category: "Above Average", color: "text-yellow-400" };
    if (ffmi < 25) return { category: "Excellent", color: "text-orange-400" };
    return { category: "Elite/Suspicious", color: "text-red-400" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-900/20 to-green-700 text-white p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 border border-green-400/20">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  TDEE & FFMI Calculator
                </h1>
                <p className="text-slate-400 text-lg">Complete metabolic and body composition analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-sm">
            <Activity className="w-4 h-4 mr-2" />
            Advanced body composition & metabolic analysis
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Body Metrics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enter your information for comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Age</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Weight (lbs)</Label>
                  <Input
                    type="number"
                    placeholder="180"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Height (inches)</Label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Body Fat % (optional - for advanced metrics)</Label>
                <Input
                  type="number"
                  placeholder="15"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week exercise)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week exercise)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week exercise)</SelectItem>
                    <SelectItem value="very_active">Very Active (2x/day or intense training)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculateTDEE}
                disabled={!age || !weight || !height || !gender || !activityLevel || isCalculating}
                className="w-full bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/80 hover:to-emerald-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Metrics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Your Results
              </CardTitle>
              <CardDescription className="text-slate-400">
                Complete metabolic and body composition analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* Basic Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{results.bmr}</div>
                      <div className="text-slate-400 text-sm">BMR (calories/day)</div>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{results.tdee}</div>
                      <div className="text-slate-400 text-sm">TDEE (calories/day)</div>
                    </div>
                  </div>

                  {/* BMI */}
                  <div className="bg-slate-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Body Mass Index (BMI)</h4>
                      <Info className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{results.bmi}</span>
                      <span className={`font-medium ${getBMICategory(results.bmi).color}`}>
                        {getBMICategory(results.bmi).category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      BMI is a simple height-to-weight ratio. Normal range: 18.5-24.9
                    </p>
                  </div>

                  {/* Advanced Metrics (if body fat provided) */}
                  {results.additionalMetrics && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/20 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                          Body Composition
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Fat Mass:</span>
                            <span className="text-red-400 ml-2 font-medium">{results.additionalMetrics.fatMass} lbs</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Lean Mass:</span>
                            <span className="text-green-400 ml-2 font-medium">{results.additionalMetrics.leanBodyMass} lbs</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Muscle Mass:</span>
                            <span className="text-blue-400 ml-2 font-medium">{results.additionalMetrics.muscleMass} lbs</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Muscle mass estimated as ~45% of lean body mass
                        </p>
                      </div>

                      <div className="bg-slate-800/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">Fat-Free Mass Index (FFMI)</h4>
                          <Info className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">{results.additionalMetrics.ffmi}</span>
                          <span className={`font-medium ${getFFMICategory(results.additionalMetrics.ffmi).color}`}>
                            {getFFMICategory(results.additionalMetrics.ffmi).category}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-2">
                          <div>Normalized FFMI: {results.additionalMetrics.normalizedFFMI}</div>
                          <p className="text-xs mt-1">
                            FFMI measures muscle mass relative to height. Natural limit ~25, average 16-18
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calorie Goals */}
                  <div className="bg-slate-800/20 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-400" />
                      Calorie Goals
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-red-400 font-bold">{results.goals.cutting}</div>
                        <div className="text-slate-400">Cutting</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{results.goals.maintenance}</div>
                        <div className="text-slate-400">Maintain</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{results.goals.bulking}</div>
                        <div className="text-slate-400">Bulking</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                    <h4 className="text-green-300 font-medium mb-2">💡 Key Insights</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• TDEE is your daily calorie maintenance level</li>
                      <li>• For fat loss: eat 300-500 below TDEE</li>
                      <li>• For muscle gain: eat 200-400 above TDEE</li>
                      {results.additionalMetrics && (
                        <li>• FFMI shows your muscle development potential</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Ready to Calculate</h3>
                  <p className="text-slate-400 text-sm">
                    Enter your body metrics for complete analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TDEECalculator;
