
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface BodyweightTrainerProps {
  onBack: () => void;
}

const BodyweightTrainer: React.FC<BodyweightTrainerProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-teal-950/50 to-teal-900/30">
      <MobileHeader title="Bodyweight Trainer" onBack={onBack} />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-teal-900/20 to-cyan-900/30 backdrop-blur-sm border-teal-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500/30 to-cyan-500/40 rounded-xl flex items-center justify-center border border-teal-500/30">
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Bodyweight Trainer</CardTitle>
                <CardDescription className="text-teal-200/80">
                  No-equipment workouts and bodyweight exercise progressions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-white mb-4">Train Anywhere, Anytime</h3>
              <p className="text-teal-200/80 mb-6">
                Access bodyweight exercises and progressions that require no equipment.
              </p>
              <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                Start Bodyweight Training
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BodyweightTrainer;
