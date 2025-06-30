
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Show only one notification at a time
    if (notifications.length > 0 && !currentNotification) {
      const nextNotification = notifications[0];
      setCurrentNotification(nextNotification);
      
      // Auto-remove after duration
      if (nextNotification.duration !== 0) {
        const timeout = setTimeout(() => {
          handleRemove(nextNotification.id);
        }, nextNotification.duration || 5000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [notifications, currentNotification]);

  const handleRemove = (id: string) => {
    setCurrentNotification(null);
    onRemove(id);
    
    // Show next notification after a brief delay
    setTimeout(() => {
      const remaining = notifications.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setCurrentNotification(remaining[0]);
      }
    }, 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return Check;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/90 border-green-400/50 text-green-50';
      case 'error': return 'bg-red-500/90 border-red-400/50 text-red-50';
      case 'warning': return 'bg-yellow-500/90 border-yellow-400/50 text-yellow-50';
      default: return 'bg-blue-500/90 border-blue-400/50 text-blue-50';
    }
  };

  if (!currentNotification) return null;

  const IconComponent = getIcon(currentNotification.type);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 sm:max-w-md">
      <div 
        className={`
          ${getColor(currentNotification.type)}
          rounded-lg border backdrop-blur-sm shadow-lg p-4
          animate-in slide-in-from-top-2 duration-300
          mobile-notification-item
        `}
      >
        <div className="flex items-start space-x-3">
          <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base">{currentNotification.title}</h4>
            <p className="text-xs sm:text-sm opacity-90 mt-1">{currentNotification.message}</p>
            {currentNotification.action && (
              <Button
                onClick={currentNotification.action.onClick}
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs"
              >
                {currentNotification.action.label}
              </Button>
            )}
          </div>
          <Button
            onClick={() => handleRemove(currentNotification.id)}
            size="sm"
            variant="ghost"
            className="text-current hover:bg-white/20 p-1 h-6 w-6 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
