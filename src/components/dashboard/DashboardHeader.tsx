
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              {!isMobile && (
                <span className="text-xl font-bold text-white">Myotopia</span>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Low Data Toggle - only show if not in low data mode or on mobile */}
            {(!lowDataMode || !isMobile) && (
              <div className="hidden sm:block">
                <LowDataToggle />
              </div>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => window.location.href = '/profile'}
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              onClick={() => window.location.href = '/settings'}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Mobile Menu - only on very small screens */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200 sm:hidden"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
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
