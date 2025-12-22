import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Settings, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Notifications = () => {
  const navigate = useNavigate();
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
      // Load real notifications from database - no fake/mock data
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
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
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update settings');
      setNotificationSettings(notificationSettings);
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(previousNotifications);
      toast.error('Failed to delete notification');
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(previousNotifications);
      toast.error('Failed to mark as read');
    }
  };

  const notificationOptions = [
    { id: 'hydrationReminders', title: 'Hydration Reminders', description: 'Get reminded to drink water', category: 'Health' },
    { id: 'achievementAlerts', title: 'Achievement Alerts', description: 'Celebrate milestones and streaks', category: 'Motivation' },
    { id: 'progressUpdates', title: 'Progress Updates', description: 'Weekly and monthly summaries', category: 'Progress' },
    { id: 'nutritionTips', title: 'Nutrition Tips', description: 'Smart meal suggestions', category: 'Nutrition' },
    { id: 'recoveryAlerts', title: 'Recovery Alerts', description: 'Rest day recommendations', category: 'Recovery' },
    { id: 'goalDeadlines', title: 'Goal Deadlines', description: 'Deadline reminders', category: 'Goals' },
    { id: 'weeklyReports', title: 'Weekly Reports', description: 'Comprehensive fitness reports', category: 'Reports' }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Nutrition': 'bg-green-500/15 text-green-400 border-green-500/25',
      'Health': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
      'Motivation': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
      'Progress': 'bg-pink-500/15 text-pink-400 border-pink-500/25',
      'Recovery': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
      'Goals': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
      'Reports': 'bg-gray-500/15 text-gray-400 border-gray-500/25'
    };
    return colors[category] || 'bg-gray-500/15 text-gray-400 border-gray-500/25';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 py-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header - Compact */}
          <div className="flex items-center gap-3 mb-5">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
              className="p-2 h-10 w-10 rounded-full hover:bg-muted"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Notifications</h1>
                <p className="text-muted-foreground text-xs">Configure your preferences</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/40 rounded-xl p-1 h-11">
              <TabsTrigger 
                value="notifications" 
                className="rounded-lg h-9 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 min-w-4">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-lg h-9 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-3 mt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-card/60 border border-border/50">
                      <div className="skeleton-premium h-4 w-3/4 mb-2" />
                      <div className="skeleton-premium h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-state-premium">
                  <div className="empty-state-icon">
                    <Bell />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No notifications</h3>
                  <p className="text-muted-foreground text-sm">New notifications will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 stagger-children">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={cn(
                        "bg-card/60 border-border/50 overflow-hidden",
                        !notification.read && "border-l-2 border-l-primary"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={cn(
                                "font-medium text-sm",
                                !notification.read ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">New</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
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
            <TabsContent value="settings" className="space-y-3 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-foreground">Notification Types</h2>
                <Badge className="bg-muted text-muted-foreground text-[10px]">
                  {Object.values(notificationSettings).filter(Boolean).length}/{Object.keys(notificationSettings).length} on
                </Badge>
              </div>
              
              <div className="space-y-2 stagger-children">
                {notificationOptions.map((option) => (
                  <Card key={option.id} className="bg-card/60 border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-medium text-foreground">{option.title}</h3>
                            <Badge className={cn("text-[9px] px-1.5 py-0 border", getCategoryColor(option.category))}>
                              {option.category}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{option.description}</p>
                        </div>
                        <Switch
                          checked={notificationSettings[option.id as keyof typeof notificationSettings]}
                          onCheckedChange={() => handleNotificationToggle(option.id)}
                          disabled={savingSettings}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-primary font-medium text-sm mb-1">Smart Notifications</h3>
                      <p className="text-primary/70 text-[11px] leading-relaxed">
                        Our AI learns from your behavior to send notifications at optimal times.
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
