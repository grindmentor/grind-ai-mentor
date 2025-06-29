
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Settings, Trash2, CheckCircle2, Clock, Target, Droplets, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  onBack: () => void;
}

const NotificationCenter = ({ onBack }: NotificationCenterProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    hydrationReminders: false,
    workoutReminders: false,
    achievementAlerts: false,
    progressUpdates: false,
    nutritionTips: false,
    recoveryAlerts: false,
    goalDeadlines: false,
    weeklyReports: false
  });

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification settings:', error);
        return;
      }
      
      if (data?.notification_preferences) {
        setNotificationSettings(data.notification_preferences);
      }
    } catch (error) {
      console.error('Error in loadNotificationSettings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationToggle = async (settingId: string) => {
    if (savingSettings) return; // Prevent multiple simultaneous updates
    
    const newSettings = {
      ...notificationSettings,
      [settingId]: !notificationSettings[settingId as keyof typeof notificationSettings]
    };
    
    setNotificationSettings(newSettings);
    setSavingSettings(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // First check if user_preferences record exists
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('id, notification_preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user preferences:', fetchError);
        throw fetchError;
      }

      let updateError;
      if (existingPrefs) {
        // Update existing record
        const { error } = await supabase
          .from('user_preferences')
          .update({
            notification_preferences: newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        updateError = error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            notification_preferences: newSettings
          });
        updateError = error;
      }

      if (updateError) {
        console.error('Error updating notification settings:', updateError);
        throw updateError;
      }

      // Request notification permission if enabling notifications and not already granted
      if (newSettings[settingId as keyof typeof newSettings] && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast.success('Notifications enabled and permission granted!');
          } else if (permission === 'denied') {
            toast.error('Notification permission denied. Enable in browser settings.');
          }
        } else if (Notification.permission === 'granted') {
          // Test notification
          new Notification('Myotopia Notification Test', {
            body: 'Your notification settings have been updated!',
            icon: '/icon-192x192.png'
          });
        }
      }

      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
      // Revert the local state
      setNotificationSettings(notificationSettings);
    } finally {
      setSavingSettings(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📧';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/50';
      case 'warning': return 'border-yellow-500/50';
      case 'error': return 'border-red-500/50';
      default: return 'border-blue-500/50';
    }
  };

  const notificationOptions = [
    {
      id: 'hydrationReminders',
      title: 'Hydration Reminders',
      description: 'Get reminded to drink water throughout the day',
      category: 'Health',
      icon: Droplets,
      note: 'Reminders will be sent based on your activity level and climate'
    },
    {
      id: 'workoutReminders',
      title: 'Workout Reminders',
      description: 'Get notified when it\'s time for your scheduled workouts',
      category: 'Training',
      icon: Activity,
      note: 'Set your workout schedule in the Training module'
    },
    {
      id: 'achievementAlerts',
      title: 'Achievement Alerts',
      description: 'Celebrate when you unlock new achievements and milestones',
      category: 'Motivation',
      icon: Target,
      note: 'Instant notifications when you reach new personal bests'
    },
    {
      id: 'progressUpdates',
      title: 'Progress Updates',
      description: 'Weekly summaries of your fitness progress and improvements',
      category: 'Progress',
      icon: Target,
      note: 'Delivered every Sunday with your weekly stats'
    },
    {
      id: 'nutritionTips',
      title: 'Nutrition Tips',
      description: 'Personalized meal suggestions and nutrition advice',
      category: 'Nutrition',
      icon: Target,
      note: 'Based on your goals and dietary preferences'
    },
    {
      id: 'recoveryAlerts',
      title: 'Recovery Alerts',
      description: 'Get notified when you need rest days or better sleep',
      category: 'Recovery',
      icon: Clock,
      note: 'Smart recommendations based on your training intensity'
    },
    {
      id: 'goalDeadlines',
      title: 'Goal Deadline Alerts',
      description: 'Reminders when approaching your goal deadlines',
      category: 'Goals',
      icon: Target,
      note: 'Notifications 7 days, 3 days, and 1 day before deadlines'
    },
    {
      id: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Comprehensive weekly fitness and progress reports',
      category: 'Reports',
      icon: Target,
      note: 'Detailed analysis delivered every Monday morning'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Recovery': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Health': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Motivation': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Progress': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Goals': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Reports': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400">Manage your alerts and preferences</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-700">
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300"
              >
                <Bell className="w-4 h-4 mr-1" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
                  <p className="text-gray-400">When you have new notifications, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`bg-gray-900 border-gray-800 ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'border-l-4' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">New</Badge>
                                )}
                              </div>
                              <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-300' : 'text-gray-400'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  {Object.values(notificationSettings).filter(Boolean).length}/{Object.keys(notificationSettings).length} Enabled
                </Badge>
              </div>
              
              <div className="space-y-4">
                {notificationOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isEnabled = notificationSettings[option.id as keyof typeof notificationSettings];
                  
                  return (
                    <Card key={option.id} className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0 mr-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isEnabled 
                                ? getCategoryColor(option.category).split(' ')[0] + ' ' + getCategoryColor(option.category).split(' ')[1]
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-white font-semibold">{option.title}</h3>
                                <Badge className={getCategoryColor(option.category)}>
                                  {option.category}
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">{option.description}</p>
                              <p className="text-gray-500 text-xs">{option.note}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleNotificationToggle(option.id)}
                              disabled={savingSettings}
                              className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-600 border-2 border-gray-500 data-[state=checked]:border-orange-500"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">Smart Notifications</h3>
                      <p className="text-blue-300/80 text-sm mb-3">
                        Myotopia learns from your behavior to send notifications at optimal times. 
                        Enable notifications above to get personalized reminders that help you achieve your fitness goals.
                      </p>
                      <p className="text-blue-400/60 text-xs">
                        You can always adjust these settings or turn off specific notification types. All notifications are disabled by default.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
