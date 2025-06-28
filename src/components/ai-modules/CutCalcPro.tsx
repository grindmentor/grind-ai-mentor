
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeft, TrendingDown, Target, Calendar, Zap } from "lucide-react";
import { useState } from "react";
import { useUnitsPreference } from "@/hooks/useUnitsPreference";

interface CutCalcProProps {
  onBack: () => void;
}

const CutCalcPro = ({ onBack }: CutCalcProProps) => {
  const { units } = useUnitsPreference();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [weeklyDeficit, setWeeklyDeficit] = useState("1");
  const [activityLevel, setActivityLevel] = useState("");
  const [goals, setGoals] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateCut = async () => {
    if (!age || !gender || !height || !currentWeight || !activityLevel) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    let current = parseFloat(currentWeight);
    let target = targetWeight ? parseFloat(targetWeight) : current * 0.9; // Default to 10% loss if no target
    const deficitPerWeek = parseFloat(weeklyDeficit);
    let parsedAge = parseFloat(age);
    let parsedHeight = parseFloat(height);
    
    // Convert to lbs for calculation if using kg
    if (units.weightUnit === 'kg') {
      current = current * 2.20462;
      target = target * 2.20462;
    }
    if (units.heightUnit === 'cm') {
      parsedHeight = parsedHeight / 2.54; // Convert to inches for calculation
    }
    
    const totalWeightLoss = current - target;
    const weeksToGoal = Math.ceil(totalWeightLoss / deficitPerWeek);
    
    // Enhanced BMR calculation using Mifflin-St Jeor equation
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * (current / 2.20462)) + (6.25 * (parsedHeight * 2.54)) - (5 * parsedAge) + 5;
    } else {
      bmr = (10 * (current / 2.20462)) + (6.25 * (parsedHeight * 2.54)) - (5 * parsedAge) - 161;
    }
    
    // Activity multipliers
    const activityMultipliers: { [key: string]: number } = {
      "sedentary": 1.2,
      "light": 1.375,
      "moderate": 1.55,
      "active": 1.725,
      "very_active": 1.9
    };
    
    const estimatedTDEE = bmr * activityMultipliers[activityLevel];
    
    // Calculate daily deficit needed (3500 calories = 1 lb fat)
    const dailyDeficit = (deficitPerWeek * 3500) / 7;
    const targetCalories = Math.round(estimatedTDEE - dailyDeficit);
    
    // Convert weights back to display units for results
    let displayCurrent = parseFloat(currentWeight);
    let displayTarget = targetWeight ? parseFloat(targetWeight) : displayCurrent * 0.9;
    let displayLoss = displayCurrent - displayTarget;
    
    const calculatedResults = {
      currentWeight: displayCurrent,
      targetWeight: displayTarget,
      totalLoss: displayLoss,
      weeksToGoal,
      estimatedTDEE: Math.round(estimatedTDEE),
      targetCalories,
      dailyDeficit: Math.round(dailyDeficit),
      weeklyDeficit: deficitPerWeek,
      targetDate: new Date(Date.now() + weeksToGoal * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      weightUnit: units.weightUnit,
      bmr: Math.round(bmr)
    };
    
    setResults(calculatedResults);
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-red-800/20 text-white animate-fade-in">
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-white hover:bg-red-500/20 backdrop-blur-sm hover:text-red-400 transition-colors font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              CutCalc Pro
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 p-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2 text-sm">
            <TrendingDown className="w-4 h-4 mr-2" />
            Science-based cutting calculations
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/30 backdrop-blur-sm border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                Cutting Calculator
              </CardTitle>
              <CardDescription className="text-red-200/80">
                Enter your details for personalized cutting plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-200">Age</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-200">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-red-900/30 border-red-500/50 text-white">
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
                  <Label className="text-red-200">Height ({units.heightUnit})</Label>
                  <Input
                    type="number"
                    placeholder={units.heightUnit === 'cm' ? "175" : "69"}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-200">Current Weight ({units.weightUnit})</Label>
                  <Input
                    type="number"
                    placeholder={units.weightUnit === 'kg' ? "80" : "180"}
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-red-200">Target Weight ({units.weightUnit}) - Optional</Label>
                <Input
                  type="number"
                  placeholder={units.weightUnit === 'kg' ? "75" : "165"}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-red-200">Weekly Weight Loss Goal</Label>
                <Select value={weeklyDeficit} onValueChange={setWeeklyDeficit}>
                  <SelectTrigger className="bg-red-900/30 border-red-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">{units.weightUnit === 'kg' ? '0.25 kg/week' : '0.5 lbs/week'} (Conservative)</SelectItem>
                    <SelectItem value="1">{units.weightUnit === 'kg' ? '0.5 kg/week' : '1 lb/week'} (Moderate)</SelectItem>
                    <SelectItem value="1.5">{units.weightUnit === 'kg' ? '0.75 kg/week' : '1.5 lbs/week'} (Aggressive)</SelectItem>
                    <SelectItem value="2">{units.weightUnit === 'kg' ? '1 kg/week' : '2 lbs/week'} (Very Aggressive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-red-200">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger className="bg-red-900/30 border-red-500/50 text-white">
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

              <div className="space-y-2">
                <Label className="text-red-200">Goals & Notes (Optional)</Label>
                <Textarea
                  placeholder="e.g., Get lean for summer, maintain strength, specific timeline..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>

              <Button 
                onClick={calculateCut}
                disabled={!age || !gender || !height || !currentWeight || !activityLevel || isCalculating}
                className="w-full bg-gradient-to-r from-red-500/80 to-orange-600/80 hover:from-red-600/80 hover:to-orange-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating Your Cut...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Cutting Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/30 backdrop-blur-sm border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-red-400" />
                Your Cutting Plan
              </CardTitle>
              <CardDescription className="text-red-200/80">
                Personalized timeline and calorie targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-800/30 rounded-xl p-4 text-center border border-red-500/30">
                      <div className="text-2xl font-bold text-red-400">{results.weeksToGoal}</div>
                      <div className="text-red-200/80 text-sm">Weeks to Goal</div>
                    </div>
                    <div className="bg-red-800/30 rounded-xl p-4 text-center border border-red-500/30">
                      <div className="text-2xl font-bold text-orange-400">{results.totalLoss.toFixed(1)} {results.weightUnit}</div>
                      <div className="text-red-200/80 text-sm">Total Loss</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-red-800/20 rounded-xl p-4 border border-red-500/30">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-red-400" />
                        Daily Targets
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-red-200/80">Target Calories:</span>
                          <span className="text-white ml-2 font-medium">{results.targetCalories}</span>
                        </div>
                        <div>
                          <span className="text-red-200/80">Daily Deficit:</span>
                          <span className="text-red-400 ml-2 font-medium">-{results.dailyDeficit}</span>
                        </div>
                        <div>
                          <span className="text-red-200/80">BMR:</span>
                          <span className="text-white ml-2 font-medium">{results.bmr}</span>
                        </div>
                        <div>
                          <span className="text-red-200/80">TDEE:</span>
                          <span className="text-white ml-2 font-medium">{results.estimatedTDEE}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-800/20 rounded-xl p-4 border border-red-500/30">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-red-400" />
                        Timeline
                      </h4>
                      <div className="text-center">
                        <div className="text-lg text-white">Target Date: <span className="text-red-400 font-medium">{results.targetDate}</span></div>
                        <div className="text-sm text-red-200/80 mt-1">
                          From {results.currentWeight} {results.weightUnit} → {results.targetWeight} {results.weightUnit}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/20">
                      <h4 className="text-red-300 font-medium mb-2">💡 Pro Tips</h4>
                      <ul className="text-sm text-red-200/90 space-y-1">
                        <li>• Track weight daily, look at weekly averages</li>
                        <li>• Prioritize protein (0.8-1g per lb bodyweight)</li>
                        <li>• Include resistance training to preserve muscle</li>
                        <li>• Adjust calories if progress stalls for 2+ weeks</li>
                        <li>• Stay hydrated and prioritize sleep quality</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-red-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <Calculator className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Ready to Calculate</h3>
                  <p className="text-red-200/80 text-sm">
                    Fill in your details to get your personalized cutting plan
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

export default CutCalcPro;
