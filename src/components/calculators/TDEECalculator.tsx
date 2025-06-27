
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calculator } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface TDEECalculatorProps {
  onBack: () => void;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onBack }) => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [activity, setActivity] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculateTDEE = () => {
    if (!age || !weight || !height || !gender || !activity) return;

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
    }

    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityMultipliers[activity];
    setResult(Math.round(tdee));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-amber-950/50 to-amber-900/30">
      <MobileHeader title="TDEE Calculator" onBack={onBack} />
      
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/30 backdrop-blur-sm border-amber-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500/30 to-yellow-500/40 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Calculator className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">TDEE Calculator</CardTitle>
                <CardDescription className="text-amber-200/80">
                  Calculate your Total Daily Energy Expenditure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-amber-200">Age</Label>
                <Input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  type="number"
                  className="bg-amber-900/30 border-amber-500/50 text-white placeholder:text-amber-200/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-amber-200">Weight (kg)</Label>
                <Input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  type="number"
                  className="bg-amber-900/30 border-amber-500/50 text-white placeholder:text-amber-200/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-amber-200">Height (cm)</Label>
                <Input
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  type="number"
                  className="bg-amber-900/30 border-amber-500/50 text-white placeholder:text-amber-200/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-amber-200">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-amber-900/30 border-amber-500/50 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-900 border-amber-500">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200">Activity Level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="bg-amber-900/30 border-amber-500/50 text-white">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent className="bg-amber-900 border-amber-500">
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (very hard exercise/physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateTDEE}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
            >
              Calculate TDEE
            </Button>

            {result && (
              <div className="mt-6 p-4 bg-amber-800/30 border border-amber-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-200 mb-2">Your TDEE Result</h3>
                <p className="text-2xl font-bold text-white">{result} calories/day</p>
                <p className="text-amber-200/80 text-sm mt-2">
                  This is your estimated daily calorie needs to maintain your current weight.
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
