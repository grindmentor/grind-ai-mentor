
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface CutCalcProProps {
  onBack: () => void;
}

const CutCalcPro = ({ onBack }: CutCalcProProps) => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate'
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.height || !formData.age) return;
    
    setIsLoading(true);
    
    // Simulate complex body composition analysis
    setTimeout(() => {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);
      
      // Calculate BMR using Mifflin-St Jeor equation
      const bmr = formData.gender === 'male' 
        ? (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) + 5
        : (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) - 161;
      
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = bmr * activityMultipliers[formData.activityLevel as keyof typeof activityMultipliers];
      const bmi = (weight / ((height * 0.0254) ** 2));
      const ffmi = weight * 0.453592 * (1 - 0.15) / ((height * 0.0254) ** 2); // Estimated FFMI
      
      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmi: bmi.toFixed(1),
        ffmi: ffmi.toFixed(1),
        bodyFatEstimate: formData.gender === 'male' ? '12-15%' : '16-20%',
        cuttingCalories: Math.round(tdee - 500),
        bulkingCalories: Math.round(tdee + 300),
        recommendations: [
          bmi < 18.5 ? 'Consider a lean bulk phase' : 
          bmi > 25 ? 'Consider a cutting phase' : 
          'Maintenance or body recomposition recommended',
          ffmi > 22 ? 'Excellent muscle development' : 
          ffmi > 20 ? 'Good muscle development' : 
          'Focus on muscle building',
          'Track progress photos and measurements weekly'
        ]
      });
      setIsLoading(false);
    }, 2000);
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
          <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CutCalc Pro</h1>
            <p className="text-gray-400">Advanced body composition analysis and cutting calculator</p>
          </div>
        </div>
      </div>

      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
        Calculations based on validated scientific formulas and research
      </Badge>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Body Composition Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your stats for comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Activity Level</Label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="sedentary">Sedentary (desk job)</option>
                  <option value="light">Lightly active (1-3 days/week)</option>
                  <option value="moderate">Moderately active (3-5 days/week)</option>
                  <option value="active">Very active (6-7 days/week)</option>
                  <option value="very_active">Extremely active (2x/day)</option>
                </select>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isLoading ? "Analyzing..." : "Calculate Body Composition"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
            <CardDescription className="text-gray-400">
              Science-based calculations and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-orange-400 text-sm font-medium">BMR</div>
                    <div className="text-white text-xl font-bold">{result.bmr} cal</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-orange-400 text-sm font-medium">TDEE</div>
                    <div className="text-white text-xl font-bold">{result.tdee} cal</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-orange-400 text-sm font-medium">BMI</div>
                    <div className="text-white text-xl font-bold">{result.bmi}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-orange-400 text-sm font-medium">FFMI</div>
                    <div className="text-white text-xl font-bold">{result.ffmi}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-green-400 text-sm font-medium">Cutting Calories</div>
                    <div className="text-white text-lg">{result.cuttingCalories} cal/day</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-blue-400 text-sm font-medium">Bulking Calories</div>
                    <div className="text-white text-lg">{result.bulkingCalories} cal/day</div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-orange-400 text-sm font-medium mb-2">Recommendations</div>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {result.recommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>*Calculations based on Mifflin-St Jeor equation and validated research</p>
                  <p>*Body fat estimates are approximate - consider DEXA scan for accuracy</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your information to get detailed body composition analysis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CutCalcPro;
