import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, ArrowLeft, Download, Save, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import UsageIndicator from '@/components/UsageIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TDEECalculatorProps {
  onBack: () => void;
}

interface TDEEResult {
  bmr: number;
  tdee: number;
  maintain: number;
  cut: number;
  bulk: number;
  ffmi?: number;
  bodyFatPercentage?: number;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    bodyFat: ''
  });
  
  const [results, setResults] = useState<TDEEResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activityLevels = [
    { value: '1.2', label: 'Sedentary (desk job, no exercise)' },
    { value: '1.375', label: 'Lightly active (light exercise 1-3 days/week)' },
    { value: '1.55', label: 'Moderately active (moderate exercise 3-5 days/week)' },
    { value: '1.725', label: 'Very active (hard exercise 6-7 days/week)' },
    { value: '1.9', label: 'Extremely active (physical job + exercise)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTDEE = async () => {
    if (!formData.age || !formData.gender || !formData.height || !formData.weight || !formData.activityLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!canUseFeature('tdee_calculations')) return;
    
    const success = await incrementUsage('tdee_calculations');
    if (!success) return;

    setIsLoading(true);

    try {
      const age = parseFloat(formData.age);
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);
      const activityMultiplier = parseFloat(formData.activityLevel);
      const bodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : null;

      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr: number;
      if (formData.gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      const tdee = bmr * activityMultiplier;
      
      // Calculate FFMI if body fat is provided
      let ffmi: number | undefined;
      if (bodyFat && bodyFat > 0 && bodyFat < 50) {
        const leanMass = weight * (1 - bodyFat / 100);
        const heightInMeters = height / 100;
        ffmi = leanMass / (heightInMeters * heightInMeters);
      }

      const calculatedResults: TDEEResult = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        maintain: Math.round(tdee),
        cut: Math.round(tdee - 500), // 500 calorie deficit
        bulk: Math.round(tdee + 300), // 300 calorie surplus
        ffmi: ffmi ? Math.round(ffmi * 10) / 10 : undefined,
        bodyFatPercentage: bodyFat || undefined
      };

      setResults(calculatedResults);
      
      // Save to database
      if (user) {
        await supabase.from('tdee_calculations').insert({
          user_id: user.id,
          age,
          gender: formData.gender,
          height,
          weight,
          activity_level: activityMultiplier,
          body_fat_percentage: bodyFat,
          bmr: calculatedResults.bmr,
          tdee: calculatedResults.tdee,
          ffmi: calculatedResults.ffmi
        });
      }

      toast.success('TDEE calculated successfully!');
    } catch (error) {
      console.error('Error calculating TDEE:', error);
      toast.error('Error calculating TDEE. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const resultText = `TDEE Calculation Results
=========================

Personal Information:
- Age: ${formData.age} years
- Gender: ${formData.gender}
- Height: ${formData.height} cm
- Weight: ${formData.weight} kg
- Activity Level: ${activityLevels.find(al => al.value === formData.activityLevel)?.label}
${formData.bodyFat ? `- Body Fat: ${formData.bodyFat}%` : ''}

Calculations:
- BMR (Basal Metabolic Rate): ${results.bmr} calories
- TDEE (Total Daily Energy Expenditure): ${results.tdee} calories

Calorie Goals:
- Maintain Weight: ${results.maintain} calories
- Cut (Weight Loss): ${results.cut} calories (-500 cal deficit)
- Bulk (Weight Gain): ${results.bulk} calories (+300 cal surplus)

${results.ffmi ? `Additional Metrics:
- FFMI (Fat-Free Mass Index): ${results.ffmi}
${results.ffmi < 16 ? '- FFMI Category: Below average' : 
  results.ffmi < 17 ? '- FFMI Category: Average' :
  results.ffmi < 18 ? '- FFMI Category: Above average' :
  results.ffmi < 20 ? '- FFMI Category: Excellent' :
  '- FFMI Category: Superior'}` : ''}

Generated on: ${new Date().toLocaleDateString()}
`;

    const element = document.createElement('a');
    const file = new Blob([resultText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'tdee-results.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Results downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-orange-200 hover:text-white hover:bg-orange-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-orange-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25 border border-orange-400/20">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-300 to-orange-100 bg-clip-text text-transparent">
                    TDEE & FFMI Calculator
                  </h1>
                  <p className="text-orange-200 text-lg">Calculate your daily energy needs and body composition</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="tdee_calculations" featureName="TDEE Calculations" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Using Mifflin-St Jeor equation for accuracy
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-orange-900/20 border-orange-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-orange-200">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="bg-orange-800/20 border-orange-600/50 text-white focus:border-orange-500 backdrop-blur-sm"
                      min="10"
                      max="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-orange-200">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="bg-orange-800/20 border-orange-600/50 text-white focus:border-orange-500 backdrop-blur-sm">
                        <SelectValue placeholder="Select gender" />
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
                    <Label htmlFor="height" className="text-orange-200">Height (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="bg-orange-800/20 border-orange-600/50 text-white focus:border-orange-500 backdrop-blur-sm"
                      min="100"
                      max="250"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-orange-200">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="bg-orange-800/20 border-orange-600/50 text-white focus:border-orange-500 backdrop-blur-sm"
                      min="30"
                      max="300"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity" className="text-orange-200">Activity Level *</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                    <SelectTrigger className="bg-orange-800/20 border-orange-600/50 text-white focus:border-orange-500 backdrop-blur-sm">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="text-orange-200">Body Fat % (Optional)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    placeholder="15"
                    value={formData.bodyFat}
                    onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                    className="bg-orange-800/20 border-orange-600/50 text-white focus:border-orange-500 backdrop-blur-sm"
                    min="5"
                    max="50"
                    step="0.1"
                  />
                </div>

                <Button 
                  onClick={calculateTDEE}
                  disabled={isLoading || !canUseFeature('tdee_calculations')}
                  className="w-full bg-gradient-to-r from-orange-500/80 to-orange-700/80 hover:from-orange-600/80 hover:to-orange-800/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 backdrop-blur-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate TDEE
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-orange-900/20 border-orange-600/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">Your Results</CardTitle>
                  {results && (
                    <Button
                      onClick={downloadResults}
                      variant="outline"
                      size="sm"
                      className="border-orange-600/50 text-orange-300 hover:bg-orange-800/50 hover:border-orange-500/50 backdrop-blur-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-6">
                    {/* Basic Calculations */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-800/20 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30">
                        <h3 className="text-orange-300 font-medium mb-2">BMR</h3>
                        <p className="text-2xl font-bold text-white">{results.bmr}</p>
                        <p className="text-sm text-orange-200">calories/day</p>
                      </div>
                      <div className="bg-orange-800/20 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30">
                        <h3 className="text-orange-300 font-medium mb-2">TDEE</h3>
                        <p className="text-2xl font-bold text-white">{results.tdee}</p>
                        <p className="text-sm text-orange-200">calories/day</p>
                      </div>
                    </div>

                    {/* Goal-based Calories - Only 3 options */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold text-lg">Calorie Goals</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-orange-800/20 backdrop-blur-sm rounded-xl border border-orange-600/30">
                          <div>
                            <h4 className="text-white font-medium">Maintain Weight</h4>
                            <p className="text-orange-200 text-sm">Current TDEE</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">{results.maintain}</p>
                            <p className="text-orange-200 text-sm">cal/day</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-orange-800/20 backdrop-blur-sm rounded-xl border border-orange-600/30">
                          <div>
                            <h4 className="text-white font-medium">Cut</h4>
                            <p className="text-orange-200 text-sm">500 cal deficit</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">{results.cut}</p>
                            <p className="text-orange-200 text-sm">cal/day</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-orange-800/20 backdrop-blur-sm rounded-xl border border-orange-600/30">
                          <div>
                            <h4 className="text-white font-medium">Bulk</h4>
                            <p className="text-orange-200 text-sm">300 cal surplus</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">{results.bulk}</p>
                            <p className="text-orange-200 text-sm">cal/day</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FFMI Results */}
                    {results.ffmi && (
                      <div className="space-y-4">
                        <h3 className="text-white font-semibold text-lg">Body Composition</h3>
                        <div className="bg-orange-800/20 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-white font-medium">FFMI (Fat-Free Mass Index)</h4>
                            <p className="text-xl font-bold text-white">{results.ffmi}</p>
                          </div>
                          <p className="text-orange-200 text-sm">
                            {results.ffmi < 16 ? 'Below average' : 
                             results.ffmi < 17 ? 'Average' :
                             results.ffmi < 18 ? 'Above average' :
                             results.ffmi < 20 ? 'Excellent' : 'Superior'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-orange-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Ready to Calculate</h3>
                    <p className="text-orange-200 text-sm">
                      Fill in your information to get your TDEE and calorie goals
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDEECalculator;
