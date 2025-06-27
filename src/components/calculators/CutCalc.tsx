
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scissors } from 'lucide-react';

interface CutCalcProps {
  onBack?: () => void;
}

const CutCalc: React.FC<CutCalcProps> = ({ onBack }) => {
  const [result, setResult] = useState<number | null>(null);

  const calculateCut = () => {
    // Basic cutting calculation example
    setResult(1800);
  };

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
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold">CutCalc</h1>
          </div>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Advanced Cutting Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Calculate your optimal caloric deficit for effective fat loss while preserving muscle.
            </p>
            
            <Button 
              onClick={calculateCut}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              Calculate Cut
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-300">Your cutting calories: {result} calories/day</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CutCalc;
