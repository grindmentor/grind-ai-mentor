
import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/logo';

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onBack,
  showNotifications = false,
  onNotificationsClick
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            {!onBack && (
              <div className="flex-shrink-0">
                <Logo size={isMobile ? "sm" : "md"} />
              </div>
            )}
            
            <h1 className="font-bold text-foreground truncate text-lg sm:text-xl">
              {title}
            </h1>
          </div>

          {showNotifications && (
            <Button
              onClick={onNotificationsClick}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 flex-shrink-0"
            >
              <Bell className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
