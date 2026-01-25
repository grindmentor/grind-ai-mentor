import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileHeader } from '@/components/MobileHeader';
import { Badge } from '@/components/ui/badge';
import { Flame, Activity, TrendingUp, TrendingDown, Target, Calculator, Sparkles } from 'lucide-react';
import { useUnitsPreference } from '@/hooks/useUnitsPreference';
import { RateLimitBadge } from '@/components/ui/rate-limit-badge';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TDEECalculatorProps {
  onBack?: () => void;
}

const TDEECalculator = ({ onBack }: TDEECalculatorProps) => {
  const navigate = useNavigate();
  const { units } = useUnitsPreference();
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [tdee, setTDEE] = useState<number | null>(null);
  const [bmr, setBMR] = useState<number | null>(null);

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
  };

  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentary',
    lightlyActive: 'Lightly Active',
    moderatelyActive: 'Moderately Active',
    veryActive: 'Very Active',
    extraActive: 'Extra Active',
  };

  // Check for returnTo state first, then fall back to onBack or history
  const handleBackNavigation = useCallback(() => {
    const state = (window.history.state?.usr as { returnTo?: string } | null);
    if (state?.returnTo) {
      navigate(state.returnTo);
    } else if (onBack) {
      onBack();
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/modules');
    }
  }, [onBack, navigate]);

  const handleRefresh = async () => {
    setTDEE(null);
    setBMR(null);
    setAge('');
    setWeight('');
    setHeight('');
  };

  const calculateTDEE = () => {
    // Validate all required fields
    if (!age?.trim() || !weight?.trim() || !height?.trim()) {
      return;
    }

    const parsedAge = parseFloat(age);
    let parsedWeight = parseFloat(weight);
    let parsedHeight = parseFloat(height);

    // Validate parsed values
    if (isNaN(parsedAge) || isNaN(parsedWeight) || isNaN(parsedHeight) ||
        parsedAge <= 0 || parsedWeight <= 0 || parsedHeight <= 0) {
      return;
    }

    // Convert to metric for calculation if needed
    if (units.weightUnit === 'lbs') {
      parsedWeight = parsedWeight / 2.20462;
    }
    // Handle both 'in' and 'ft-in' height units (user enters inches in both cases)
    if (units.heightUnit === 'in' || units.heightUnit === 'ft-in') {
      parsedHeight = parsedHeight * 2.54;
    }

    let bmrValue: number;
    if (gender === 'male') {
      bmrValue = 88.362 + (13.397 * parsedWeight) + (4.799 * parsedHeight) - (5.677 * parsedAge);
    } else {
      bmrValue = 447.593 + (9.247 * parsedWeight) + (3.098 * parsedHeight) - (4.330 * parsedAge);
    }

    const calculatedTDEE = bmrValue * activityMultipliers[activityLevel];
    
    // Set results - this will trigger the results section to render
    setTDEE(calculatedTDEE);
    setBMR(bmrValue);
    
    // Scroll to results after render completes
    requestAnimationFrame(() => {
      setTimeout(() => {
        const resultsSection = document.getElementById('tdee-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="TDEE Calculator"
        onBack={handleBackNavigation}
      />
      
      <PullToRefresh onRefresh={handleRefresh} skeletonVariant="card">
        <div className="px-4 pb-28">
          {/* Hero */}
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mb-3 border border-orange-500/20">
              <Flame className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">TDEE Calculator</h2>
            <p className="text-sm text-muted-foreground">Science-backed energy calculations</p>
            <div className="flex justify-center mt-3">
              <RateLimitBadge 
                featureKey="tdee_calculations" 
                featureName="TDEE calculations"
                showProgress
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Input Form */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground text-sm">Your Details</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger 
                        className="bg-muted/30 border-border h-11 rounded-xl"
                        aria-label="Select gender"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border rounded-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Age</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="bg-muted/30 border-border h-11 rounded-xl"
                      aria-label="Enter your age"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Weight ({units.weightUnit})</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={units.weightUnit === 'lbs' ? '165' : '75'}
                      className="bg-muted/30 border-border h-11 rounded-xl"
                      aria-label={`Enter weight in ${units.weightUnit}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Height ({units.heightUnit === 'ft-in' ? 'inches' : units.heightUnit})
                    </Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder={units.heightUnit === 'cm' ? '178' : '70'}
                      className="bg-muted/30 border-border h-11 rounded-xl"
                      aria-label={`Enter height in ${units.heightUnit === 'ft-in' ? 'inches' : units.heightUnit}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger 
                      className="bg-muted/30 border-border h-11 rounded-xl"
                      aria-label="Select activity level"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-xl">
                      <SelectItem value="sedentary">Sedentary (little exercise)</SelectItem>
                      <SelectItem value="lightlyActive">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderatelyActive">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="veryActive">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extraActive">Extra Active (physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={calculateTDEE}
                  disabled={!age || !weight || !height}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Calculate TDEE
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {tdee !== null && bmr !== null && (
              <div id="tdee-results" className="space-y-4 animate-fade-in">
                {/* Main Results */}
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground text-sm flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-orange-400" />
                        Your Results
                      </h3>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Calculated
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-background/50 rounded-xl">
                        <Activity className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                        <div className="text-2xl font-bold text-foreground">{bmr.toFixed(0)}</div>
                        <div className="text-[10px] text-muted-foreground">BMR (cal/day)</div>
                      </div>
                      <div className="text-center p-4 bg-background/50 rounded-xl">
                        <Flame className="w-5 h-5 mx-auto mb-2 text-orange-400" />
                        <div className="text-2xl font-bold text-foreground">{tdee.toFixed(0)}</div>
                        <div className="text-[10px] text-muted-foreground">TDEE (cal/day)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Goal Recommendations */}
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm flex items-center mb-4">
                      <Target className="w-4 h-4 mr-2 text-primary" />
                      Goal-Based Calories
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-foreground">Fat Loss</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{(tdee * 0.8).toFixed(0)} - {(tdee * 0.85).toFixed(0)}</div>
                          <div className="text-[10px] text-muted-foreground">15-20% deficit</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-foreground">Maintenance</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{(tdee * 0.95).toFixed(0)} - {(tdee * 1.05).toFixed(0)}</div>
                          <div className="text-[10px] text-muted-foreground">±5% of TDEE</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-foreground">Muscle Gain</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{(tdee * 1.1).toFixed(0)} - {(tdee * 1.15).toFixed(0)}</div>
                          <div className="text-[10px] text-muted-foreground">10-15% surplus</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Science Tips */}
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-3">💡 Science-Based Tips</h3>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Track weight daily, review weekly averages for accuracy
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        TDEE varies ±200-300 cal based on activity
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Adjust every 2-3 weeks based on progress
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Aim for 0.7-1g protein per lb bodyweight
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Reset Button */}
                <Button 
                  onClick={() => { setTDEE(null); setBMR(null); }}
                  variant="outline"
                  className="w-full h-11 rounded-xl border-border"
                >
                  Calculate Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default TDEECalculator;
