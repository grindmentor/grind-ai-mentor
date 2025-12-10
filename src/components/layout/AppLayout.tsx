import React, { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

// Routes that should show the bottom navigation - expanded list
const BOTTOM_NAV_ROUTES = new Set([
  '/app',
  '/modules',
  '/progress-hub-dashboard',
  '/profile',
  '/settings',
  '/usage',
  '/notifications',
  '/workout-logger',
  '/smart-food-log',
  '/blueprint-ai',
  '/exercise-database',
  '/progress-hub',
  '/research'
]);

// Routes that should NEVER show bottom nav (special purpose flows)
const NO_NAV_ROUTES = new Set([
  '/onboarding',
  '/signin',
  '/signup',
  '/pricing',
  '/auth/callback'
]);

const AppLayoutComponent: React.FC<AppLayoutProps> = ({ 
  children, 
  showBottomNav = true 
}) => {
  const location = useLocation();
  
  const shouldShowBottomNav = useMemo(() => {
    if (!showBottomNav) return false;
    const path = location.pathname;
    
    // Never show on special routes
    if (NO_NAV_ROUTES.has(path)) return false;
    
    // Show on explicit routes
    if (BOTTOM_NAV_ROUTES.has(path)) return true;
    
    // Show on route prefixes
    const showOnPrefixes = ['/app', '/modules', '/progress', '/profile', '/settings'];
    if (showOnPrefixes.some(prefix => path.startsWith(prefix))) return true;
    
    // Default to showing on authenticated routes (not landing page or auth)
    if (path === '/' || path.startsWith('/signin') || path.startsWith('/signup')) {
      return false;
    }
    
    return true;
  }, [showBottomNav, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <main className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        shouldShowBottomNav && "pb-20"
      )}>
        {children}
      </main>
      {shouldShowBottomNav && <BottomTabBar />}
    </div>
  );
};

export const AppLayout = memo(AppLayoutComponent);
export default AppLayout;
