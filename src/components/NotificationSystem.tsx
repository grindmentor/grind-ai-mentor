
import React, { useState, useEffect } from 'react';
import { Bell, X, Droplets, Dumbbell, Sparkles, Clock, Target, Trash2 } from 'lucide-react';
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
  dismissed?: boolean;
}

const NotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    // Only show real notifications - no placeholder data for new users
    setNotifications([]);

    // Set up hydration reminders every 4 hours (reduced frequency)
    const hydrationInterval = setInterval(() => {
      if (notifications.length < 5) { // Limit notifications
        addNotification({
          title: 'Stay Hydrated',
          message: 'Remember to drink water for optimal performance.',
          type: 'hydration',
          icon: <Droplets className="w-4 h-4" />
        });
      }
    }, 4 * 60 * 60 * 1000);

    return () => {
      clearInterval(hydrationInterval);
    };
  }, [user, notifications.length]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      dismissed: false
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

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    const touch = e.touches[0];
    setSwipeStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (!swipeStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;
    
    // Check for upward or sideways swipe (at least 50px)
    if (Math.abs(deltaY) > 50 && deltaY < 0) {
      // Swipe up
      dismissNotification(id);
    } else if (Math.abs(deltaX) > 50) {
      // Swipe left or right
      dismissNotification(id);
    }
    
    setSwipeStart(null);
  };

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'hydration': return 'text-blue-400 bg-blue-500/30 border-blue-500/50';
      case 'training': return 'text-orange-400 bg-orange-500/30 border-orange-500/50';
      case 'module': return 'text-purple-400 bg-purple-500/30 border-purple-500/50';
      case 'reminder': return 'text-green-400 bg-green-500/30 border-green-500/50';
      case 'achievement': return 'text-yellow-400 bg-yellow-500/30 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-500/30 border-gray-500/50';
    }
  };

  if (!user) return null;

  return (
    <div className="fixed top-0 right-0 z-50 p-4 pt-safe-top">
      {/* Enhanced notification bell with safe area consideration */}
      <div className="relative">
        <SmoothButton
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-black/90 backdrop-blur-md border border-orange-500/40 hover:bg-black hover:border-orange-400/60 shadow-2xl transition-all duration-300 w-14 h-14 p-0 rounded-full"
          size="sm"
        >
          <Bell className="w-6 h-6 text-orange-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs min-w-[20px] h-6 flex items-center justify-center p-0 text-[11px] font-bold animate-pulse shadow-lg">
              {unreadCount}
            </Badge>
          )}
        </SmoothButton>

        {/* Enhanced notifications panel with better mobile support */}
        {showNotifications && (
          <div className="absolute top-16 right-0 w-80 sm:w-96 max-h-[70vh] overflow-y-auto bg-black/95 backdrop-blur-md border border-orange-500/30 rounded-xl shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-orange-500/20 bg-black/90">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-400" />
                  Notifications
                </h3>
                <SmoothButton
                  onClick={() => setShowNotifications(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-orange-500/20 w-10 h-10 p-0 rounded-full"
                >
                  <X className="w-5 h-5" />
                </SmoothButton>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-black/50">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No notifications</p>
                  <p className="text-sm opacity-75">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-orange-500/10 hover:bg-black/60 transition-all duration-200 cursor-pointer relative ${
                      !notification.read ? 'bg-orange-500/15 border-l-4 border-l-orange-500' : 'bg-black/30'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                    onTouchStart={(e) => handleTouchStart(e, notification.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 border ${getNotificationColor(notification.type)}`}>
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`text-sm font-semibold leading-tight ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/20"
                              title="Remove notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-700/50"
                              title="Close"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-orange-400/60">
                            Swipe to dismiss
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-orange-500/10 bg-black/70">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2 rounded-md hover:bg-orange-500/20 font-medium"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;
