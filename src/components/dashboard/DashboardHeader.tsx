
import React, { memo, useState } from 'react';
import { Bell, Settings, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LowDataToggle } from '@/components/ui/low-data-toggle';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NotificationCenter from '@/components/NotificationCenter';
import Logo from '@/components/ui/logo';

const DashboardHeader = memo(() => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { lowDataMode } = usePerformanceContext();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
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

          {/* Right Side Logo */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            {/* Logo on the right */}
            <Logo size="sm" showText={false} className="flex-shrink-0" />
            
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
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              aria-label="Notifications"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></span>
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => window.location.href = '/profile'}
              aria-label="Profile"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => window.location.href = '/settings'}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Mobile Menu - only on very small screens */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200 sm:hidden"
                aria-label="Menu"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Center Sheet */}
      <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-black/95 backdrop-blur-md border-l border-gray-800/50">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-400" />
                Notifications
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => setIsNotificationOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-6">
            <NotificationCenter />
            <div className="mt-6 pt-4 border-t border-gray-800/50">
              <Button
                onClick={() => setIsNotificationOpen(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";

export { DashboardHeader };
