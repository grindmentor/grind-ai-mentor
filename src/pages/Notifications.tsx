
import { useState } from 'react';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to Myotopia!',
      message: 'Your fitness journey begins now. Explore our science-backed modules to achieve your goals.',
      type: 'info',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '2',
      title: 'Workout Complete',
      message: 'Great job on completing your upper body workout! Your progress has been saved.',
      type: 'success',
      timestamp: '1 day ago',
      read: true
    },
    {
      id: '3',
      title: 'New Research Available',
      message: 'Check out the latest findings on protein timing and muscle growth.',
      type: 'info',
      timestamp: '3 days ago',
      read: false
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-orange-400" />
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800/50"
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h2>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 cursor-pointer transition-all hover:bg-gray-900/60 ${
                    !notification.read ? 'border-orange-500/30 bg-orange-900/10' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
