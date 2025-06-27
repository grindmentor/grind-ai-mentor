
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity } from 'lucide-react';

interface BodyweightTrainerProps {
  onBack?: () => void;
}

const BodyweightTrainer: React.FC<BodyweightTrainerProps> = ({ onBack }) => {
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
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold">Bodyweight Trainer</h1>
          </div>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">No-Equipment Workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Master bodyweight exercises and progressions that require no equipment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
                <h3 className="text-teal-300 font-semibold mb-2">Push Progressions</h3>
                <p className="text-gray-400">Push-ups to advanced variations</p>
              </div>
              
              <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
                <h3 className="text-teal-300 font-semibold mb-2">Pull Progressions</h3>
                <p className="text-gray-400">Pull-ups and rowing movements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BodyweightTrainer;
