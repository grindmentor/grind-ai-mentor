
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, Trophy, Target, CheckCircle, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'achievement' | 'goal' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationsSummary = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Workout Streak!',
      message: 'You\'ve completed 7 workouts in a row!',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2', 
      type: 'goal',
      title: 'Goal Progress',
      message: 'You\'re 80% towards your strength goal!',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Recovery Check',
      message: 'Don\'t forget to log your sleep and recovery data',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    }
  ]);
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Sample quick stats for the compact view
  const quickStats = {
    activeGoals: 3,
    recentAchievements: 2,
    pendingReminders: 1
  };

  const handleViewAll = () => {
    navigate('/notifications');
  };

  const removeNotification = (notificationId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification removed');
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'goal': return Target;
      case 'reminder': return Bell;
      default: return CheckCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-yellow-400';
      case 'goal': return 'text-orange-400';
      case 'reminder': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Mobile optimized notification card */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-lg flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Bell className="w-4 h-4 text-blue-400" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-sm truncate">Notifications</h3>
                <p className="text-blue-200/80 text-xs truncate">
                  {quickStats.activeGoals} goals, {quickStats.recentAchievements} achievements
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {!isMobile && (
                <>
                  <div className="flex items-center space-x-1 text-xs">
                    <Target className="w-3 h-3 text-orange-400" />
                    <span className="text-gray-300">{quickStats.activeGoals}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span className="text-gray-300">{quickStats.recentAchievements}</span>
                  </div>
                </>
              )}
              
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white border-0 min-h-[36px] px-2 sm:px-3 text-xs sm:text-sm"
                onClick={handleViewAll}
              >
                View All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile notification sheet (for preview) */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="sr-only">Open notifications</div>
          </SheetTrigger>
          <SheetContent 
            side="top" 
            className="bg-black/95 backdrop-blur-md border-gray-800 text-white h-[80vh] overflow-hidden"
          >
            <SheetHeader className="pb-4 border-b border-gray-800">
              <SheetTitle className="text-white text-lg">Notifications</SheetTitle>
            </SheetHeader>
            
            <div className="mt-4 space-y-3 overflow-y-auto h-full pb-20">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 ${
                      !notification.read ? 'border-orange-500/30' : ''
                    } swipe-container`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center flex-shrink-0 ${
                          !notification.read ? 'ring-1 ring-orange-500/30' : ''
                        }`}>
                          <IconComponent className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-medium text-sm truncate ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => removeNotification(notification.id, e)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-6 w-6 flex-shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className={`text-xs ${
                            !notification.read ? 'text-gray-300' : 'text-gray-400'
                          } line-clamp-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No notifications yet</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default NotificationsSummary;
