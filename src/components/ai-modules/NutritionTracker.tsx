
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Apple } from 'lucide-react';

interface NutritionTrackerProps {
  onBack?: () => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-white hover:bg-orange-500/20 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Apple className="w-5 h-5 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold">Nutrition Tracker</h1>
          </div>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Advanced Nutrition Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Track your nutrition with precision and get insights into your eating patterns.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-300 font-semibold mb-2">Macros</h3>
                <p className="text-gray-400">Track protein, carbs, fats</p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-300 font-semibold mb-2">Micros</h3>
                <p className="text-gray-400">Vitamins and minerals</p>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-300 font-semibold mb-2">Timing</h3>
                <p className="text-gray-400">Meal timing optimization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionTracker;
