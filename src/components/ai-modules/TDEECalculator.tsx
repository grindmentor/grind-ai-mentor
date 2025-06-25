import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

const TDEECalculator = () => {
  const { user } = useAuth();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'>('sedentary');
  const [goal, setGoal] = useState<'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_fitness' | 'cut' | 'bulk' | 'recomp'>('maintain_weight');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | null>(null);
  const [results, setResults] = useState<{ bmr: number; tdee: number; recommendedCalories: number } | null>(null);

  const calculateTDEE = () => {
    if (!weight || !height || !age) {
      toast.error('Please fill in all required fields');
      return;
    }

    let bmr: number;
    
    // Use Katch-McArdle formula if body fat is provided (more accurate)
    if (bodyFatPercentage && bodyFatPercentage > 0 && bodyFatPercentage < 50) {
      const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
      bmr = 370 + (21.6 * leanBodyMass);
    } else {
      // Use Mifflin-St Jeor equation as fallback
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
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
    if (!user || !age || !weight || !height) return;

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
          age,
          weight,
          height,
          goal
        });

      if (error) {
        console.error('Error saving TDEE calculation:', error);
        toast.error('Failed to save TDEE calculation');
      } else {
        toast.success('TDEE calculation saved!');
      }
    } catch (error) {
      console.error('Error saving TDEE calculation:', error);
      toast.error('Failed to save TDEE calculation');
    }
  };

  const handleReset = () => {
    setGender('male');
    setAge(null);
    setWeight(null);
    setHeight(null);
    setActivityLevel('sedentary');
    setGoal('maintain_weight');
    setBodyFatPercentage(null);
    setResults(null);
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-white">TDEE Calculator</h2>
        <p className="text-muted-foreground">Calculate your Total Daily Energy Expenditure (TDEE)</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Personal Information</CardTitle>
          <CardDescription>Enter your details for accurate calculations</CardDescription>
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

          <div>
            <Label htmlFor="age" className="text-foreground">Age (years)</Label>
            <Input
              id="age"
              type="number"
              placeholder="e.g., 30"
              value={age || ''}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-input border-border text-foreground"
              min="15"
              max="90"
            />
          </div>

          <div>
            <Label htmlFor="weight" className="text-foreground">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 75"
              value={weight || ''}
              onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-input border-border text-foreground"
              min="30"
              max="250"
            />
          </div>

          <div>
            <Label htmlFor="height" className="text-foreground">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="e.g., 180"
              value={height || ''}
              onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-input border-border text-foreground"
              min="120"
              max="250"
            />
          </div>
          
          <div>
            <Label htmlFor="bodyFat" className="text-foreground">
              Body Fat Percentage (optional)
            </Label>
            <Input
              id="bodyFat"
              type="number"
              placeholder="e.g., 15"
              value={bodyFatPercentage || ''}
              onChange={(e) => setBodyFatPercentage(e.target.value ? parseFloat(e.target.value) : null)}
              className="bg-input border-border text-foreground"
              min="5"
              max="45"
              step="0.1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Providing body fat % enables more accurate calculations using the Katch-McArdle formula
            </p>
          </div>

          <div>
            <Label htmlFor="activity" className="text-foreground">Activity Level</Label>
            <Select value={activityLevel} onValueChange={(value) => setActivityLevel(value as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active')}>
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
            <Select value={goal} onValueChange={(value) => setGoal(value as 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle' | 'improve_fitness' | 'cut' | 'bulk' | 'recomp')}>
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
