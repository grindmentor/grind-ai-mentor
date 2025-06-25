
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useSmartUserData } from '@/hooks/useSmartUserData';
import { SmartInput } from '@/components/ui/smart-input';

interface TDEECalculatorProps {
  onBack: () => void;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const { user } = useAuth();
  const { smartData, getPrefillData, refreshData } = useSmartUserData();
  
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'>('sedentary');
  const [goal, setGoal] = useState<'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_fitness' | 'cut' | 'bulk' | 'recomp'>('maintain_weight');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [results, setResults] = useState<{ bmr: number; tdee: number; recommendedCalories: number } | null>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);

  // Get prefill data
  const prefillData = getPrefillData({ includePersonal: true, includeFitness: true });

  // Auto-prefill when component loads and data is available
  useEffect(() => {
    if (smartData && !prefillApplied) {
      if (prefillData.age && !age) setAge(String(prefillData.age));
      if (prefillData.weight && !weight) setWeight(String(prefillData.weight));
      if (prefillData.height && !height) setHeight(String(prefillData.height));
      if (prefillData.gender && gender === 'male') setGender(prefillData.gender as 'male' | 'female');
      if (prefillData.activityLevel && activityLevel === 'sedentary') {
        setActivityLevel(prefillData.activityLevel as any);
      }
      if (prefillData.fitnessGoals && goal === 'maintain_weight') {
        setGoal(prefillData.fitnessGoals as any);
      }
      if (prefillData.bodyFatPercentage && !bodyFatPercentage) {
        setBodyFatPercentage(String(prefillData.bodyFatPercentage));
      }
      setPrefillApplied(true);
    }
  }, [smartData, prefillData, prefillApplied]);

  const calculateTDEE = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);
    
    if (!weightNum || !heightNum || !ageNum) {
      toast.error('Please fill in all required fields');
      return;
    }

    let bmr: number;
    
    // Use Katch-McArdle formula if body fat is provided (more accurate)
    const bodyFatNum = parseFloat(bodyFatPercentage);
    if (bodyFatNum && bodyFatNum > 0 && bodyFatNum < 50) {
      const leanBodyMass = weightNum * (1 - bodyFatNum / 100);
      bmr = 370 + (21.6 * leanBodyMass);
    } else {
      // Use Mifflin-St Jeor equation as fallback
      if (gender === 'male') {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel];
    
    let recommendedCalories = tdee;
    if (goal === 'lose_weight' || goal === 'cut') {
      recommendedCalories = tdee * 0.8; // 20% deficit
    } else if (goal === 'gain_weight' || goal === 'bulk') {
      recommendedCalories = tdee * 1.1; // 10% surplus
    }

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedCalories: Math.round(recommendedCalories)
    });

    // Save to database
    saveTDEECalculation(bmr, tdee, recommendedCalories);
  };

  const saveTDEECalculation = async (bmr: number, tdee: number, recommendedCalories: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tdee_calculations')
        .insert({
          user_id: user.id,
          bmr,
          tdee,
          recommended_calories: recommendedCalories,
          activity_level: activityLevel,
          gender,
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          goal
        });

      if (error) {
        console.error('Error saving TDEE calculation:', error);
        toast.error('Failed to save TDEE calculation');
      } else {
        toast.success('TDEE calculation saved!');
        // Refresh smart data to include new calculation
        setTimeout(() => refreshData(), 500);
      }
    } catch (error) {
      console.error('Error saving TDEE calculation:', error);
      toast.error('Failed to save TDEE calculation');
    }
  };

  const handleReset = () => {
    setGender('male');
    setAge('');
    setWeight('');
    setHeight('');
    setActivityLevel('sedentary');
    setGoal('maintain_weight');
    setBodyFatPercentage('');
    setResults(null);
    setPrefillApplied(false);
  };

  const handleSmartFill = () => {
    if (prefillData.age) setAge(String(prefillData.age));
    if (prefillData.weight) setWeight(String(prefillData.weight));
    if (prefillData.height) setHeight(String(prefillData.height));
    if (prefillData.gender) setGender(prefillData.gender as 'male' | 'female');
    if (prefillData.activityLevel) setActivityLevel(prefillData.activityLevel as any);
    if (prefillData.fitnessGoals) setGoal(prefillData.fitnessGoals as any);
    if (prefillData.bodyFatPercentage) setBodyFatPercentage(String(prefillData.bodyFatPercentage));
    
    toast.success('Form pre-filled with your saved data!');
  };

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
    { value: 'lightly_active', label: 'Lightly Active (1-3 days/week)' },
    { value: 'moderately_active', label: 'Moderately Active (3-5 days/week)' },
    { value: 'very_active', label: 'Very Active (6-7 days/week)' },
    { value: 'extremely_active', label: 'Extremely Active (2x/day)' }
  ];

  const goalOptions = [
    { value: 'lose_weight', label: 'Lose Weight' },
    { value: 'maintain_weight', label: 'Maintain Weight' },
    { value: 'gain_weight', label: 'Gain Weight' },
    { value: 'build_muscle', label: 'Build Muscle' },
    { value: 'improve_fitness', label: 'Improve Fitness' },
    { value: 'cut', label: 'Cut (lose fat, keep muscle)' },
    { value: 'bulk', label: 'Bulk (gain muscle)' },
    { value: 'recomp', label: 'Recomp (lose fat, gain muscle)' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">TDEE Calculator</h1>
            <p className="text-gray-400">Calculate your Total Daily Energy Expenditure</p>
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Personal Information</CardTitle>
              <CardDescription>Enter your details for accurate calculations</CardDescription>
            </div>
            {smartData && Object.keys(prefillData).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSmartFill}
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Fill
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gender" className="text-foreground">Gender</Label>
            <Select value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SmartInput
            label="Age (years)"
            value={age}
            onChange={setAge}
            prefillValue={prefillData.age}
            type="number"
            placeholder="e.g., 30"
          />

          <SmartInput
            label={`Weight (${smartData?.weightUnit || 'kg'})`}
            value={weight}
            onChange={setWeight}
            prefillValue={prefillData.weight}
            type="number"
            placeholder="e.g., 75"
          />

          <SmartInput
            label={`Height (${smartData?.heightUnit === 'ft-in' ? 'inches' : smartData?.heightUnit || 'cm'})`}
            value={height}
            onChange={setHeight}
            prefillValue={prefillData.height}
            type="number"
            placeholder="e.g., 180"
          />
          
          <SmartInput
            label="Body Fat Percentage (optional)"
            value={bodyFatPercentage}
            onChange={setBodyFatPercentage}
            prefillValue={prefillData.bodyFatPercentage}
            type="number"
            placeholder="e.g., 15"
          />

          <div>
            <Label htmlFor="activity" className="text-foreground">Activity Level</Label>
            <Select value={activityLevel} onValueChange={(value) => setActivityLevel(value as any)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {activityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="goal" className="text-foreground">Fitness Goal</Label>
            <Select value={goal} onValueChange={(value) => setGoal(value as any)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select fitness goal" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {goalOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={calculateTDEE} 
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            disabled={!weight || !height || !age}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate TDEE
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Results</CardTitle>
            <CardDescription>Your estimated daily energy expenditure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Basal Metabolic Rate (BMR)</h3>
                <p className="text-muted-foreground">
                  {results.bmr} calories/day
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Total Daily Energy Expenditure (TDEE)</h3>
                <p className="text-muted-foreground">
                  {results.tdee} calories/day
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recommended Daily Calories</h3>
              <p className="text-muted-foreground">
                {results.recommendedCalories} calories/day
              </p>
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full border-border hover:bg-accent text-foreground">
              Reset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TDEECalculator;
