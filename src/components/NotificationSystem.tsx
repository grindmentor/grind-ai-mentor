
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

    // Initialize with some default notifications with easter eggs
    const defaultNotifications: Notification[] = [
      {
        id: '1',
        title: 'Stay Hydrated! 💧',
        message: 'Remember: proper hydration improves performance by up to 15% according to sports science research',
        type: 'hydration',
        timestamp: new Date(),
        read: false,
        icon: <Droplets className="w-4 h-4" />
      },
      {
        id: '2',
        title: 'Training Time 🔥',
        message: 'Your scheduled workout starts in 30 minutes. Progressive overload awaits!',
        type: 'training',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        icon: <Dumbbell className="w-4 h-4" />
      },
      {
        id: '3',
        title: 'Science Easter Egg 🧬',
        message: 'Did you know? Muscle protein synthesis peaks 1-3 hours post-workout and remains elevated for up to 48 hours!',
        type: 'module',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        icon: <Sparkles className="w-4 h-4" />
      }
    ];

    setNotifications(defaultNotifications);

    // Set up hydration reminders every 2 hours with easter eggs
    const hydrationInterval = setInterval(() => {
      const easterEggs = [
        'Fun fact: Your muscles are 75% water! Stay hydrated for optimal performance.',
        'Research shows: Even 2% dehydration can reduce performance by 10-15%.',
        'Pro tip: Pre-hydrating 2-3 hours before training is more effective than drinking during.',
        'Science nugget: Proper hydration helps maintain blood volume for better nutrient delivery.'
      ];
      
      addNotification({
        title: 'Hydration Reminder 💧',
        message: easterEggs[Math.floor(Math.random() * easterEggs.length)],
        type: 'hydration',
        icon: <Droplets className="w-4 h-4" />
      });
    }, 2 * 60 * 60 * 1000);

    return () => {
      clearInterval(hydrationInterval);
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
      case 'hydration': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'training': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'module': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'reminder': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'achievement': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Enhanced Notification Bell with better visibility */}
      <div className="relative">
        <SmoothButton
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-gray-900/90 backdrop-blur-sm border-2 border-orange-500/50 hover:bg-gray-800/90 hover:border-orange-400/70 shadow-xl shadow-orange-500/20 transition-all duration-300"
          size="sm"
        >
          <Bell className="w-5 h-5 text-orange-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0 animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </SmoothButton>

        {/* Enhanced Notifications Panel */}
        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto bg-gray-900/95 backdrop-blur-md border border-orange-500/30 rounded-xl shadow-2xl shadow-orange-500/20 animate-fade-in">
            <div className="p-4 border-b border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-orange-400" />
                  Notifications
                </h3>
                <SmoothButton
                  onClick={() => setShowNotifications(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50"
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
                    className={`p-4 border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-orange-500/5 border-l-4 border-l-orange-500/50' : ''
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
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
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
