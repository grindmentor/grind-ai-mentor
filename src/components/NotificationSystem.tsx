
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
    // Queue system - show one at a time with smooth transitions
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      
      // Only update if we don't have a current notification or if the latest is different
      if (!currentNotification || currentNotification.id !== latestNotification.id) {
        // If we have a current notification, remove it first
        if (currentNotification) {
          setCurrentNotification(null);
          setTimeout(() => {
            setCurrentNotification(latestNotification);
          }, 150); // Short delay for smooth transition
        } else {
          setCurrentNotification(latestNotification);
        }
        
        // Auto-remove after duration (reduced for better UX)
        if (latestNotification.duration !== 0) {
          const timeout = setTimeout(() => {
            handleRemove(latestNotification.id);
          }, latestNotification.duration || 3500);
          
          return () => clearTimeout(timeout);
        }
      }
    } else if (notifications.length === 0) {
      setCurrentNotification(null);
    }
  }, [notifications, currentNotification?.id]);

  const handleRemove = (id: string) => {
    setCurrentNotification(null);
    onRemove(id);
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
    <div 
      className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4 sm:max-w-md pointer-events-none"
      style={{
        top: 'max(env(safe-area-inset-top, 20px), 20px)',
        zIndex: 10000 // Higher than any other component
      }}
    >
      <div 
        className={`
          ${getColor(currentNotification.type)}
          rounded-xl border backdrop-blur-md shadow-2xl p-4
          animate-in slide-in-from-top-2 duration-300 ease-out
          mobile-notification-item pointer-events-auto
          transform hover:scale-[1.02] transition-transform
          mx-auto
        `}
      >
        <div className="flex items-start space-x-3">
          <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base leading-tight">{currentNotification.title}</h4>
            <p className="text-xs sm:text-sm opacity-90 mt-1 leading-relaxed">{currentNotification.message}</p>
            {currentNotification.action && (
              <Button
                onClick={currentNotification.action.onClick}
                size="sm"
                variant="outline"
                className="mt-3 h-8 text-xs font-medium bg-white/10 hover:bg-white/20 border-white/30"
              >
                {currentNotification.action.label}
              </Button>
            )}
          </div>
          <Button
            onClick={() => handleRemove(currentNotification.id)}
            size="sm"
            variant="ghost"
            className="text-current hover:bg-white/20 p-1.5 h-7 w-7 flex-shrink-0 rounded-lg transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
