
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

    // Only show real notifications - no placeholder data for new users
    setNotifications([]);

    // Set up hydration reminders every 4 hours (reduced frequency)
    const hydrationInterval = setInterval(() => {
      addNotification({
        title: 'Stay Hydrated',
        message: 'Remember to drink water for optimal performance.',
        type: 'hydration',
        icon: <Droplets className="w-4 h-4" />
      });
    }, 4 * 60 * 60 * 1000);

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
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
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
      {/* Improved notification bell - bigger and more visible */}
      <div className="relative">
        <SmoothButton
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-black/70 backdrop-blur-sm border border-orange-500/30 hover:bg-black/80 hover:border-orange-400/50 shadow-xl transition-all duration-300 w-12 h-12 p-0 rounded-full"
          size="sm"
        >
          <Bell className="w-5 h-5 text-orange-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs min-w-[18px] h-5 flex items-center justify-center p-0 text-[11px] font-semibold animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </SmoothButton>

        {/* Clean notifications panel */}
        {showNotifications && (
          <div className="absolute top-14 right-0 w-80 max-h-96 overflow-y-auto bg-black/95 backdrop-blur-md border border-orange-500/20 rounded-lg shadow-2xl animate-fade-in">
            <div className="p-3 border-b border-orange-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-sm flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-orange-400" />
                  Notifications
                </h3>
                <SmoothButton
                  onClick={() => setShowNotifications(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-orange-500/10 w-6 h-6 p-0"
                >
                  <X className="w-3 h-3" />
                </SmoothButton>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-orange-500/10 hover:bg-orange-500/5 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-orange-500/10 border-l-2 border-l-orange-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-lg ${getNotificationColor(notification.type)}`}>
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
