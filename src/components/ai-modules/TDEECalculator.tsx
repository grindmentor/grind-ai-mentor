
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeft, Zap, Target, TrendingUp, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { convertKgToLbs, convertLbsToKg, convertCmToInches, convertInchesToCm, convertFeetAndInchesToInches, formatHeight, formatWeight } from "@/lib/unitConversions";
import { usePreferences } from "@/contexts/PreferencesContext";

interface TDEECalculatorProps {
  onBack: () => void;
}

interface FormData {
  weight: string;
  height: string;
  heightFeet: string;
  heightInches: string;
  age: string;
  gender: string;
  activityLevel: string;
  goal: string;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft-in' | 'in';
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const { preferences } = usePreferences();
  
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    weightUnit: preferences.weight_unit,
    heightUnit: preferences.height_unit
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when preferences change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      weightUnit: preferences.weight_unit,
      heightUnit: preferences.height_unit
    }));
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.age) return;
    
    let hasValidHeight = false;
    if (formData.heightUnit === 'ft-in') {
      hasValidHeight = !!(formData.heightFeet && formData.heightInches);
    } else {
      hasValidHeight = !!formData.height;
    }
    
    if (!hasValidHeight) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const weightInLbs = formData.weightUnit === 'kg' 
        ? convertKgToLbs(parseFloat(formData.weight))
        : parseFloat(formData.weight);
      
      let heightInInches: number;
      if (formData.heightUnit === 'ft-in') {
        heightInInches = convertFeetAndInchesToInches(
          parseInt(formData.heightFeet), 
          parseInt(formData.heightInches)
        );
      } else if (formData.heightUnit === 'cm') {
        heightInInches = convertCmToInches(parseFloat(formData.height));
      } else {
        heightInInches = parseFloat(formData.height);
      }
      
      const age = parseInt(formData.age);
      
      const bmr = formData.gender === 'male' 
        ? (10 * weightInLbs * 0.453592) + (6.25 * heightInInches * 2.54) - (5 * age) + 5
        : (10 * weightInLbs * 0.453592) + (6.25 * heightInInches * 2.54) - (5 * age) - 161;
      
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = bmr * activityMultipliers[formData.activityLevel as keyof typeof activityMultipliers];
      
      let targetCalories = tdee;
      if (formData.goal === 'cut') {
        targetCalories = tdee - 500;
      } else if (formData.goal === 'bulk') {
        targetCalories = tdee + 300;
      }
      
      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        goal: formData.goal,
        displayWeight: formatWeight(weightInLbs, formData.weightUnit),
        displayHeight: formatHeight(heightInInches, formData.heightUnit),
        macros: {
          protein: Math.round((targetCalories * 0.25) / 4),
          carbs: Math.round((targetCalories * 0.45) / 4),
          fats: Math.round((targetCalories * 0.30) / 9)
        }
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/20 to-blue-700 text-white p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
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
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/20">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  TDEE Calculator
                </h1>
                <p className="text-slate-400 text-lg">Calculate your daily calorie needs</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Precision Tool
          </Badge>
        </div>

        {/* Main Calculator Card */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl flex items-center justify-center">
              <Calculator className="w-6 h-6 mr-3 text-blue-400" />
              TDEE & Macro Calculator
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Get your personalized calorie and macro targets
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weight Input */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Weight</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-500"
                        required
                      />
                      <Select value={formData.weightUnit} onValueChange={(value: 'kg' | 'lbs') => setFormData({...formData, weightUnit: value})}>
                        <SelectTrigger className="w-20 bg-slate-800/50 border-slate-600/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Height Input */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Height</Label>
                    {formData.heightUnit === 'ft-in' ? (
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="5"
                          value={formData.heightFeet}
                          onChange={(e) => setFormData({...formData, heightFeet: e.target.value})}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-500"
                          required
                        />
                        <Input
                          type="number"
                          placeholder="10"
                          value={formData.heightInches}
                          onChange={(e) => setFormData({...formData, heightInches: e.target.value})}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-500"
                          required
                        />
                        <Select value={formData.heightUnit} onValueChange={(value: 'cm' | 'ft-in' | 'in') => setFormData({...formData, heightUnit: value})}>
                          <SelectTrigger className="w-20 bg-slate-800/50 border-slate-600/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="ft-in">ft-in</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder={formData.heightUnit === 'cm' ? '170' : '67'}
                          value={formData.height}
                          onChange={(e) => setFormData({...formData, height: e.target.value})}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-500"
                          required
                        />
                        <Select value={formData.heightUnit} onValueChange={(value: 'cm' | 'ft-in' | 'in') => setFormData({...formData, heightUnit: value})}>
                          <SelectTrigger className="w-20 bg-slate-800/50 border-slate-600/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="ft-in">ft-in</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Age Input */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Age</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Gender Input */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Activity Level</Label>
                    <Select value={formData.activityLevel} onValueChange={(value) => setFormData({...formData, activityLevel: value})}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                        <SelectItem value="light">Light Activity (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate Activity (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (2x/day, intense)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Goal Selection - Simplified */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Goal</Label>
                    <Select value={formData.goal} onValueChange={(value) => setFormData({...formData, goal: value})}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="cut">Cut (Fat Loss)</SelectItem>
                        <SelectItem value="bulk">Bulk (Muscle Gain)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-4 text-lg shadow-xl shadow-blue-500/25"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-3" />
                      Calculate TDEE & Macros
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Your Personalized Results</h3>
                  <p className="text-slate-400">Based on your {formData.goal} goal</p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="w-6 h-6 text-blue-400" />
                        <h4 className="text-white font-semibold">Calorie Targets</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">BMR (Base Metabolic Rate):</span>
                          <span className="text-white font-medium">{result.bmr} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">TDEE (Maintenance):</span>
                          <span className="text-white font-medium">{result.tdee} cal</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-600 pt-3">
                          <span className="text-slate-300 font-medium">Your Target:</span>
                          <span className={`font-bold ${
                            formData.goal === 'cut' ? 'text-red-400' : 
                            formData.goal === 'bulk' ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {result.targetCalories} cal
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Activity className="w-6 h-6 text-green-400" />
                        <h4 className="text-white font-semibold">Macro Breakdown</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Protein:</span>
                          <span className="text-white font-medium">{result.macros.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Carbs:</span>
                          <span className="text-white font-medium">{result.macros.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fats:</span>
                          <span className="text-white font-medium">{result.macros.fats}g</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Goal-specific advice */}
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-6">
                    <h4 className="text-white font-semibold mb-4">Recommendations for Your Goal</h4>
                    <div className="space-y-2 text-slate-300">
                      {formData.goal === 'cut' && (
                        <>
                          <p>• Focus on maintaining protein intake to preserve muscle mass</p>
                          <p>• Consider strength training to maintain metabolic rate</p>
                          <p>• Track progress through measurements, not just scale weight</p>
                        </>
                      )}
                      {formData.goal === 'bulk' && (
                        <>
                          <p>• Prioritize progressive overload in your training</p>
                          <p>• Spread protein intake throughout the day</p>
                          <p>• Monitor weekly weight gain (0.5-1 lb per week is ideal)</p>
                        </>
                      )}
                      {formData.goal === 'maintain' && (
                        <>
                          <p>• Focus on body recomposition with consistent training</p>
                          <p>• Monitor energy levels and adjust calories as needed</p>
                          <p>• Track performance metrics over scale weight</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  onClick={() => setResult(null)}
                  variant="outline"
                  className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
                >
                  Calculate Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDEECalculator;
