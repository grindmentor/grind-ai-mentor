import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Flame, User2, HeartHandshake, Activity } from 'lucide-react';
import { useUnitsPreference } from '@/hooks/useUnitsPreference';

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

    let bmr: number;
    if (gender.value === 'male') {
      bmr = 88.362 + (13.397 * parsedWeight) + (4.799 * parsedHeight) - (5.677 * parsedAge);
    } else {
      bmr = 447.593 + (9.247 * parsedWeight) + (3.098 * parsedHeight) - (4.330 * parsedAge);
    }

    const calculatedTDEE = bmr * activityLevel.multiplier;
    setTDEE(calculatedTDEE);
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                <Flame className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">TDEE Calculator</CardTitle>
                <CardDescription className="text-purple-200/80">
                  Calculate your Total Daily Energy Expenditure
                </CardDescription>
              </div>
            </div>
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
              Calculate TDEE
            </Button>

            {tdee !== null && (
              <div className="mt-4 p-4 rounded-md bg-purple-900/20 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-300">Results</h3>
                <p className="text-white">
                  Your estimated TDEE is: <span className="font-bold text-purple-200">{tdee.toFixed(2)} calories/day</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDEECalculator;
