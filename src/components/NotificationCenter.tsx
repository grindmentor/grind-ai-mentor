
import React, { useState } from 'react';
import { Bell, Settings, Clock, Target, TrendingUp, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
      case 'achievement': return <Target className="w-4 h-4 text-yellow-400" />;
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
      <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-400" />
            Notification Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
