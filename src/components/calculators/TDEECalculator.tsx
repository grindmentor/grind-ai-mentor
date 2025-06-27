
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator } from 'lucide-react';

interface TDEECalculatorProps {
  onBack?: () => void;
}

const TDEECalculator: React.FC<TDEECalculatorProps> = ({ onBack }) => {
  const [result, setResult] = useState<number | null>(null);

  const calculateTDEE = () => {
    // Basic TDEE calculation example
    setResult(2200);
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
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold">TDEE Calculator</h1>
          </div>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Calculate Your Total Daily Energy Expenditure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Calculate your daily caloric needs based on your activity level and goals.
            </p>
            
            <Button 
              onClick={calculateTDEE}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Calculate TDEE
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <p className="text-indigo-300">Your estimated TDEE: {result} calories/day</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDEECalculator;
