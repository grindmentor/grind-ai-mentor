import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobileEnhancements } from '@/hooks/useMobileEnhancements';

interface NativeNavigationProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export const NativeNavigation: React.FC<NativeNavigationProps> = ({
  title,
  subtitle,
  showBackButton = true,
  showCloseButton = false,
  onBack,
  onClose,
  actions,
  className,
  transparent = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const { hapticFeedback, safeArea } = useMobileEnhancements();

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [location]);

  const handleBack = () => {
    hapticFeedback('light');
    if (onBack) {
      onBack();
    } else if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/app');
    }
  };

  const handleClose = () => {
    hapticFeedback('light');
    if (onClose) {
      onClose();
    } else {
      navigate('/app');
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border/50",
        transparent 
          ? "bg-background/80 backdrop-blur-md" 
          : "bg-background",
        "transition-all duration-300",
        className
      )}
      style={{
        paddingTop: safeArea.top,
      }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center min-w-0 flex-1">
          {showBackButton && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 mr-2 -ml-2 rounded-full",
                "touch-manipulation no-tap-highlight",
                "hover:bg-accent/50 active:bg-accent/70",
                "transition-colors duration-150"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-semibold text-foreground truncate",
              subtitle ? "text-base leading-tight" : "text-lg"
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-1">
          {actions}
          
          {showCloseButton && (
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 ml-2 rounded-full",
                "touch-manipulation no-tap-highlight",
                "hover:bg-accent/50 active:bg-accent/70",
                "transition-colors duration-150"
              )}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};