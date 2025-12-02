import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  rightElement?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onBack,
  showNotifications = false,
  onNotificationsClick,
  rightElement
}) => {
  // Calculate header height for scroll padding
  const headerHeight = 56; // 14 * 4 = 56px (h-14)
  
  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50"
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
                className="h-10 w-10 p-0 rounded-full text-foreground hover:bg-accent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Center - Title */}
          <h1 className="flex-1 text-center font-semibold text-foreground truncate text-base">
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
                className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:bg-accent"
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
