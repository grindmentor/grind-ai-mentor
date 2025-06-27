
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trophy, Target, ChevronDown, ChevronUp, Award } from 'lucide-react';

const CompactGoalsAchievements = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickStats = {
    activeGoals: 3,
    completedToday: 2,
    weeklyStreak: 5,
    totalPoints: 1250
  };

  const recentGoals = [
    { title: "Weekly Workout Goal", progress: 75, current: 3, target: 4 },
    { title: "Daily Protein Target", progress: 60, current: 3, target: 5 },
    { title: "Weight Loss Milestone", progress: 40, current: 0.8, target: 2 }
  ];

  const recentAchievements = [
    { title: "7-Day Streak Champion", points: 100, time: "2 hours ago" },
    { title: "Protein Master", points: 75, time: "1 day ago" }
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-blue-900/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <Trophy className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Goals & Achievements</h3>
                  <p className="text-blue-200/80 text-xs">
                    {quickStats.activeGoals} active • {quickStats.completedToday} completed today
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs">
                  <Target className="w-3 h-3 text-orange-400" />
                  <span className="text-gray-300">{quickStats.activeGoals}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <span className="text-gray-300">{quickStats.totalPoints}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-4">
              {/* Goals Section */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-orange-400" />
                  Active Goals
                </h4>
                <div className="space-y-2">
                  {recentGoals.slice(0, 2).map((goal, index) => (
                    <div key={index} className="p-3 bg-gray-900/40 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-xs font-medium">{goal.title}</span>
                        <span className="text-blue-400 text-xs">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {goal.current}/{goal.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements Section */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                  Recent Achievements
                </h4>
                <div className="space-y-2">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <div>
                            <span className="text-white text-xs font-medium">{achievement.title}</span>
                            <p className="text-gray-400 text-xs">{achievement.time}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                          +{achievement.points}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CompactGoalsAchievements;
