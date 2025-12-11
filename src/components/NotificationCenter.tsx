import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Trash2, CheckCircle2, Copy, Droplets, Activity, Target, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SwipeToDelete } from '@/components/ui/swipe-to-delete';
import { LongPressMenu, createDeleteAction, MenuAction } from '@/components/ui/long-press-menu';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

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
        .maybeSingle();

      if (error) {
        console.error('Error loading notification settings:', error);
        return;
      }
      
      if (data?.notification_preferences && typeof data.notification_preferences === 'object') {
        const prefs = data.notification_preferences as Record<string, boolean>;
        setNotificationSettings(prev => ({
          ...prev,
          hydrationReminders: prefs.hydrationReminders ?? false,
          workoutReminders: prefs.workoutReminders ?? false,
          achievementAlerts: prefs.achievementAlerts ?? false,
          progressUpdates: prefs.progressUpdates ?? false,
          nutritionTips: prefs.nutritionTips ?? false,
          recoveryAlerts: prefs.recoveryAlerts ?? false,
          goalDeadlines: prefs.goalDeadlines ?? false,
          weeklyReports: prefs.weeklyReports ?? false
        }));
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
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    if (!notificationToDelete) return;
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    toast.success('Notification deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          setNotifications(prev => [...prev, notificationToDelete]);
          
          try {
            const { error } = await supabase
              .from('user_notifications')
              .insert([{
                user_id: user?.id,
                title: notificationToDelete.title,
                message: notificationToDelete.message,
                type: notificationToDelete.type,
                read: notificationToDelete.read,
              }]);
            
            if (error) throw error;
            toast.success('Notification restored');
          } catch (error) {
            console.error('Failed to restore notification:', error);
            setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
            toast.error('Failed to restore');
          }
        }
      },
      duration: 5000,
    });

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      setNotifications(prev => [...prev, notificationToDelete]);
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📧';
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  const notificationOptions = [
    { id: 'hydrationReminders', title: 'Hydration Reminders', description: 'Get reminded to drink water', icon: Droplets, category: 'Health' },
    { id: 'workoutReminders', title: 'Workout Reminders', description: 'Scheduled workout notifications', icon: Activity, category: 'Training' },
    { id: 'achievementAlerts', title: 'Achievement Alerts', description: 'New achievements and milestones', icon: Target, category: 'Motivation' },
    { id: 'progressUpdates', title: 'Progress Updates', description: 'Weekly progress summaries', icon: Target, category: 'Progress' },
    { id: 'nutritionTips', title: 'Nutrition Tips', description: 'Personalized meal suggestions', icon: Target, category: 'Nutrition' },
    { id: 'recoveryAlerts', title: 'Recovery Alerts', description: 'Rest day recommendations', icon: Clock, category: 'Recovery' },
    { id: 'goalDeadlines', title: 'Goal Deadlines', description: 'Approaching goal reminders', icon: Target, category: 'Goals' },
    { id: 'weeklyReports', title: 'Weekly Reports', description: 'Comprehensive weekly analysis', icon: Target, category: 'Reports' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileHeader title="Notifications" onBack={onBack} />
      
      <div className="px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 h-12">
              <TabsTrigger 
                value="notifications" 
                className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0 h-5 min-w-[20px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-3 mt-4">
              <PullToRefresh onRefresh={loadNotifications} skeletonVariant="list">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground text-sm">When you have new notifications, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => {
                      const menuActions: MenuAction[] = [
                        {
                          id: 'copy',
                          label: 'Copy Message',
                          icon: <Copy className="w-5 h-5" />,
                          onClick: () => {
                            navigator.clipboard.writeText(notification.message);
                            toast.success('Message copied');
                          }
                        },
                        ...(!notification.read ? [{
                          id: 'markRead',
                          label: 'Mark as Read',
                          icon: <CheckCircle2 className="w-5 h-5" />,
                          onClick: () => markAsRead(notification.id)
                        }] : []),
                        createDeleteAction(() => deleteNotification(notification.id)),
                      ];
                      
                      return (
                        <SwipeToDelete
                          key={notification.id}
                          onDelete={() => deleteNotification(notification.id)}
                        >
                          <LongPressMenu actions={menuActions}>
                            <Card 
                              className={cn(
                                "bg-card border-border border-l-4",
                                getNotificationBorderColor(notification.type),
                                !notification.read && "bg-primary/5"
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className={cn(
                                        "font-medium text-sm",
                                        !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                      )}>
                                        {notification.title}
                                      </h3>
                                      {!notification.read && (
                                        <Badge className="bg-primary/20 text-primary text-[10px] px-1.5">New</Badge>
                                      )}
                                    </div>
                                    <p className={cn(
                                      "text-sm mb-2",
                                      !notification.read ? 'text-muted-foreground' : 'text-muted-foreground/70'
                                    )}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground/60">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </LongPressMenu>
                        </SwipeToDelete>
                      );
                    })}
                  </div>
                )}
              </PullToRefresh>
            </TabsContent>

            <TabsContent value="settings" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Customize which notifications you receive. Some features are coming soon.
              </p>
              
              <div className="space-y-2">
                {notificationOptions.map((option) => {
                  const Icon = option.icon;
                  const isEnabled = notificationSettings[option.id as keyof typeof notificationSettings];
                  
                  return (
                    <Card key={option.id} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm">{option.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleNotificationToggle(option.id)}
                            disabled={savingSettings}
                            aria-label={`Toggle ${option.title}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground text-center pt-4">
                Some notification features are coming soon and may not be fully functional yet.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;