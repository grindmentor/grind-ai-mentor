
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Apple } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface NutritionTrackerProps {
  onBack: () => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
      <MobileHeader title="Nutrition Tracker" onBack={onBack} />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
                <Apple className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Nutrition Tracker</CardTitle>
                <CardDescription className="text-green-200/80">
                  Track your daily nutrition and macro intake
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-white mb-4">Track Your Nutrition</h3>
              <p className="text-green-200/80 mb-6">
                Monitor your daily food intake and macro distribution.
              </p>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                Start Tracking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionTracker;
