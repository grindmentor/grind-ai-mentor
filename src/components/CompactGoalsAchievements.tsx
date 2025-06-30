import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit?: string;
  category: string;
  deadline?: string;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  points: number;
  category: string;
  completed_at?: string;
}

interface CompactGoalsAchievementsProps {
  goals: Goal[];
  achievements: Achievement[];
  onViewGoals: () => void;
  onViewAchievements: () => void;
}

const CompactGoalsAchievements: React.FC<CompactGoalsAchievementsProps> = ({
  goals,
  achievements,
  onViewGoals,
  onViewAchievements
}) => {
  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-400" />
          Goals & Achievements
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Goals */}
        <div>
          <h3 className="text-orange-200 font-medium mb-3 text-sm">Active Goals</h3>
          {goals.length === 0 ? (
            <p className="text-gray-400 text-xs">No active goals yet</p>
          ) : (
            <div className="space-y-2">
              {goals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{goal.title}</p>
                    <p className="text-gray-400 text-xs">
                      {goal.current_value}/{goal.target_value} {goal.unit}
                    </p>
                  </div>
                  <div className="w-12 h-2 bg-gray-700 rounded-full ml-2 flex-shrink-0">
                    <div 
                      className="h-2 bg-orange-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Achievement */}
        {achievements.length > 0 && (
          <div>
            <h3 className="text-orange-200 font-medium mb-3 text-sm">Latest Achievement</h3>
            <div className="flex items-center p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-yellow-200 text-xs font-medium truncate">{achievements[0].title}</p>
                <p className="text-yellow-300/70 text-xs">+{achievements[0].points} points</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={onViewGoals}
            variant="outline"
            size="sm"
            className="flex-1 border-orange-500/50 text-orange-300 hover:bg-orange-500/10 text-xs py-2 px-3 h-8 min-h-[2rem]"
          >
            <Target className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">View Goals</span>
          </Button>
          <Button
            onClick={onViewAchievements}
            variant="outline"
            size="sm"
            className="flex-1 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 text-xs py-2 px-3 h-8 min-h-[2rem]"
          >
            <Trophy className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Achievements</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactGoalsAchievements;
