import React, { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

// Routes that should show the bottom navigation
const BOTTOM_NAV_ROUTES = new Set([
  '/app',
  '/modules',
  '/progress-hub-dashboard',
  '/profile',
  '/settings',
  '/usage'
]);

const AppLayoutComponent: React.FC<AppLayoutProps> = ({ 
  children, 
  showBottomNav = true 
}) => {
  const location = useLocation();
  
  const shouldShowBottomNav = useMemo(() => {
    if (!showBottomNav) return false;
    const path = location.pathname;
    return BOTTOM_NAV_ROUTES.has(path) || 
      Array.from(BOTTOM_NAV_ROUTES).some(route => path.startsWith(route + '/'));
  }, [showBottomNav, location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
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
