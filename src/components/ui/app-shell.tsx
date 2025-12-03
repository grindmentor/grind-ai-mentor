import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SmoothPageTransition } from './smooth-page-transition';

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
  showNotificationButton = false,
  customActions,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [location]);

  const handleBack = useCallback(() => {
    // Navigate to dashboard instead of browser history
    navigate('/app');
  }, [navigate]);

  // Handle mobile swipe-to-go-back
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTracking = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientX < 50) {
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header - no sliding animation */}
      <header className="shrink-0 bg-background border-b border-border safe-area-top z-50">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {showBackButton && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors shrink-0"
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
        </div>
      </header>

      {/* Main Content - contained scrolling */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${className} safe-area-bottom`}>
        <SmoothPageTransition routeKey={location.pathname + location.search}>
          <div className="px-4 sm:px-6 lg:px-8 pb-4">
            {children}
          </div>
        </SmoothPageTransition>
      </main>
    </div>
  );
};
