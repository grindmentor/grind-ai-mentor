import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingDown, Target, Calendar, Zap } from "lucide-react";
import { useState } from "react";
import { useUnitsPreference } from "@/hooks/useUnitsPreference";
import { MobileHeader } from "@/components/MobileHeader";

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
  const [duration, setDuration] = useState("12");
  const [activityLevel, setActivityLevel] = useState("");
  const [goals, setGoals] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateCut = async () => {
    if (!age || !gender || !height || !currentWeight || !activityLevel) {
      return;
    }

    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    let current = parseFloat(currentWeight);
    let target = targetWeight ? parseFloat(targetWeight) : current * 0.9;
    const durationWeeks = parseFloat(duration);
    let parsedAge = parseFloat(age);
    let parsedHeight = parseFloat(height);
    
    // Convert to metric for calculation if needed
    if (units.weightUnit === 'lbs') {
      current = current / 2.20462;
      target = target / 2.20462;
    }
    if (units.heightUnit === 'in') {
      parsedHeight = parsedHeight * 2.54;
    }
    
    const totalWeightLoss = current - target;
    const weeklyDeficit = totalWeightLoss / durationWeeks;
    
    // Enhanced BMR calculation using Mifflin-St Jeor equation
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * current) + (6.25 * parsedHeight) - (5 * parsedAge) + 5;
    } else {
      bmr = (10 * current) + (6.25 * parsedHeight) - (5 * parsedAge) - 161;
    }
    
    const activityMultipliers: { [key: string]: number } = {
      "sedentary": 1.2,
      "light": 1.375,
      "moderate": 1.55,
      "active": 1.725,
      "very_active": 1.9
    };
    
    const estimatedTDEE = bmr * activityMultipliers[activityLevel];
    const dailyDeficit = (weeklyDeficit * 3500) / 7;
    const targetCalories = Math.round(estimatedTDEE - dailyDeficit);
    
    // Convert back to display units
    let displayCurrent = parseFloat(currentWeight);
    let displayTarget = targetWeight ? parseFloat(targetWeight) : displayCurrent * 0.9;
    let displayLoss = displayCurrent - displayTarget;
    
    const calculatedResults = {
      currentWeight: displayCurrent,
      targetWeight: displayTarget,
      totalLoss: displayLoss,
      weeksToGoal: durationWeeks,
      estimatedTDEE: Math.round(estimatedTDEE),
      targetCalories,
      dailyDeficit: Math.round(dailyDeficit),
      weeklyDeficit: weeklyDeficit,
      targetDate: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      weightUnit: units.weightUnit,
      bmr: Math.round(bmr)
    };
    
    setResults(calculatedResults);
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-red-800/20">
      <MobileHeader
        title="CutCalc Pro"
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/30 backdrop-blur-sm border-red-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500/30 to-orange-500/40 rounded-xl flex items-center justify-center border border-red-500/30">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">CutCalc Pro</CardTitle>
                <CardDescription className="text-red-200/80">
                  Advanced cutting calculations with science-based insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-200">Age *</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-200">Gender *</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-200">Height ({units.heightUnit}) *</Label>
                <Input
                  type="number"
                  placeholder={units.heightUnit === 'cm' ? "175" : "69"}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-200">Current Weight ({units.weightUnit}) *</Label>
                <Input
                  type="number"
                  placeholder={units.weightUnit === 'kg' ? "80" : "180"}
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-200">Target Weight ({units.weightUnit})</Label>
                <Input
                  type="number"
                  placeholder={units.weightUnit === 'kg' ? "75" : "165"}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-200">Duration (weeks)</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-red-900/30 border-red-500/50 text-white focus:border-red-400 placeholder:text-red-300/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-red-200">Activity Level *</Label>
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
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 py-3"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 mr-2 bg-orange-500/30 rounded flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded animate-bounce"></div>
                  </div>
                  Calculating Your Cut...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Cutting Plan
                </>
              )}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-300">Timeline</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{results.weeksToGoal} weeks</p>
                    <p className="text-red-200/80 text-sm">Target: {results.targetDate}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-300">Weight Loss</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{results.totalLoss.toFixed(1)} {results.weightUnit}</p>
                    <p className="text-red-200/80 text-sm">{results.currentWeight} → {results.targetWeight} {results.weightUnit}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Daily Targets
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

                <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                  <h4 className="text-red-300 font-medium mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-red-200/90 space-y-1">
                    <li>• Track weight daily, look at weekly averages</li>
                    <li>• Prioritize protein (0.8-1g per {units.weightUnit === 'kg' ? 'kg' : 'lb'} bodyweight)</li>
                    <li>• Include resistance training to preserve muscle</li>
                    <li>• Adjust calories if progress stalls for 2+ weeks</li>
                    <li>• Stay hydrated and prioritize sleep quality</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                  <h4 className="text-red-300 font-medium mb-2">📊 Fat Loss Projection</h4>
                  <div className="text-sm text-red-200 space-y-1">
                    <p><strong>Weekly loss:</strong> {results.weeklyDeficit.toFixed(1)} {results.weightUnit}/week</p>
                    <p><strong>Monthly loss:</strong> {(results.weeklyDeficit * 4.3).toFixed(1)} {results.weightUnit}/month</p>
                    <p className="text-red-300/80 text-xs mt-2">*Based on 3500 calories = 1 {units.weightUnit === 'kg' ? '0.45 kg' : 'lb'} fat. Actual results may vary.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CutCalcPro;
