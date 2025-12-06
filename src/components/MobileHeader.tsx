import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const headerHeight = 56;
  
  const variantStyles = {
    default: 'bg-background/95 backdrop-blur-xl border-b border-border/40',
    transparent: 'bg-transparent',
    blur: 'bg-background/80 backdrop-blur-2xl saturate-150'
  };
  
  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          variantStyles[variant],
          className
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between">
          {/* Left - Back button or spacer */}
          <div className="w-12 flex items-center justify-start">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full text-foreground hover:bg-muted/50 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Center - Title */}
          <h1 className="flex-1 text-center font-semibold text-foreground truncate text-[15px] tracking-tight">
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
                className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:bg-muted/50 active:scale-95 transition-all"
              >
                <Bell className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div 
        className="w-full" 
        style={{ 
          height: `calc(${headerHeight}px + env(safe-area-inset-top))`,
          minHeight: `${headerHeight}px`
        }} 
      />
    </>
  );
};

export default MobileHeader;
