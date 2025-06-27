
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, Target, Zap, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface TDEECalculatorProps {
  onBack: () => void;
}

interface TDEEResult {
  bmr: number;
  tdee: number;
  maintenance: number;
  mildDeficit: number;
  moderateDeficit: number;
  aggressiveDeficit: number;
  mildSurplus: number;
  moderateSurplus: number;
}

export const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    unit: 'imperial'
  });
  const [result, setResult] = useState<TDEEResult | null>(null);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateTDEE = useCallback(() => {
    const { age, gender, weight, height, activityLevel, unit } = formData;
    
    if (!age || !gender || !weight || !height || !activityLevel) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields to calculate your TDEE.',
        variant: 'destructive'
      });
      return;
    }

    let weightKg = parseFloat(weight);
    let heightCm = parseFloat(height);

    if (unit === 'imperial') {
      weightKg = weightKg * 0.453592; // lbs to kg
      heightCm = heightCm * 2.54; // inches to cm
    }

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * parseFloat(age)) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * parseFloat(age)) - 161;
    }

    // Activity multipliers
    const activityMultipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'super-active': 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    const calculatedResult: TDEEResult = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      maintenance: Math.round(tdee),
      mildDeficit: Math.round(tdee - 250),
      moderateDeficit: Math.round(tdee - 500),
      aggressiveDeficit: Math.round(tdee - 750),
      mildSurplus: Math.round(tdee + 250),
      moderateSurplus: Math.round(tdee + 500)
    };

    setResult(calculatedResult);

    // Save to user profile if authenticated
    if (user) {
      supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          tdee_data: calculatedResult,
          last_tdee_calculation: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error saving TDEE data:', error);
          }
        });
    }
  }, [formData, toast, user]);

  const getActivityDescription = (level: string) => {
    const descriptions: { [key: string]: string } = {
      'sedentary': 'Little to no exercise',
      'lightly-active': 'Light exercise 1-3 days/week',
      'moderately-active': 'Moderate exercise 3-5 days/week',
      'very-active': 'Heavy exercise 6-7 days/week',
      'super-active': 'Very heavy exercise, physical job'
    };
    return descriptions[level] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
      {isMobile ? (
        <MobileHeader title="TDEE Calculator" onBack={onBack} />
      ) : (
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="default"
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-white">TDEE Calculator</h1>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
                  <Calculator className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">TDEE Calculator</CardTitle>
                  <CardDescription className="text-green-200/80 text-sm sm:text-base">
                    Calculate your Total Daily Energy Expenditure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age" className="text-green-200 text-sm">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="25"
                    className="bg-green-900/30 border-green-500/50 text-white text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-green-200 text-sm">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="bg-green-900/30 border-green-500/50 text-white text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-green-500/40">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="unit" className="text-green-200 text-sm">Units</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger className="bg-green-900/30 border-green-500/50 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-green-500/40">
                    <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                    <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="weight" className="text-green-200 text-sm">
                    Weight ({formData.unit === 'imperial' ? 'lbs' : 'kg'})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder={formData.unit === 'imperial' ? '180' : '82'}
                    className="bg-green-900/30 border-green-500/50 text-white text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-green-200 text-sm">
                    Height ({formData.unit === 'imperial' ? 'inches' : 'cm'})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder={formData.unit === 'imperial' ? '70' : '178'}
                    className="bg-green-900/30 border-green-500/50 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activity" className="text-green-200 text-sm">Activity Level</Label>
                <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                  <SelectTrigger className="bg-green-900/30 border-green-500/50 text-white text-sm">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-green-500/40">
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="lightly-active">Lightly Active</SelectItem>
                    <SelectItem value="moderately-active">Moderately Active</SelectItem>
                    <SelectItem value="very-active">Very Active</SelectItem>
                    <SelectItem value="super-active">Super Active</SelectItem>
                  </SelectContent>
                </Select>
                {formData.activityLevel && (
                  <p className="text-xs text-green-300/70 mt-1">
                    {getActivityDescription(formData.activityLevel)}
                  </p>
                )}
              </div>

              <Button
                onClick={calculateTDEE}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm"
              >
                <Target className="w-4 h-4 mr-2" />
                Calculate TDEE
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">Your Results</CardTitle>
                  <CardDescription className="text-green-200/80 text-sm sm:text-base">
                    Daily calorie targets for your goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-800/30 rounded-lg border border-green-500/30">
                      <p className="text-green-300 text-xs font-medium">BMR</p>
                      <p className="text-white text-lg font-bold">{result.bmr}</p>
                      <p className="text-green-400 text-xs">cal/day</p>
                    </div>
                    <div className="text-center p-3 bg-green-800/30 rounded-lg border border-green-500/30">
                      <p className="text-green-300 text-xs font-medium">TDEE</p>
                      <p className="text-white text-lg font-bold">{result.tdee}</p>
                      <p className="text-green-400 text-xs">cal/day</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-green-200 font-semibold text-sm">Fat Loss Goals</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-red-900/20 rounded border border-red-500/30">
                        <span className="text-red-200 text-sm">Mild Deficit (0.5 lb/week)</span>
                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                          {result.mildDeficit} cal
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-900/20 rounded border border-red-500/30">
                        <span className="text-red-200 text-sm">Moderate Deficit (1 lb/week)</span>
                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                          {result.moderateDeficit} cal
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-900/20 rounded border border-red-500/30">
                        <span className="text-red-200 text-sm">Aggressive Deficit (1.5 lb/week)</span>
                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                          {result.aggressiveDeficit} cal
                        </Badge>
                      </div>
                    </div>

                    <h3 className="text-green-200 font-semibold text-sm pt-3">Muscle Gain Goals</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-blue-900/20 rounded border border-blue-500/30">
                        <span className="text-blue-200 text-sm">Lean Bulk (0.5 lb/week)</span>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                          {result.mildSurplus} cal
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-900/20 rounded border border-blue-500/30">
                        <span className="text-blue-200 text-sm">Moderate Bulk (1 lb/week)</span>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                          {result.moderateSurplus} cal
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-200 mb-2">Ready to Calculate</h3>
                  <p className="text-green-300/70 text-sm">
                    Fill out the form to get your personalized TDEE and calorie targets
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
