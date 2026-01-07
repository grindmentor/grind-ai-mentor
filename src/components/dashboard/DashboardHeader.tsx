
import React, { memo, useState } from 'react';
import { Bell, Settings, Menu, X, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LowDataToggle } from '@/components/ui/low-data-toggle';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import NotificationCenter from '@/components/NotificationCenter';
import Logo from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { lowDataMode } = usePerformanceContext();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo/Brand - Left Side */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Logo size="sm" showText={!isMobile} className="flex-shrink-0" />
            {isMobile && (
              <span className="text-base font-bold text-transparent bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text whitespace-nowrap tracking-wide font-mono">
                Myotopia
              </span>
            )}
          </div>

          {/* Center Navigation - Desktop Only */}
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
                onClick={() => navigate('/modules')}
                aria-label="Module Library"
              >
                <Library className="w-4 h-4 mr-2" />
                Module Library
              </Button>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            {/* Module Library - Mobile - ALWAYS VISIBLE */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="mobile-nav-button p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => navigate('/modules')}
                aria-label="Module Library"
              >
                <Library className="w-5 h-5" />
              </Button>
            )}
            
            {/* Low Data Toggle - only show if not in low data mode or on mobile */}
            {(!lowDataMode || !isMobile) && (
              <div className="hidden sm:block">
                <LowDataToggle />
              </div>
            )}

            {/* Notifications - Bell icon only with functional click */}
            <Button
              variant="ghost"
              size="sm"
              className="mobile-nav-button relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Notifications"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="mobile-nav-button p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Center Sheet */}
      <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl bg-background/95 backdrop-blur-md border-l border-border p-0">
          <div className="h-full">
            <NotificationCenter onBack={() => setIsNotificationOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";

export { DashboardHeader };
