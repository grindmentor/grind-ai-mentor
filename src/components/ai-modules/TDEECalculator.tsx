
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Flame, User2, HeartHandshake, Activity, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useUnitsPreference } from '@/hooks/useUnitsPreference';
import { RateLimitBadge, RateLimitWarning } from '@/components/ui/rate-limit-badge';

interface ActivityLevel {
  value: string;
  label: string;
  multiplier: number;
}

interface Gender {
  value: string;
  label: string;
}

interface TDEECalculatorProps {
  onBack?: () => void;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const isMobile = useIsMobile();
  const { units, formatWeight, formatHeight } = useUnitsPreference();
  const [gender, setGender] = useState<Gender>({ value: 'male', label: 'Male' });
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>({
    value: 'sedentary',
    label: 'Sedentary (little or no exercise)',
    multiplier: 1.2
  });
  const [tdee, setTDEE] = useState<number | null>(null);
  const [bmr, setBMR] = useState<number | null>(null);

  const genders: Gender[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const activityLevels: ActivityLevel[] = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
    { value: 'lightlyActive', label: 'Lightly Active (light exercise/sports 1-3 days/week)', multiplier: 1.375 },
    { value: 'moderatelyActive', label: 'Moderately Active (moderate exercise/sports 3-5 days/week)', multiplier: 1.55 },
    { value: 'veryActive', label: 'Very Active (hard exercise/sports 6-7 days a week)', multiplier: 1.725 },
    { value: 'extraActive', label: 'Extra Active (very hard exercise/sports & physical job)', multiplier: 1.9 },
  ];

  const calculateTDEE = () => {
    if (!gender || !age || !weight || !height || !activityLevel) {
      alert('Please fill in all fields.');
      return;
    }

    const parsedAge = parseFloat(age);
    let parsedWeight = parseFloat(weight);
    let parsedHeight = parseFloat(height);

    if (isNaN(parsedAge) || isNaN(parsedWeight) || isNaN(parsedHeight)) {
      alert('Please enter valid numbers for age, weight, and height.');
      return;
    }

    // Convert to metric for calculation if needed
    if (units.weightUnit === 'lbs') {
      parsedWeight = parsedWeight / 2.20462; // Convert to kg
    }
    if (units.heightUnit === 'in') {
      parsedHeight = parsedHeight * 2.54; // Convert to cm
    }

    let bmrValue: number;
    if (gender.value === 'male') {
      bmrValue = 88.362 + (13.397 * parsedWeight) + (4.799 * parsedHeight) - (5.677 * parsedAge);
    } else {
      bmrValue = 447.593 + (9.247 * parsedWeight) + (3.098 * parsedHeight) - (4.330 * parsedAge);
    }

    const calculatedTDEE = bmrValue * activityLevel.multiplier;
    setTDEE(calculatedTDEE);
    setBMR(bmrValue);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-purple-800/20">
      <MobileHeader
        title="TDEE Calculator"
        onBack={handleBack}
      />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/30 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Flame className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">TDEE Calculator</CardTitle>
                  <CardDescription className="text-purple-200/80">
                    Calculate your Total Daily Energy Expenditure with science-based insights
                  </CardDescription>
                </div>
              </div>
              <RateLimitBadge 
                featureKey="tdee_calculations" 
                featureName="TDEE calculations"
                showProgress
              />
            </div>
            <RateLimitWarning 
              featureKey="tdee_calculations" 
              featureName="TDEE Calculator" 
            />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-200">Gender</Label>
                <Select value={gender.value} onValueChange={(value) => {
                  const selectedGender = genders.find(g => g.value === value);
                  if (selectedGender) {
                    setGender(selectedGender);
                  }
                }}>
                  <SelectTrigger className="bg-purple-900/30 border-purple-500/50 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-700 text-white">
                    {genders.map((g) => (
                      <SelectItem key={g.value} value={g.value} className="text-white hover:bg-purple-700">
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-purple-200">Age</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter age"
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-200">Weight ({units.weightUnit})</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={`Enter weight in ${units.weightUnit}`}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300/50"
                />
              </div>

              <div>
                <Label className="text-purple-200">Height ({units.heightUnit})</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={`Enter height in ${units.heightUnit}`}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300/50"
                />
              </div>
            </div>

            <div>
              <Label className="text-purple-200">Activity Level</Label>
              <Select value={activityLevel.value} onValueChange={(value) => {
                const selectedActivityLevel = activityLevels.find(level => level.value === value);
                if (selectedActivityLevel) {
                  setActivityLevel(selectedActivityLevel);
                }
              }}>
                <SelectTrigger className="bg-purple-900/30 border-purple-500/50 text-white">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent className="bg-purple-800 border-purple-700 text-white">
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value} className="text-white hover:bg-purple-700">
                    {level.label}
                  </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calculateTDEE}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-3"
            >
              <Flame className="w-4 h-4 mr-2" />
              Calculate TDEE
            </Button>

            {tdee !== null && bmr !== null && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-300">BMR (Base Metabolic Rate)</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{bmr.toFixed(0)} calories/day</p>
                    <p className="text-purple-200/80 text-sm">Calories burned at complete rest</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flame className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-300">TDEE</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{tdee.toFixed(0)} calories/day</p>
                    <p className="text-purple-200/80 text-sm">Total daily energy expenditure</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Goal-Based Recommendations
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <h4 className="font-medium text-red-300">Fat Loss (Cutting)</h4>
                      <p className="text-white font-bold">{(tdee * 0.8).toFixed(0)} - {(tdee * 0.85).toFixed(0)}</p>
                      <p className="text-red-200/80 text-xs">15-20% deficit</p>
                    </div>
                    
                    <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <h4 className="font-medium text-green-300">Maintenance</h4>
                      <p className="text-white font-bold">{(tdee * 0.95).toFixed(0)} - {(tdee * 1.05).toFixed(0)}</p>
                      <p className="text-green-200/80 text-xs">±5% of TDEE</p>
                    </div>
                    
                    <div className="text-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-300">Muscle Gain (Bulking)</h4>
                      <p className="text-white font-bold">{(tdee * 1.1).toFixed(0)} - {(tdee * 1.15).toFixed(0)}</p>
                      <p className="text-blue-200/80 text-xs">10-15% surplus</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                  <h4 className="text-purple-300 font-medium mb-2">💡 Science-Based Tips</h4>
                  <ul className="text-sm text-purple-200 space-y-1">
                    <li>• Track weight daily, look at weekly averages for accurate progress</li>
                    <li>• TDEE can vary ±200-300 calories day-to-day based on activity and metabolism</li>
                    <li>• Adjust calories every 2-3 weeks based on progress and hunger levels</li>
                    <li>• Focus on whole foods and adequate protein (0.8-1g per lb bodyweight)</li>
                    <li>• Include resistance training to preserve muscle during cuts</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                  <h4 className="text-purple-300 font-medium mb-2">📊 Fat Loss Projection Example</h4>
                  <div className="text-sm text-purple-200 space-y-1">
                    <p><strong>20% deficit:</strong> {((tdee - (tdee * 0.8)) * 7 / 3500).toFixed(1)} lbs fat loss per week</p>
                    <p><strong>15% deficit:</strong> {((tdee - (tdee * 0.85)) * 7 / 3500).toFixed(1)} lbs fat loss per week</p>
                    <p className="text-purple-300/80 text-xs mt-2">*Based on 3500 calories = 1 lb fat. Actual results may vary.</p>
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

export default TDEECalculator;
