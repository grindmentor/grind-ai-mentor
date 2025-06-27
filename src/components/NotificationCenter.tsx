
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bell, Settings, X, Target, Dumbbell, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MobileOptimized, TouchButton } from '@/components/ui/mobile-optimized';
import { useIsMobile } from '@/hooks/use-mobile';

interface Notification {
  id: string;
  type: 'motivation' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
}

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [enableMotivational, setEnableMotivational] = useState(true);

  // Load user preferences and generate motivational notifications
  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('notifications_enabled');
      const enabled = saved ? JSON.parse(saved) : true;
      setEnableMotivational(enabled);

      if (enabled) {
        const motivationalNotifications: Notification[] = [
          {
            id: '1',
            type: 'motivation',
            title: 'Ready to crush today?',
            message: 'Your next workout is waiting. Science shows consistency beats intensity!',
            timestamp: new Date(),
            read: false,
            actionable: true
          }
        ];
        setNotifications(motivationalNotifications);
      } else {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleMotivationalNotifications = () => {
    const newValue = !enableMotivational;
    setEnableMotivational(newValue);
    localStorage.setItem('notifications_enabled', JSON.stringify(newValue));
    
    if (!newValue) {
      setNotifications([]);
    } else {
      // Re-add motivational notification
      const motivational: Notification = {
        id: Date.now().toString(),
        type: 'motivation',
        title: 'Welcome back!',
        message: 'Ready to continue your fitness journey?',
        timestamp: new Date(),
        read: false,
        actionable: true
      };
      setNotifications([motivational]);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'motivation':
        return <Target className="w-5 h-5 text-orange-400" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'reminder':
        return <Dumbbell className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <MobileOptimized className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      {/* Mobile-optimized Header with proper spacing */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 pt-safe">
            <TouchButton
              onClick={() => navigate('/app')}
              className="text-white hover:bg-orange-500/20 hover:text-orange-400 transition-colors font-medium flex items-center space-x-2 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </TouchButton>
            
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Notifications
            </h1>
            
            <TouchButton
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </TouchButton>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-safe">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-gray-900/60 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-white font-medium">Motivational Messages</h3>
                  <p className="text-gray-400 text-sm">Get encouraging workout reminders</p>
                </div>
                <TouchButton
                  onClick={toggleMotivationalNotifications}
                  className={`px-4 py-2 rounded-lg transition-colors ${enableMotivational 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "border border-gray-600 text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {enableMotivational ? 'Enabled' : 'Enable'}
                </TouchButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/30 flex items-center justify-center">
              <Bell className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-gray-400 text-lg mb-4 px-4">
              {enableMotivational 
                ? "No new notifications right now."
                : "Enable motivational messages to get workout reminders."
              }
            </p>
            {!enableMotivational && (
              <TouchButton
                onClick={toggleMotivationalNotifications}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-3 rounded-xl font-medium"
              >
                Enable Motivational Messages
              </TouchButton>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-all duration-200 ${
                  notification.read 
                    ? 'bg-gray-900/40 border-gray-700/30' 
                    : 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1 flex-wrap">
                          <h3 className="text-white font-medium">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2 leading-relaxed">{notification.message}</p>
                        <p className="text-gray-500 text-xs">
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4 flex-shrink-0">
                      {!notification.read && (
                        <TouchButton
                          onClick={() => markAsRead(notification.id)}
                          className="text-orange-400 hover:bg-orange-500/20 text-xs px-2 py-1 rounded-lg"
                        >
                          Mark Read
                        </TouchButton>
                      )}
                      <TouchButton
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:bg-red-500/20 hover:text-red-400 p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </TouchButton>
                    </div>
                  </div>
                  
                  {notification.actionable && (
                    <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <TouchButton
                        onClick={() => navigate('/app')}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-xs px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
                      >
                        Start Workout
                      </TouchButton>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileOptimized>
  );
};

export default NotificationCenter;
