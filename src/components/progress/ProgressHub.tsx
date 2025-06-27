
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Calendar, Target } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface ProgressHubProps {
  onBack: () => void;
}

const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-purple-900/30">
      <MobileHeader title="Progress Hub" onBack={onBack} />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-900/20 to-violet-900/30 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-violet-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Progress Hub</CardTitle>
                <CardDescription className="text-purple-200/80">
                  Track your fitness journey with detailed analytics and insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-purple-800/30 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Workout Streak</h3>
                      <p className="text-2xl font-bold text-purple-200">0 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/30 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Goals Completed</h3>
                      <p className="text-2xl font-bold text-purple-200">0/0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/30 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Weekly Progress</h3>
                      <p className="text-2xl font-bold text-purple-200">+0%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-white mb-4">Start Your Journey</h3>
              <p className="text-purple-200/80 mb-6">
                Begin tracking your workouts and goals to see your progress here.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                Log Your First Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressHub;
