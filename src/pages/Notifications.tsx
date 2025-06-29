
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Notifications = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("settings");
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotificationSettings();
      fetchNotifications();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.notification_preferences) {
        setNotificationSettings(data.notification_preferences);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notification_preferences: newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  const handleNotificationToggle = async (settingId: string) => {
    const newSettings = {
      ...notificationSettings,
      [settingId]: !notificationSettings[settingId]
    };
    
    setNotificationSettings(newSettings);
    await updateNotificationSettings(newSettings);
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const notificationOptions = [
    {
      id: 'hydrationReminders',
      title: 'Hydration Reminders',
      description: 'Get reminded to drink water every 2-4 hours',
      category: 'Health'
    },
    {
      id: 'workoutReminders',
      title: 'Workout Reminders',
      description: 'Scheduled workout notifications and pre-workout alerts',
      category: 'Training'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
              className="text-white hover:bg-gray-800/50 backdrop-blur-sm hover:text-orange-400 transition-colors w-fit"
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
            <TabsList className={`grid w-full grid-cols-2 bg-gray-900/40 backdrop-blur-sm ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                <Bell className="w-4 h-4 mr-1" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Notifications Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
                <Badge className="bg-green-500/20 text-green-400">
                  {Object.values(notificationSettings).filter(Boolean).length}/{Object.keys(notificationSettings).length} Enabled
                </Badge>
              </div>
              
              <div className="space-y-4">
                {notificationOptions.map((option) => (
                  <Card key={option.id} className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
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
                          checked={notificationSettings[option.id] || false}
                          onCheckedChange={() => handleNotificationToggle(option.id)}
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

            {/* Notification History Tab */}
            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Notification History</h2>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {notifications.filter(n => !n.read).length} Unread
                </Badge>
              </div>

              {notifications.length === 0 ? (
                <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6 text-center">
                    <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No notifications yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your notifications will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className={`bg-gray-900/40 backdrop-blur-sm border-gray-700/50 ${!notification.read ? 'border-orange-500/30' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-white font-medium">{notification.title}</h3>
                              {!notification.read && (
                                <Badge className="bg-orange-500/20 text-orange-400 text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
