
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

  const [activeTab, setActiveTab] = useState('settings');

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
      progress: 60,
      target: '10 lbs',
      current: '6 lbs lost',
      deadline: '2025-03-01',
      status: 'on-track'
    },
    {
      id: '2',
      title: 'Bench Press 200 lbs',
      progress: 85,
      target: '200 lbs',
      current: '170 lbs',
      deadline: '2025-02-15',
      status: 'ahead'
    },
    {
      id: '3',
      title: 'Run 5K in under 25 min',
      progress: 40,
      target: '25:00',
      current: '28:30',
      deadline: '2025-04-01',
      status: 'behind'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: '7-Day Streak',
      description: 'Completed workouts for 7 consecutive days',
      points: 100,
      date: 'Today',
      category: 'Consistency'
    },
    {
      id: '2',
      title: 'Protein Goal Master',
      description: 'Hit your protein target 5 days in a row',
      points: 75,
      date: 'Yesterday',
      category: 'Nutrition'
    },
    {
      id: '3',
      title: 'First Mile',
      description: 'Ran your first complete mile',
      points: 50,
      date: '2 days ago',
      category: 'Cardio'
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Consistency': return 'bg-yellow-500/20 text-yellow-400';
      case 'Nutrition': return 'bg-green-500/20 text-green-400';
      case 'Cardio': return 'bg-red-500/20 text-red-400';
      case 'Strength': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-orange-500">
              <Clock className="w-4 h-4 mr-1" />
              Recent
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
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

          {/* Recent Notifications Tab */}
          <TabsContent value="recent" className="space-y-4">
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

          {/* Goals Tab */}
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
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{goal.title}</h4>
                      <Badge className={getCategoryColor(goal.status)}>
                        {goal.status === 'ahead' ? 'Ahead' : goal.status === 'on-track' ? 'On Track' : 'Behind'}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>{goal.current}</span>
                        <span>{goal.target}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            goal.status === 'ahead' ? 'bg-green-500' : 
                            goal.status === 'on-track' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Trophy className="w-5 h-5 mr-2 text-orange-400" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  Your latest fitness accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mt-1">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(achievement.category)}>
                            {achievement.category}
                          </Badge>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
                      <p className="text-gray-500 text-xs mt-2">{achievement.date}</p>
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
