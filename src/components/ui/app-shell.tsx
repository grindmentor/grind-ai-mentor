import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PWAStatus from '@/components/PWAStatus';
import { SmoothPageTransition } from './smooth-page-transition';
import { Badge } from '@/components/ui/badge';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showNotificationButton?: boolean;
  customActions?: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  showBackButton = false,
  showNotificationButton = true,
  customActions,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [notificationCount] = useState(2); // Mock notification count

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [location]);

  const handleBack = useCallback(() => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/app');
    }
  }, [canGoBack, navigate]);

  // Handle mobile swipe-to-go-back
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTracking = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientX < 50) { // Only if starting from left edge
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isTracking = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTracking) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = Math.abs(endY - startY);

      // Swipe right from left edge with minimal vertical movement
      if (deltaX > 100 && deltaY < 50 && canGoBack) {
        handleBack();
      }
      
      isTracking = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canGoBack, handleBack]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Persistent Top Navigation */}
      <motion.header 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 w-8 p-0 hover:scale-105 transition-transform"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
              </Button>
            )}
            
            {title && (
              <motion.h1 
                className="text-lg font-semibold truncate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PWAStatus />
            
            {showNotificationButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app?notifications=true')}
                className="h-8 w-8 p-0 relative hover:scale-105 transition-transform"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="h-8 w-8 p-0 hover:scale-105 transition-transform"
            >
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Button>

            {customActions}
          </div>
        </div>
      </motion.header>

      {/* Main Content Area with Smooth Transitions */}
      <main className={`flex-1 overflow-hidden ${className}`}>
        <SmoothPageTransition routeKey={location.pathname + location.search}>
          <div className="h-full overflow-auto">
            {children}
          </div>
        </SmoothPageTransition>
      </main>
    </div>
  );
};