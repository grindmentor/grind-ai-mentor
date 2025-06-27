
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bell, Settings, X, Target, Dumbbell, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="text-white hover:bg-orange-500/20 hover:text-orange-400 transition-colors font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            
            <h1 className="text-lg font-semibold">Notifications</h1>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-gray-800/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
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
                <div>
                  <h3 className="text-white font-medium">Motivational Messages</h3>
                  <p className="text-gray-400 text-sm">Get encouraging workout reminders</p>
                </div>
                <Button
                  variant={enableMotivational ? "default" : "outline"}
                  size="sm"
                  onClick={toggleMotivationalNotifications}
                  className={enableMotivational 
                    ? "bg-orange-500 hover:bg-orange-600" 
                    : "border-gray-600 text-gray-400 hover:bg-gray-800"
                  }
                >
                  {enableMotivational ? 'Enabled' : 'Enable'}
                </Button>
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
            <p className="text-gray-400 text-lg mb-4">
              {enableMotivational 
                ? "No new notifications right now."
                : "Enable motivational messages to get workout reminders."
              }
            </p>
            {!enableMotivational && (
              <Button
                onClick={toggleMotivationalNotifications}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                Enable Motivational Messages
              </Button>
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
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-medium">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                        <p className="text-gray-500 text-xs">
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-orange-400 hover:bg-orange-500/20 text-xs"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:bg-red-500/20 hover:text-red-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {notification.actionable && (
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => navigate('/app')}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-xs"
                      >
                        Start Workout
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
