
import React, { useState } from 'react';
import { Bell, Settings, Clock, Target, TrendingUp, X, Trophy, Flag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationCenter = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    weeklyProgress: true,
    hydrationAlerts: true,
    workoutReminders: true,
    goalDeadlines: false
  });

  const goals = [
    {
      id: '1',
      title: 'Lose 10 lbs by March',
      progress: 65,
      deadline: '2025-03-15',
      status: 'on_track'
    },
    {
      id: '2',
      title: 'Bench Press 225 lbs',
      progress: 80,
      deadline: '2025-04-01',
      status: 'ahead'
    },
    {
      id: '3',
      title: 'Run 5K under 25 minutes',
      progress: 40,
      deadline: '2025-02-28',
      status: 'behind'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'Weekly Progress Summary',
      message: 'Great work this week! You completed 4 out of 5 planned workouts.',
      timestamp: '2 hours ago',
      type: 'progress',
      points: 50
    },
    {
      id: '2',
      title: '7-Day Workout Streak',
      message: 'Congratulations! You maintained a perfect workout streak.',
      timestamp: '1 day ago',
      type: 'achievement',
      points: 100
    },
    {
      id: '3',
      title: 'Goal Achievement',
      message: 'You reached your weekly calorie target with 2 days to spare!',
      timestamp: '2 days ago',
      type: 'achievement',
      points: 75
    }
  ];

  const toggleSetting = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-400 bg-green-500/20';
      case 'on_track': return 'text-blue-400 bg-blue-500/20';
      case 'behind': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getGoalStatusText = (status: string) => {
    switch (status) {
      case 'ahead': return 'Ahead of Schedule';
      case 'on_track': return 'On Track';
      case 'behind': return 'Needs Attention';
      default: return 'Unknown';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'progress': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
          <Bell className="w-4 h-4 mr-2" />
          Notification Center
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-gray-900 border-gray-700 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-400" />
            Notification Center
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-orange-500">
              <Flag className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-orange-500">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-orange-400" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Daily Reminders</h4>
                    <p className="text-gray-400 text-sm">Get daily fitness and health reminders</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.dailyReminders}
                    onCheckedChange={() => toggleSetting('dailyReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Weekly Progress</h4>
                    <p className="text-gray-400 text-sm">Receive weekly progress summaries</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.weeklyProgress}
                    onCheckedChange={() => toggleSetting('weeklyProgress')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Hydration Alerts</h4>
                    <p className="text-gray-400 text-sm">Stay hydrated with regular reminders</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.hydrationAlerts}
                    onCheckedChange={() => toggleSetting('hydrationAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Workout Reminders</h4>
                    <p className="text-gray-400 text-sm">Get notified about scheduled workouts</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.workoutReminders}
                    onCheckedChange={() => toggleSetting('workoutReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Goal Deadlines</h4>
                    <p className="text-gray-400 text-sm">Alerts for approaching goal deadlines</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.goalDeadlines}
                    onCheckedChange={() => toggleSetting('goalDeadlines')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Flag className="w-5 h-5 mr-2 text-orange-400" />
                  Active Goals
                </CardTitle>
                <CardDescription>
                  Track your fitness goals and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{goal.title}</h4>
                        <p className="text-gray-400 text-sm">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getGoalStatusColor(goal.status)}>
                        {getGoalStatusText(goal.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Trophy className="w-5 h-5 mr-2 text-orange-400" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  View your latest accomplishments and rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="mt-0.5">
                      {getNotificationIcon(achievement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                        {achievement.points && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            +{achievement.points} pts
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{achievement.message}</p>
                      <p className="text-gray-500 text-xs mt-2">{achievement.timestamp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
