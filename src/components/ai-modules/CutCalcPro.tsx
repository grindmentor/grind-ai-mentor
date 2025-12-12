import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, TrendingDown, Target, Calendar, Zap, Flame, Scale, Activity } from "lucide-react";
import { useState } from "react";
import { useUnitsPreference } from "@/hooks/useUnitsPreference";
import { MobileHeader } from "@/components/MobileHeader";
import { cn } from "@/lib/utils";

interface CutCalcProProps {
  onBack: () => void;
}

const CutCalcPro = ({ onBack }: CutCalcProProps) => {
  const { units } = useUnitsPreference();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [duration, setDuration] = useState("12");
  const [activityLevel, setActivityLevel] = useState("");
  const [goals, setGoals] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateCut = async () => {
    if (!age || !gender || !height || !currentWeight || !activityLevel) {
      return;
    }

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    let current = parseFloat(currentWeight);
    let target = targetWeight ? parseFloat(targetWeight) : current * 0.9;
    const durationWeeks = parseFloat(duration);
    let parsedAge = parseFloat(age);
    let parsedHeight = parseFloat(height);
    
    // Convert to metric for calculation if needed
    if (units.weightUnit === 'lbs') {
      current = current / 2.20462;
      target = target / 2.20462;
    }
    if (units.heightUnit === 'in') {
      parsedHeight = parsedHeight * 2.54;
    }
    
    const totalWeightLoss = current - target;
    const weeklyDeficit = totalWeightLoss / durationWeeks;
    
    // Enhanced BMR calculation using Mifflin-St Jeor equation
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * current) + (6.25 * parsedHeight) - (5 * parsedAge) + 5;
    } else {
      bmr = (10 * current) + (6.25 * parsedHeight) - (5 * parsedAge) - 161;
    }
    
    const activityMultipliers: { [key: string]: number } = {
      "sedentary": 1.2,
      "light": 1.375,
      "moderate": 1.55,
      "active": 1.725,
      "very_active": 1.9
    };
    
    const estimatedTDEE = bmr * activityMultipliers[activityLevel];
    const dailyDeficit = (weeklyDeficit * 3500) / 7;
    const targetCalories = Math.round(estimatedTDEE - dailyDeficit);
    
    // Convert back to display units
    let displayCurrent = parseFloat(currentWeight);
    let displayTarget = targetWeight ? parseFloat(targetWeight) : displayCurrent * 0.9;
    let displayLoss = displayCurrent - displayTarget;
    
    // Calculate macro recommendations
    const proteinGrams = Math.round(current * 2.2); // 1g per lb lean mass approx
    const fatGrams = Math.round(targetCalories * 0.25 / 9);
    const carbGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);
    
    const calculatedResults = {
      currentWeight: displayCurrent,
      targetWeight: displayTarget,
      totalLoss: displayLoss,
      weeksToGoal: durationWeeks,
      estimatedTDEE: Math.round(estimatedTDEE),
      targetCalories,
      dailyDeficit: Math.round(dailyDeficit),
      weeklyDeficit: weeklyDeficit,
      targetDate: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      weightUnit: units.weightUnit,
      bmr: Math.round(bmr),
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbGrams
    };
    
    setResults(calculatedResults);
    setIsCalculating(false);
  };

  const MetricCard = ({ icon: Icon, label, value, unit, color }: { icon: any; label: string; value: string | number; unit?: string; color: string }) => (
    <div className="bg-card/50 rounded-xl p-4 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="CutCalc Pro" onBack={onBack} />
      
      <div className="px-4 pb-28">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-3 border border-rose-500/20">
            <TrendingDown className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Cutting Calculator</h2>
          <p className="text-sm text-muted-foreground">Science-based calorie calculations</p>
        </div>
        
        {!results ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Age *</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-11 bg-muted/30 border-border rounded-xl"
                    aria-label="Your age"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Gender *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl" aria-label="Select gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Height ({units.heightUnit}) *</Label>
                  <Input
                    type="number"
                    placeholder={units.heightUnit === 'cm' ? "175" : "69"}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-11 bg-muted/30 border-border rounded-xl"
                    aria-label="Your height"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Current ({units.weightUnit}) *</Label>
                  <Input
                    type="number"
                    placeholder={units.weightUnit === 'kg' ? "80" : "180"}
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="h-11 bg-muted/30 border-border rounded-xl"
                    aria-label="Current weight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Target ({units.weightUnit})</Label>
                  <Input
                    type="number"
                    placeholder={units.weightUnit === 'kg' ? "75" : "165"}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="h-11 bg-muted/30 border-border rounded-xl"
                    aria-label="Target weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Weeks</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-11 bg-muted/30 border-border rounded-xl"
                    aria-label="Duration in weeks"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Activity Level *</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl" aria-label="Activity level">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (2x/day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Notes (Optional)</Label>
                <Textarea
                  placeholder="e.g., Timeline goals, maintain strength..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="bg-muted/30 border-border rounded-xl min-h-[80px] resize-none"
                  aria-label="Additional notes"
                />
              </div>

              <Button 
                onClick={calculateCut}
                disabled={!age || !gender || !height || !currentWeight || !activityLevel || isCalculating}
                className="w-full h-12 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-xl text-sm font-medium"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-2xl p-4 border border-rose-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Your Cutting Plan</h3>
                  <p className="text-xs text-muted-foreground">Target: {results.targetDate}</p>
                </div>
                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                  {results.weeksToGoal} weeks
                </Badge>
              </div>
              
              {/* Progress Visual */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress Goal</span>
                  <span className="text-foreground font-medium">
                    {results.currentWeight} → {results.targetWeight.toFixed(1)} {results.weightUnit}
                  </span>
                </div>
                <Progress value={0} className="h-2 bg-muted" />
                <p className="text-xs text-center text-muted-foreground">
                  -{results.totalLoss.toFixed(1)} {results.weightUnit} total
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard 
                icon={Flame} 
                label="Daily Target" 
                value={results.targetCalories} 
                unit="cal"
                color="bg-gradient-to-br from-orange-500 to-red-500"
              />
              <MetricCard 
                icon={TrendingDown} 
                label="Daily Deficit" 
                value={`-${results.dailyDeficit}`} 
                unit="cal"
                color="bg-gradient-to-br from-rose-500 to-pink-500"
              />
              <MetricCard 
                icon={Activity} 
                label="Your TDEE" 
                value={results.estimatedTDEE} 
                unit="cal"
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <MetricCard 
                icon={Scale} 
                label="Weekly Loss" 
                value={results.weeklyDeficit.toFixed(1)} 
                unit={results.weightUnit}
                color="bg-gradient-to-br from-purple-500 to-violet-500"
              />
            </div>

            {/* Macro Targets */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm">
                  <Zap className="w-4 h-4 mr-2 text-amber-400" />
                  Daily Macro Targets
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-lg font-bold text-blue-400">{results.protein}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="text-lg font-bold text-amber-400">{results.carbs}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <div className="text-lg font-bold text-rose-400">{results.fat}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3 text-sm">💡 Pro Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Track weight daily, look at weekly averages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Prioritize protein (0.8-1g per {units.weightUnit === 'kg' ? 'kg' : 'lb'})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Include resistance training to preserve muscle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Adjust calories if progress stalls for 2+ weeks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* New Calculation Button */}
            <Button 
              onClick={() => setResults(null)}
              variant="outline"
              className="w-full h-11 rounded-xl border-border"
            >
              Calculate New Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutCalcPro;
