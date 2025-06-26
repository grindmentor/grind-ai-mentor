
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowLeft, TrendingDown, Scale, Calendar, Award, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { convertKgToLbs, convertLbsToKg, convertCmToInches, convertInchesToCm, convertFeetAndInchesToInches, formatHeight, formatWeight } from "@/lib/unitConversions";
import { usePreferences } from "@/contexts/PreferencesContext";

interface CutCalcProProps {
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
  bodyFat: string;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft-in' | 'in';
}

const CutCalcPro = ({ onBack }: CutCalcProProps) => {
  const { preferences } = usePreferences();
  
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    bodyFat: '',
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

  const calculateOptimalBodyFat = (gender: string, age: number) => {
    if (gender === 'male') {
      if (age < 30) return { min: 10, max: 15, optimal: 12 };
      if (age < 40) return { min: 12, max: 17, optimal: 14 };
      if (age < 50) return { min: 14, max: 19, optimal: 16 };
      return { min: 16, max: 21, optimal: 18 };
    } else {
      if (age < 30) return { min: 16, max: 21, optimal: 18 };
      if (age < 40) return { min: 18, max: 23, optimal: 20 };
      if (age < 50) return { min: 20, max: 25, optimal: 22 };
      return { min: 22, max: 27, optimal: 24 };
    }
  };

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
    
    // Simulate calculation time
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
      const currentBodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : null;
      
      // Enhanced calculations
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
      const bmi = (weightInLbs * 0.453592) / ((heightInInches * 0.0254) ** 2);
      
      // Calculate lean body mass and FFMI if body fat is provided
      let leanBodyMass = null;
      let ffmi = null;
      let muscleMass = null;
      
      if (currentBodyFat) {
        leanBodyMass = weightInLbs * (1 - currentBodyFat / 100);
        ffmi = (leanBodyMass * 0.453592) / ((heightInInches * 0.0254) ** 2);
        muscleMass = leanBodyMass * 0.85; // Estimate muscle mass as ~85% of lean body mass
      }
      
      const optimalBF = calculateOptimalBodyFat(formData.gender, age);
      
      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmi: bmi.toFixed(1),
        ffmi: ffmi ? ffmi.toFixed(1) : null,
        leanBodyMass: leanBodyMass ? leanBodyMass.toFixed(1) : null,
        muscleMass: muscleMass ? muscleMass.toFixed(1) : null,
        currentBodyFat: currentBodyFat ? `${currentBodyFat}%` : 'Not provided',
        optimalBodyFat: `${optimalBF.optimal}% (Range: ${optimalBF.min}-${optimalBF.max}%)`,
        cuttingCalories: Math.round(tdee - 500),
        bulkingCalories: Math.round(tdee + 300),
        displayWeight: formatWeight(weightInLbs, formData.weightUnit),
        displayHeight: formatHeight(heightInInches, formData.heightUnit),
        recommendations: [
          currentBodyFat && currentBodyFat > optimalBF.max ? 'Consider a cutting phase to reduce body fat to optimal range' :
          currentBodyFat && currentBodyFat < optimalBF.min ? 'Consider a lean bulk to build muscle mass' :
          bmi < 18.5 ? 'Consider a lean bulk phase with progressive overload training' : 
          bmi > 25 ? 'Consider a cutting phase with adequate protein intake' : 
          'Maintenance or body recomposition recommended',
          ffmi && ffmi > 22 ? 'Excellent muscle development - focus on strength training' : 
          ffmi && ffmi > 20 ? 'Good muscle development - continue progressive overload' : 
          'Focus on muscle building with compound movements',
          'Track progress photos and measurements weekly for best results',
          'Prioritize sleep (7-9 hours) and stress management for optimal body composition'
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-red-900 text-white p-6">
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
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/25 border border-red-400/20">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  CutCalc Pro
                </h1>
                <p className="text-slate-400 text-lg">Advanced body composition analysis</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Pro Analysis
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingDown, title: "Precise Cutting", desc: "Scientific approach" },
            { icon: Scale, title: "Body Composition", desc: "Advanced metrics" },
            { icon: Calendar, title: "Timeline Planning", desc: "Realistic goals" },
            { icon: Award, title: "Pro Analysis", desc: "Detailed insights" }
          ].map((feature, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-red-400/20">
                  <feature.icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-xs">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Calculator Card */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl flex items-center justify-center">
              <Target className="w-6 h-6 mr-3 text-red-400" />
              Advanced Body Composition Calculator
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Calculate cutting strategy with muscle mass and FFMI analysis
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Weight Input */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Current Weight</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-red-500"
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
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-red-500"
                          required
                        />
                        <Input
                          type="number"
                          placeholder="10"
                          value={formData.heightInches}
                          onChange={(e) => setFormData({...formData, heightInches: e.target.value})}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-red-500"
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
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-red-500"
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
                      className="bg-slate-800/50 border-slate-600/50 text-white focus:border-red-500"
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
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Fat Input */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Body Fat % (optional)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={formData.bodyFat}
                      onChange={(e) => setFormData({...formData, bodyFat: e.target.value})}
                      className="bg-slate-800/50 border-slate-600/50 text-white focus:border-red-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-medium py-4 text-lg shadow-xl shadow-red-500/25"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Calculating Advanced Metrics...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-3" />
                      Calculate Body Composition
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-400/20">
                    <Award className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your Body Composition Analysis</h3>
                  <p className="text-slate-400">Advanced metrics and recommendations</p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="p-4">
                      <h4 className="text-white font-medium mb-2">Basic Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">BMR:</span>
                          <span className="text-white">{result.bmr} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">TDEE:</span>
                          <span className="text-white">{result.tdee} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">BMI:</span>
                          <span className="text-white">{result.bmi}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {result.ffmi && (
                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <h4 className="text-white font-medium mb-2">Body Composition</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">FFMI:</span>
                            <span className="text-white">{result.ffmi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Lean Mass:</span>
                            <span className="text-white">{result.leanBodyMass} {formData.weightUnit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Muscle Mass:</span>
                            <span className="text-white">{result.muscleMass} {formData.weightUnit}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="p-4">
                      <h4 className="text-white font-medium mb-2">Calorie Targets</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cutting:</span>
                          <span className="text-red-400">{result.cuttingCalories} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Maintenance:</span>
                          <span className="text-white">{result.tdee} cal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bulking:</span>
                          <span className="text-green-400">{result.bulkingCalories} cal</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-6">
                    <h4 className="text-white font-medium mb-4">Personalized Recommendations</h4>
                    <div className="space-y-3">
                      {result.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-slate-300 text-sm">{rec}</p>
                        </div>
                      ))}
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

export default CutCalcPro;
