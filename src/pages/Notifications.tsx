import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Settings, Trash2, CheckCircle2, Clock, Target, Droplets, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Notifications = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    hydrationReminders: true,
    achievementAlerts: true,
    progressUpdates: false,
    nutritionTips: true,
    recoveryAlerts: false,
    goalDeadlines: true,
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
      // Mock notifications for now
      const mockNotifications = [
        {
          id: '1',
          title: 'Hydration Reminder',
          message: 'Time to drink some water! Stay hydrated for optimal performance.',
          type: 'info',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Daily Workout Check',
          message: 'Did you hit the gym today? Keep up your training consistency!',
          type: 'info',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
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
        .maybeSingle();

      if (error) {
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

  const handleNotificationToggle = async (settingId: string) => {
    const newSettings = {
      ...notificationSettings,
      [settingId]: !notificationSettings[settingId as keyof typeof notificationSettings]
    };
    
    setNotificationSettings(newSettings);
    setSavingSettings(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          notification_preferences: newSettings
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
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

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Updated notification options with proper descriptions
  const notificationOptions = [
    {
      id: 'hydrationReminders',
      title: 'Hydration Reminders',
      description: 'Get reminded to drink water every 2-4 hours',
      category: 'Health'
    },
    {
      id: 'achievementAlerts',
      title: 'Achievement Alerts',
      description: 'Celebrate milestones and streaks with instant notifications',
      category: 'Motivation'
    },
    {
      id: 'progressUpdates',
      title: 'Progress Updates',
      description: 'Weekly and monthly progress summaries',
      category: 'Progress'
    },
    {
      id: 'nutritionTips',
      title: 'Nutrition Tips',
      description: 'Smart meal suggestions based on your goals',
      category: 'Nutrition'
    },
    {
      id: 'recoveryAlerts',
      title: 'Recovery Alerts',
      description: 'Rest day recommendations and sleep reminders',
      category: 'Recovery'
    },
    {
      id: 'goalDeadlines',
      title: 'Goal Deadline Alerts',
      description: 'Reminders when approaching goal deadlines',
      category: 'Goals'
    },
    {
      id: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Comprehensive weekly fitness reports via notifications',
      category: 'Reports'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nutrition': return 'bg-green-500/20 text-green-400';
      case 'Training': return 'bg-blue-500/20 text-blue-400';
      case 'Recovery': return 'bg-purple-500/20 text-purple-400';
      case 'Health': return 'bg-blue-500/20 text-blue-400';
      case 'Motivation': return 'bg-yellow-500/20 text-yellow-400';
      case 'Progress': return 'bg-pink-500/20 text-pink-400';
      case 'Goals': return 'bg-purple-500/20 text-purple-400';
      case 'Reports': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
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
                <p className="text-gray-400">Configure your notification preferences</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 h-11 p-1 rounded-lg">
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-orange-500 text-xs sm:text-sm h-9 rounded-md flex items-center justify-center gap-1 overflow-hidden"
              >
                <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-[10px] px-1 py-0 h-4 min-w-4 flex-shrink-0">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-orange-500 text-xs sm:text-sm h-9 rounded-md flex items-center justify-center gap-1 overflow-hidden"
              >
                <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Settings</span>
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
                      } group hover:bg-gray-800/50 transition-colors`}
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
                          <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <Badge className="bg-green-500/20 text-green-400">
                  {Object.values(notificationSettings).filter(Boolean).length}/{Object.keys(notificationSettings).length} Enabled
                </Badge>
              </div>
              
              <div className="space-y-4">
                {notificationOptions.map((option) => (
                  <Card key={option.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-semibold">{option.title}</h3>
                            <Badge className={getCategoryColor(option.category)}>
                              {option.category}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{option.description}</p>
                        </div>
                        <Switch
                          checked={notificationSettings[option.id as keyof typeof notificationSettings]}
                          onCheckedChange={() => handleNotificationToggle(option.id)}
                          disabled={savingSettings}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">Smart Notifications</h3>
                      <p className="text-blue-300/80 text-sm mb-3">
                        Our AI learns from your behavior to send notifications at optimal times. 
                        Enable notifications above to get personalized reminders that help you achieve your fitness goals.
                      </p>
                      <p className="text-blue-400/60 text-xs">
                        You can always adjust these settings or turn off specific notification types.
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

export default Notifications;
