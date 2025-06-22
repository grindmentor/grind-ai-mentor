
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useUsage } from "@/contexts/UsageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { convertKgToLbs, convertLbsToKg, convertCmToInches, convertInchesToCm, convertFeetAndInchesToInches, formatHeight, formatWeight } from "@/lib/unitConversions";

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
  bodyFat: string;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const { tdeeCalculations, incrementUsage } = useUsage();
  const { preferences } = usePreferences();
  
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    bodyFat: ''
  });
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const maxCalculations = 3;

  const calculateMaintenanceCalories = (weight: number, height: number, age: number, gender: string, activityLevel: string) => {
    // Step 1: Calculate BMR using Mifflin-St Jeor equation (most accurate)
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) + 5;
    } else {
      bmr = (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) - 161;
    }

    // Step 2: Apply activity multiplier to get TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,      // Little/no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Hard exercise 6-7 days/week
      very_active: 1.9     // Very hard exercise, physical job
    };

    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
    
    // Step 3: Maintenance calories = TDEE (this IS the maintenance)
    const maintenanceCalories = Math.round(tdee);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      maintenanceCalories
    };
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.age || tdeeCalculations >= maxCalculations) return;
    
    // Validate height input based on unit
    let hasValidHeight = false;
    if (preferences.height_unit === 'ft-in') {
      hasValidHeight = !!(formData.heightFeet && formData.heightInches);
    } else {
      hasValidHeight = !!formData.height;
    }
    
    if (!hasValidHeight) return;
    
    setIsCalculating(true);
    incrementUsage('tdeeCalculations');
    
    // Convert all inputs to standard units (lbs, inches)
    const weightInLbs = preferences.weight_unit === 'kg' 
      ? convertKgToLbs(parseFloat(formData.weight))
      : parseFloat(formData.weight);
    
    let heightInInches: number;
    if (preferences.height_unit === 'ft-in') {
      heightInInches = convertFeetAndInchesToInches(
        parseInt(formData.heightFeet), 
        parseInt(formData.heightInches)
      );
    } else if (preferences.height_unit === 'cm') {
      heightInInches = convertCmToInches(parseFloat(formData.height));
    } else {
      heightInInches = parseFloat(formData.height);
    }
    
    const age = parseInt(formData.age);
    const bodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : null;
    
    // Calculate maintenance calories using our formula
    const maintenanceData = calculateMaintenanceCalories(weightInLbs, heightInInches, age, formData.gender, formData.activityLevel);
    
    // FFMI calculation (if body fat provided)
    let ffmi = null;
    let ffmiCategory = '';
    if (bodyFat) {
      const leanMass = weightInLbs * (1 - bodyFat / 100);
      ffmi = leanMass * 0.453592 / ((heightInInches * 0.0254) ** 2);
      
      if (ffmi > 25) ffmiCategory = 'Exceptional (Elite level)';
      else if (ffmi > 22) ffmiCategory = 'Excellent (Very muscular)';
      else if (ffmi > 20) ffmiCategory = 'Good (Above average)';
      else if (ffmi > 18) ffmiCategory = 'Average';
      else ffmiCategory = 'Below average';
    }
    
    // BMI calculation
    const bmi = weightInLbs / ((heightInInches * 0.0254) ** 2);
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal weight';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
    
    // Caloric recommendations based on maintenance
    const cuttingCalories = Math.round(maintenanceData.maintenanceCalories * 0.8); // 20% deficit
    const bulkingCalories = Math.round(maintenanceData.maintenanceCalories * 1.1); // 10% surplus
    
    // Macro recommendations (general guidelines)
    const proteinGrams = Math.round(weightInLbs * 0.8);
    const fatGrams = Math.round(weightInLbs * 0.3);
    const carbsGrams = Math.round((maintenanceData.maintenanceCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      setResults({
        bmr: maintenanceData.bmr,
        tdee: maintenanceData.tdee,
        maintenanceCalories: maintenanceData.maintenanceCalories,
        bmi: bmi.toFixed(1),
        bmiCategory,
        ffmi: ffmi ? ffmi.toFixed(1) : null,
        ffmiCategory,
        cuttingCalories,
        bulkingCalories,
        macros: {
          protein: proteinGrams,
          fat: fatGrams,
          carbs: carbsGrams
        },
        displayWeight: formatWeight(weightInLbs, preferences.weight_unit),
        displayHeight: formatHeight(heightInInches, preferences.height_unit),
        recommendations: [
          `Your maintenance calories are ${maintenanceData.maintenanceCalories} per day`,
          `BMR: ${maintenanceData.bmr} calories (what you burn at complete rest)`,
          `TDEE: ${maintenanceData.tdee} calories (including daily activities)`,
          bmi < 18.5 ? 'Consider gaining weight gradually with a structured program' : 
          bmi > 25 ? 'Consider a moderate caloric deficit with resistance training' : 
          'You\'re in a healthy weight range - focus on body composition',
          ffmi && ffmi > 22 ? 'Excellent muscle development - focus on maintaining strength' :
          ffmi && ffmi < 20 ? 'Focus on progressive resistance training and adequate protein intake' :
          'Continue building muscle while managing body fat levels'
        ]
      });
      setIsCalculating(false);
    }, 1500);
  };

  const handleRecalculate = () => {
    if (tdeeCalculations < maxCalculations) {
      handleCalculate(new Event('submit') as any);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <h1 className="text-3xl font-bold text-white">TDEE & Maintenance Calculator</h1>
            <p className="text-gray-400">Calculate your maintenance calories and metabolic needs</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Scientific formula: Mifflin-St Jeor equation + activity multipliers
        </Badge>
        <Badge className={`${tdeeCalculations >= maxCalculations ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
          {tdeeCalculations}/{maxCalculations} calculations used
        </Badge>
      </div>

      {tdeeCalculations >= maxCalculations && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Calculation Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              Upgrade to get unlimited calculations and advanced analysis features
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
            <CardTitle className="text-white">Maintenance Calorie Calculator</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your stats to calculate your daily maintenance calories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">Weight ({preferences.weight_unit})</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder={preferences.weight_unit === 'kg' ? '80' : '180'}
                    value={formData.weight}
                    onChange={(e) => updateFormData('weight', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                {preferences.height_unit === 'ft-in' ? (
                  <div className="space-y-2">
                    <Label className="text-white">Height</Label>
                    <div className="flex space-x-1">
                      <Input
                        type="number"
                        placeholder="5"
                        value={formData.heightFeet}
                        onChange={(e) => updateFormData('heightFeet', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <span className="text-white text-sm self-center">ft</span>
                      <Input
                        type="number"
                        placeholder="10"
                        value={formData.heightInches}
                        onChange={(e) => updateFormData('heightInches', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <span className="text-white text-sm self-center">in</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-white">Height ({preferences.height_unit})</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder={preferences.height_unit === 'cm' ? '175' : '70'}
                      value={formData.height}
                      onChange={(e) => updateFormData('height', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                )}
              </div>
              
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
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
                <Select value={formData.activityLevel} onValueChange={(value) => updateFormData('activityLevel', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                    <SelectItem value="light">Lightly active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Very active (6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Extremely active (2x/day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bodyFat" className="text-white">Body Fat % (Optional)</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  placeholder="15"
                  value={formData.bodyFat}
                  onChange={(e) => updateFormData('bodyFat', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={tdeeCalculations >= maxCalculations || isCalculating}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isCalculating ? "Calculating..." : "Calculate Maintenance Calories"}
              </Button>

              {results && tdeeCalculations < maxCalculations && (
                <Button 
                  type="button"
                  onClick={handleRecalculate}
                  variant="outline"
                  className="w-full mt-2 border-gray-700 text-white hover:bg-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalculate
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Maintenance Calories</CardTitle>
            <CardDescription className="text-gray-400">
              Based on scientific formulas and your activity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-orange-400 text-sm font-medium">Your Stats</div>
                  <div className="text-white text-sm">
                    {results.displayWeight} • {results.displayHeight}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-green-400 text-3xl font-bold">{results.maintenanceCalories}</div>
                    <div className="text-white text-lg font-medium">Maintenance Calories/Day</div>
                    <div className="text-gray-400 text-sm mt-1">This is what you need to maintain your current weight</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-orange-400 text-xl font-bold">{results.bmr}</div>
                    <div className="text-gray-400 text-sm">BMR (at rest)</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-orange-400 text-xl font-bold">{results.tdee}</div>
                    <div className="text-gray-400 text-sm">TDEE (with activity)</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-blue-400 text-xl font-bold">{results.bmi}</div>
                    <div className="text-gray-400 text-sm">BMI</div>
                    <div className="text-xs text-gray-500">{results.bmiCategory}</div>
                  </div>
                  {results.ffmi && (
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <div className="text-green-400 text-xl font-bold">{results.ffmi}</div>
                      <div className="text-gray-400 text-sm">FFMI</div>
                      <div className="text-xs text-gray-500">{results.ffmiCategory}</div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Goal-Based Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-400">Fat Loss (20% deficit)</span>
                      <span className="text-white font-bold">{results.cuttingCalories} cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Maintenance</span>
                      <span className="text-white font-bold">{results.maintenanceCalories} cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">Muscle Gain (10% surplus)</span>
                      <span className="text-white font-bold">{results.bulkingCalories} cal</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Recommended Macros</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-400">Protein</span>
                      <span className="text-white">{results.macros.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Fats</span>
                      <span className="text-white">{results.macros.fat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Carbs</span>
                      <span className="text-white">{results.macros.carbs}g</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Key Insights</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-xs">• {rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>*Maintenance calories calculated using Mifflin-St Jeor BMR + activity multipliers</p>
                  <p>*Individual metabolism may vary ±200 calories</p>
                  <p>*Monitor weight changes and adjust accordingly</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your information to calculate your maintenance calories</p>
                <p className="text-xs mt-2">Based on scientifically validated formulas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDEECalculator;
