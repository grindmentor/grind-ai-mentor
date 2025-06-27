
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Calendar, Zap, CheckCircle, TrendingUp, Award } from 'lucide-react';

const GoalsAchievementsHub = () => {
  const [activeTab, setActiveTab] = useState('goals');

  const goals = [
    {
      id: 1,
      title: "Weekly Workout Goal",
      description: "Complete 4 workouts this week",
      progress: 75,
      current: 3,
      target: 4,
      deadline: "2 days left",
      priority: "high",
      category: "Training"
    },
    {
      id: 2,
      title: "Daily Protein Target",
      description: "Reach 150g protein daily for 5 consecutive days",
      progress: 60,
      current: 3,
      target: 5,
      deadline: "Ongoing",
      priority: "medium",
      category: "Nutrition"
    },
    {
      id: 3,
      title: "Weight Loss Milestone",
      description: "Lose 2kg this month",
      progress: 40,
      current: 0.8,
      target: 2,
      deadline: "12 days left",
      priority: "high",
      category: "Progress"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "7-Day Streak Champion",
      description: "Completed workouts for 7 consecutive days",
      category: "Consistency",
      points: 100,
      time: "2 hours ago",
      color: "bg-gradient-to-r from-yellow-500/20 to-orange-500/30 border-yellow-500/40"
    },
    {
      id: 2,
      title: "Protein Master",
      description: "Hit your protein target 5 days in a row",
      category: "Nutrition",
      points: 75,
      time: "1 day ago",
      color: "bg-gradient-to-r from-green-500/20 to-emerald-500/30 border-green-500/40"
    },
    {
      id: 3,
      title: "Strength Milestone",
      description: "Deadlifted 2x your bodyweight for the first time",
      category: "Strength",
      points: 200,
      time: "3 days ago",
      color: "bg-gradient-to-r from-red-500/20 to-pink-500/30 border-red-500/40"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Consistency': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Strength': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Goals & Achievements Hub</CardTitle>
              <CardDescription className="text-blue-200/80">
                Track your fitness progress and celebrate milestones
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-blue-900/30 backdrop-blur-sm">
            <TabsTrigger 
              value="goals" 
              className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Goals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{goal.title}</h3>
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{goal.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-300">
                        Progress: {goal.current}/{goal.target}
                      </span>
                      <span className={getPriorityColor(goal.priority)}>
                        {goal.deadline}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{goal.progress}% Complete</span>
                    <span className="text-blue-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border backdrop-blur-sm ${achievement.color}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/30 to-orange-500/40 rounded-lg flex items-center justify-center border border-yellow-500/30">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                      <Badge className={getCategoryColor(achievement.category)}>
                        {achievement.category}
                      </Badge>
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
                    <p className="text-gray-500 text-xs">{achievement.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoalsAchievementsHub;
