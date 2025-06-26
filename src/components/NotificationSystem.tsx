
import React, { useState, useEffect } from 'react';
import { Bell, X, Droplets, Dumbbell, Sparkles, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SmoothButton } from '@/components/ui/smooth-button';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'hydration' | 'training' | 'module' | 'reminder' | 'achievement';
  timestamp: Date;
  read: boolean;
  icon: React.ReactNode;
}

const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Initialize with some default notifications
    const defaultNotifications: Notification[] = [
      {
        id: '1',
        title: 'Stay Hydrated!',
        message: 'Remember to drink water throughout your workout',
        type: 'hydration',
        timestamp: new Date(),
        read: false,
        icon: <Droplets className="w-4 h-4" />
      },
      {
        id: '2',
        title: 'Training Time',
        message: 'Your scheduled workout starts in 30 minutes',
        type: 'training',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        icon: <Dumbbell className="w-4 h-4" />
      },
      {
        id: '3',
        title: 'New Module Available',
        message: 'Check out the updated Workout Library with new exercises',
        type: 'module',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        icon: <Sparkles className="w-4 h-4" />
      }
    ];

    setNotifications(defaultNotifications);

    // Set up hydration reminders every 2 hours
    const hydrationInterval = setInterval(() => {
      addNotification({
        title: 'Hydration Reminder',
        message: 'Time to drink some water! Stay hydrated for optimal performance.',
        type: 'hydration',
        icon: <Droplets className="w-4 h-4" />
      });
    }, 2 * 60 * 60 * 1000);

    // Set up daily training reminder
    const now = new Date();
    const tomorrow6PM = new Date();
    tomorrow6PM.setDate(now.getDate() + 1);
    tomorrow6PM.setHours(18, 0, 0, 0);
    
    const timeUntilReminder = tomorrow6PM.getTime() - now.getTime();
    const trainingTimeout = setTimeout(() => {
      addNotification({
        title: 'Training Reminder',
        message: 'Your scheduled workout is starting soon. Time to get moving!',
        type: 'training',
        icon: <Dumbbell className="w-4 h-4" />
      });
    }, timeUntilReminder);

    return () => {
      clearInterval(hydrationInterval);
      clearTimeout(trainingTimeout);
    };
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep max 10 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'hydration': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'training': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'module': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'reminder': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'achievement': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell */}
      <div className="relative">
        <SmoothButton
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/80"
          size="sm"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </SmoothButton>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                <SmoothButton
                  onClick={() => setShowNotifications(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </SmoothButton>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors ${
                      !notification.read ? 'bg-gray-800/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                            className="text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;
