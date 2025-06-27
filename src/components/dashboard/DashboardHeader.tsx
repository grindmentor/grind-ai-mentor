
import React, { memo } from 'react';
import { Bell, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LowDataToggle } from '@/components/ui/low-data-toggle';
import { usePerformanceContext } from '@/components/ui/performance-provider';

const DashboardHeader = memo(() => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { lowDataMode } = usePerformanceContext();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">M</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white whitespace-nowrap tracking-wide font-serif">
                Myotopia
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            {/* Low Data Toggle - only show if not in low data mode or on mobile */}
            {(!lowDataMode || !isMobile) && (
              <div className="hidden sm:block">
                <LowDataToggle />
              </div>
            )}

            {/* Notifications - Bell icon only */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              aria-label="Notifications"
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
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";

export { DashboardHeader };
