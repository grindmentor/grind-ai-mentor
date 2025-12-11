import React, { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

// Routes that should show the bottom navigation - comprehensive list
const BOTTOM_NAV_ROUTES = new Set([
  '/app',
  '/modules',
  '/progress-hub-dashboard',
  '/progress-hub',
  '/profile',
  '/settings',
  '/usage',
  '/notifications',
  '/workout-logger',
  '/smart-food-log',
  '/blueprint-ai',
  '/exercise-database',
  '/research',
  '/physique-ai',
  '/coach-gpt',
  '/meal-plan-ai',
  '/recovery-coach',
  '/smart-training',
  '/habit-tracker',
  '/tdee-calculator',
  '/cut-calc-pro',
  '/workout-timer',
  '/create-goal',
  '/add-food',
  '/create-exercise'
]);

// Routes that should NEVER show bottom nav (special purpose flows)
const NO_NAV_ROUTES = new Set([
  '/onboarding',
  '/signin',
  '/signup',
  '/pricing',
  '/auth/callback',
  '/'
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
    
    // Show on route prefixes for all app sections
    const showOnPrefixes = [
      '/app', 
      '/modules', 
      '/progress', 
      '/profile', 
      '/settings',
      '/workout',
      '/exercise',
      '/smart',
      '/blueprint',
      '/physique',
      '/coach',
      '/meal',
      '/recovery',
      '/habit',
      '/tdee',
      '/cut',
      '/research'
    ];
    if (showOnPrefixes.some(prefix => path.startsWith(prefix))) return true;
    
    // Default to showing on authenticated routes (not landing page or auth)
    if (path.startsWith('/signin') || path.startsWith('/signup')) {
      return false;
    }
    
    return true;
  }, [showBottomNav, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <main className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        shouldShowBottomNav && "pb-[calc(80px+env(safe-area-inset-bottom))]"
      )}>
        {children}
      </main>
      {shouldShowBottomNav && <BottomTabBar />}
    </div>
  );
};

export const AppLayout = memo(AppLayoutComponent);
export default AppLayout;