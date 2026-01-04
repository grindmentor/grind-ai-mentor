import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { preloadRoute } from '@/utils/routePreloader';

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'blur';
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onBack,
  showNotifications = false,
  onNotificationsClick,
  rightElement,
  variant = 'default',
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const headerHeight = 56;
  
  const variantStyles = {
    default: 'bg-background/95 backdrop-blur-xl border-b border-border/40',
    transparent: 'bg-transparent',
    blur: 'bg-background/80 backdrop-blur-2xl saturate-150'
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // Check for returnTo state passed during navigation
    const state = location.state as { returnTo?: string } | null;
    if (state?.returnTo) {
      void preloadRoute(state.returnTo);
      navigate(state.returnTo);
      return;
    }

    // Use browser history if available (more than just the current page)
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback to modules page, not dashboard
      void preloadRoute('/modules');
      navigate('/modules');
    }
  };
  
  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          variantStyles[variant],
          className
        )}
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <div className="h-14 px-2 flex items-center justify-between">
          {/* Left - Back button */}
          <div className="w-12 flex items-center justify-start">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0 rounded-full text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px] min-w-[44px]"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
          
          {/* Center - Title */}
          <h1 className="flex-1 text-center font-semibold text-foreground truncate text-base tracking-tight">
            {title}
          </h1>
          
          {/* Right - Actions or spacer */}
          <div className="w-12 flex items-center justify-end">
            {rightElement}
            {showNotifications && !rightElement && (
              <Button
                onClick={onNotificationsClick}
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 rounded-full text-muted-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px] min-w-[44px]"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div 
        className="w-full flex-shrink-0" 
        style={{ 
          height: `calc(${headerHeight}px + env(safe-area-inset-top))`,
          minHeight: `${headerHeight}px`
        }} 
      />
    </>
  );
};

export default MobileHeader;