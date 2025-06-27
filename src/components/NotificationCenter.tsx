
import React, { useState } from 'react';
import { Bell, Settings, Clock, Target, TrendingUp, X, Trophy, Zap } from 'lucide-react';
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

  const pastNotifications = [
    {
      id: '1',
      title: 'Weekly Progress Summary',
      message: 'Great work this week! You completed 4 out of 5 planned workouts.',
      timestamp: '2 hours ago',
      type: 'progress'
    },
    {
      id: '2',
      title: 'Hydration Reminder',
      message: 'Remember to stay hydrated for optimal performance.',
      timestamp: '4 hours ago',
      type: 'health'
    },
    {
      id: '3',
      title: 'Goal Achievement',
      message: 'Congratulations! You reached your weekly calorie target.',
      timestamp: '1 day ago',
      type: 'achievement'
    }
  ];

  const goals = [
    {
      id: '1',
      title: 'Lose 10 lbs',
      description: 'Target weight loss for better health',
      progress: 60,
      deadline: 'March 15, 2025',
      status: 'on-track'
    },
    {
      id: '2',
      title: 'Bench Press 200 lbs',
      description: 'Strength goal for upper body development',
      progress: 85,
      deadline: 'February 28, 2025',
      status: 'ahead'
    },
    {
      id: '3',
      title: '5K in under 25 minutes',
      description: 'Cardiovascular endurance milestone',
      progress: 40,
      deadline: 'April 1, 2025',
      status: 'behind'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Month Completed',
      description: 'Successfully completed your first month of training',
      earnedDate: 'January 15, 2025',
      points: 100,
      icon: Trophy
    },
    {
      id: '2',
      title: 'Consistency Champion',
      description: 'Worked out 5 days in a row',
      earnedDate: 'January 20, 2025',
      points: 75,
      icon: Zap
    },
    {
      id: '3',
      title: 'Strength Milestone',
      description: 'Increased bench press by 25%',
      earnedDate: 'January 25, 2025',
      points: 150,
      icon: Target
    }
  ];

  const toggleSetting = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'progress': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'health': return <Target className="w-4 h-4 text-green-400" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-400 bg-green-500/20';
      case 'on-track': return 'text-blue-400 bg-blue-500/20';
      case 'behind': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
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
      <DialogContent className="sm:max-w-3xl bg-gray-900 border-gray-700 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-400" />
            Notification Center
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-500">
              <Bell className="w-4 h-4 mr-1" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-orange-500">
              <Target className="w-4 h-4 mr-1" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-orange-500">
              <Trophy className="w-4 h-4 mr-1" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Settings */}
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

            {/* Past Notifications */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2 text-orange-400" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>
                  View your past notifications and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-2">{notification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Target className="w-5 h-5 mr-2 text-orange-400" />
                  Active Goals
                </CardTitle>
                <CardDescription>
                  Track your fitness goals and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{goal.title}</h4>
                        <p className="text-gray-400 text-sm">{goal.description}</p>
                      </div>
                      <Badge className={getGoalStatusColor(goal.status)}>
                        {goal.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">Deadline: {goal.deadline}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Trophy className="w-5 h-5 mr-2 text-orange-400" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate your fitness milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <achievement.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium">{achievement.title}</h4>
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                        <p className="text-gray-500 text-xs">Earned: {achievement.earnedDate}</p>
                      </div>
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
