
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Scissors } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface CutCalcProps {
  onBack: () => void;
}

const CutCalc: React.FC<CutCalcProps> = ({ onBack }) => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [tdee, setTdee] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateCut = () => {
    if (!currentWeight || !targetWeight || !tdee) return;

    const currentWeightNum = parseFloat(currentWeight);
    const targetWeightNum = parseFloat(targetWeight);
    const tdeeNum = parseFloat(tdee);

    const weightToLose = currentWeightNum - targetWeightNum;
    const caloriesPerKg = 7700; // Approximate calories per kg of fat
    const totalCaloriesDeficit = weightToLose * caloriesPerKg;

    // Calculate different deficit scenarios
    const scenarios = [
      { deficit: 250, label: 'Conservative (0.25kg/week)' },
      { deficit: 500, label: 'Moderate (0.5kg/week)' },
      { deficit: 750, label: 'Aggressive (0.75kg/week)' }
    ];

    const results = scenarios.map(scenario => ({
      ...scenario,
      dailyCalories: tdeeNum - scenario.deficit,
      weeksToGoal: Math.ceil(totalCaloriesDeficit / (scenario.deficit * 7))
    }));

    setResult({
      weightToLose,
      totalCaloriesDeficit,
      scenarios: results
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950/50 to-red-900/30">
      <MobileHeader title="CutCalc" onBack={onBack} />
      
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-red-900/20 to-rose-900/30 backdrop-blur-sm border-red-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500/30 to-rose-500/40 rounded-xl flex items-center justify-center border border-red-500/30">
                <Scissors className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">CutCalc</CardTitle>
                <CardDescription className="text-red-200/80">
                  Advanced cutting calculator for precise fat loss planning
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-200">Current Weight (kg)</Label>
                <Input
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="80"
                  type="number"
                  className="bg-red-900/30 border-red-500/50 text-white placeholder:text-red-200/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-red-200">Target Weight (kg)</Label>
                <Input
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="75"
                  type="number"
                  className="bg-red-900/30 border-red-500/50 text-white placeholder:text-red-200/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-red-200">TDEE (calories)</Label>
                <Input
                  value={tdee}
                  onChange={(e) => setTdee(e.target.value)}
                  placeholder="2500"
                  type="number"
                  className="bg-red-900/30 border-red-500/50 text-white placeholder:text-red-200/50"
                />
              </div>
            </div>

            <Button 
              onClick={calculateCut}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
            >
              Calculate Cut Plan
            </Button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-red-800/30 border border-red-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-200 mb-2">Cut Summary</h3>
                  <p className="text-white">Weight to lose: <span className="font-bold">{result.weightToLose}kg</span></p>
                  <p className="text-red-200/80 text-sm mt-1">
                    Total calorie deficit needed: {result.totalCaloriesDeficit.toLocaleString()} calories
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-red-200">Cut Options</h4>
                  {result.scenarios.map((scenario, index) => (
                    <div key={index} className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                      <h5 className="font-semibold text-white">{scenario.label}</h5>
                      <p className="text-red-200">Daily calories: <span className="font-bold">{scenario.dailyCalories}</span></p>
                      <p className="text-red-200">Time to goal: <span className="font-bold">{scenario.weeksToGoal} weeks</span></p>
                      <p className="text-red-200/70 text-xs mt-1">Daily deficit: {scenario.deficit} calories</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CutCalc;
