import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

// Routes that should show the bottom navigation
const BOTTOM_NAV_ROUTES = [
  '/app',
  '/modules',
  '/physique-ai-dashboard',
  '/profile',
  '/settings',
  '/usage'
];

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showBottomNav = true 
}) => {
  const location = useLocation();
  
  const shouldShowBottomNav = showBottomNav && BOTTOM_NAV_ROUTES.some(
    route => location.pathname === route || location.pathname.startsWith(route + '/')
  );

  return (
    <div className="min-h-screen bg-background">
      <main className={cn(
        "min-h-screen",
        shouldShowBottomNav && "pb-20"
      )}>
        {children}
      </main>
      {shouldShowBottomNav && <BottomTabBar />}
    </div>
  );
};

export default AppLayout;
