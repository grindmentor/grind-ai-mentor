import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, RefreshCw } from 'lucide-react';

interface NotificationData {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'sync';
  duration?: number;
}

interface NotificationSystemProps {
  addNotification: (notification: Omit<NotificationData, 'id'>) => void;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [syncCount, setSyncCount] = useState(0);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    // Prevent multiple sync notifications per session
    if (notification.type === 'sync' && syncCount > 0) {
      return;
    }
    
    if (notification.type === 'sync') {
      setSyncCount(prev => prev + 1);
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => {
      // Limit to 3 notifications max to prevent overlap
      const updated = [newNotification, ...prev.slice(0, 2)];
      return updated;
    });

    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration || 3000);
  }, [syncCount]);

  useEffect(() => {
    // Example usage (you can trigger this from anywhere in your app)
    // setTimeout(() => {
    //   addNotification({
    //     title: 'Welcome!',
    //     message: 'Your account has been created successfully.',
    //     type: 'success',
    //     duration: 5000,
    //   });
    // }, 1000);
  }, [addNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 max-w-sm w-full px-4">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { delay: index * 0.1 }
            }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`
              relative p-4 rounded-lg shadow-lg backdrop-blur-sm border
              ${notification.type === 'success' ? 'bg-green-900/90 border-green-500' : ''}
              ${notification.type === 'error' ? 'bg-red-900/90 border-red-500' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-900/90 border-yellow-500' : ''}
              ${notification.type === 'info' ? 'bg-blue-900/90 border-blue-500' : ''}
              ${notification.type === 'sync' ? 'bg-orange-900/90 border-orange-500' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                  {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                  {notification.type === 'sync' && <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{notification.title}</p>
                  {notification.message && (
                    <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
