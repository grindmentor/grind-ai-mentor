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
      if (e.touches[0].clientX < 50) {
        // Only if starting from left edge
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
    document.addEventListener('touchstart', handleTouchStart, {
      passive: true
    });
    document.addEventListener('touchend', handleTouchEnd, {
      passive: true
    });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canGoBack, handleBack]);
  return <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Persistent Top Navigation */}
      <motion.header 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 safe-area-top" 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {showBackButton && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {title}
              </h1>
            )}
          </div>
          
          {customActions && (
            <div className="flex items-center space-x-2 shrink-0">
              {customActions}
            </div>
          )}
          
          {showNotificationButton && !customActions && (
            <Button
              onClick={() => navigate('/notifications')}
              variant="ghost"
              size="sm"
              className="relative text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </motion.header>

      {/* Main Content Area with Smooth Transitions */}
      <main className={`flex-1 overflow-hidden ${className} safe-area-bottom`}>
        <SmoothPageTransition routeKey={location.pathname + location.search}>
          <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </SmoothPageTransition>
      </main>
    </div>;
};