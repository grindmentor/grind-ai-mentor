
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateToPage = (path: string) => {
    window.location.href = path;
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo/Brand - Left Side */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Logo size="sm" showText={!isMobile} className="flex-shrink-0" />
            {isMobile && (
              <span className="text-sm sm:text-base font-bold text-transparent bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text whitespace-nowrap tracking-wide font-mono truncate">
                Myotopia
              </span>
            )}
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => navigateToPage('/modules')}
            >
              Modules
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => navigateToPage('/profile')}
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => navigateToPage('/settings')}
            >
              Settings
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
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

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-black/95 backdrop-blur-md border-l border-gray-800/50">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white">Menu</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Button
              onClick={() => navigateToPage('/modules')}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800/50"
            >
              Module Library
            </Button>
            <Button
              onClick={() => navigateToPage('/profile')}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800/50"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              onClick={() => navigateToPage('/settings')}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <div className="pt-4 border-t border-gray-800/50">
              <LowDataToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
