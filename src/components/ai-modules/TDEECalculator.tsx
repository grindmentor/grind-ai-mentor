
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
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    bodyFat: ''
  });
  const [results, setResults] = useState<any>(null);
  const [calculationsUsed, setCalculationsUsed] = useState(0);
  const maxCalculations = 3; // Free tier limit

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.height || !formData.age || calculationsUsed >= maxCalculations) return;
    
    setCalculationsUsed(prev => prev + 1);
    
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    const bodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : null;
    
    // BMR calculation using Mifflin-St Jeor equation
    const bmr = formData.gender === 'male' 
      ? (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) + 5
      : (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) - 161;
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const tdee = bmr * activityMultipliers[formData.activityLevel as keyof typeof activityMultipliers];
    
    // FFMI calculation (if body fat provided)
    let ffmi = null;
    let ffmiCategory = '';
    if (bodyFat) {
      const leanMass = weight * (1 - bodyFat / 100);
      ffmi = leanMass * 0.453592 / ((height * 0.0254) ** 2);
      
      if (ffmi > 25) ffmiCategory = 'Exceptional (Elite level)';
      else if (ffmi > 22) ffmiCategory = 'Excellent (Very muscular)';
      else if (ffmi > 20) ffmiCategory = 'Good (Above average)';
      else if (ffmi > 18) ffmiCategory = 'Average';
      else ffmiCategory = 'Below average';
    }
    
    // BMI calculation
    const bmi = weight / ((height * 0.0254) ** 2);
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal weight';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
    
    // Caloric recommendations
    const cuttingCalories = Math.round(tdee * 0.8); // 20% deficit
    const bulkingCalories = Math.round(tdee * 1.1); // 10% surplus
    const maintenanceCalories = Math.round(tdee);
    
    // Macro recommendations (general guidelines)
    const proteinGrams = Math.round(weight * 0.8); // 0.8g per lb
    const fatGrams = Math.round(weight * 0.3); // 0.3g per lb
    const carbsGrams = Math.round((maintenanceCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    
    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      bmi: bmi.toFixed(1),
      bmiCategory,
      ffmi: ffmi ? ffmi.toFixed(1) : null,
      ffmiCategory,
      cuttingCalories,
      bulkingCalories,
      maintenanceCalories,
      macros: {
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbsGrams
      },
      recommendations: [
        `Your BMR is ${Math.round(bmr)} calories - this is what you burn at rest`,
        `Your TDEE is ${Math.round(tdee)} calories - this includes your activity`,
        bmi < 18.5 ? 'Consider gaining weight gradually' : 
        bmi > 25 ? 'Consider a moderate caloric deficit' : 
        'You\'re in a healthy weight range',
        ffmi && ffmi > 22 ? 'Excellent muscle development - focus on maintaining' :
        ffmi && ffmi < 20 ? 'Focus on resistance training and adequate protein' :
        'Continue building muscle while managing body fat'
      ]
    });
  };

  const handleInputChange = (field: string, value: string) => {
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
            <h1 className="text-3xl font-bold text-white">TDEE & FFMI Calculator</h1>
            <p className="text-gray-400">Calculate metabolic needs and muscle mass potential</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Calculations based on validated scientific formulas
        </Badge>
        <Badge className={`${calculationsUsed >= maxCalculations ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
          {calculationsUsed}/{maxCalculations} calculations used
        </Badge>
      </div>

      {calculationsUsed >= maxCalculations && (
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
            <CardTitle className="text-white">Body Stats Calculator</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your information for TDEE and FFMI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="180"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="70"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
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
                  onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={calculationsUsed >= maxCalculations}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                Calculate TDEE & FFMI
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Results</CardTitle>
            <CardDescription className="text-gray-400">
              Metabolic calculations and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-orange-400 text-xl font-bold">{results.bmr}</div>
                    <div className="text-gray-400 text-sm">BMR (calories)</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-orange-400 text-xl font-bold">{results.tdee}</div>
                    <div className="text-gray-400 text-sm">TDEE (calories)</div>
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
                  <h4 className="text-white font-medium mb-3">Caloric Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-400">Cutting (Fat Loss)</span>
                      <span className="text-white font-bold">{results.cuttingCalories} cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Maintenance</span>
                      <span className="text-white font-bold">{results.maintenanceCalories} cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Bulking (Muscle Gain)</span>
                      <span className="text-white font-bold">{results.bulkingCalories} cal</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Macro Recommendations</h4>
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
                  <h4 className="text-white font-medium mb-2">Recommendations</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-xs">• {rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>*BMR calculated using Mifflin-St Jeor equation</p>
                  <p>*FFMI = Fat-Free Mass Index (muscle mass indicator)</p>
                  <p>*Recommendations are general guidelines - consult professionals for personalized advice</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your stats above to calculate your TDEE and FFMI
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDEECalculator;
