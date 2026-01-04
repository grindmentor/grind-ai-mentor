import React, { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

// SINGLE SOURCE OF TRUTH: BottomTabBar visibility rules
// Show on: main destinations (home/modules/progress/profile) + top-level modules
// Hide on: subflows, auth, landing, detail pages

// Main destinations - ALWAYS show
const MAIN_DESTINATIONS = new Set([
  '/app',
  '/modules',
  '/progress-hub-dashboard',
  '/progress-hub',
  '/profile',
  '/settings',
  '/notifications',
  '/usage'
]);

// Top-level modules - show (user can navigate away via tabs)
const TOP_LEVEL_MODULES = new Set([
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
  '/workout-timer'
]);

// Subflows / detail pages - NEVER show (focused task, back to return)
const SUBFLOW_ROUTES = new Set([
  '/create-goal',
  '/add-food',
  '/create-exercise',
  '/onboarding',
  '/signin',
  '/signup',
  '/pricing',
  '/auth/callback',
  '/',
  '/terms',
  '/privacy',
  '/about',
  '/faq',
  '/support'
]);

// Detail page prefixes - NEVER show
const DETAIL_PREFIXES = [
  '/workout-detail',
  '/exercise-detail',
  '/exercise/'
];

const AppLayoutComponent: React.FC<AppLayoutProps> = ({ 
  children, 
  showBottomNav = true 
}) => {
  const location = useLocation();
  
  const shouldShowBottomNav = useMemo(() => {
    if (!showBottomNav) return false;
    const path = location.pathname;
    
    // 1. Never show on explicit subflow routes
    if (SUBFLOW_ROUTES.has(path)) return false;
    
    // 2. Never show on detail pages (workout/exercise details)
    if (DETAIL_PREFIXES.some(prefix => path.startsWith(prefix))) return false;
    
    // 3. Always show on main destinations
    if (MAIN_DESTINATIONS.has(path)) return true;
    
    // 4. Always show on top-level modules
    if (TOP_LEVEL_MODULES.has(path)) return true;
    
    // 5. Default: hide (safer - prevents random appearance)
    return false;
  }, [showBottomNav, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className={cn(
        "flex-1 overflow-x-hidden w-full",
        shouldShowBottomNav && "pb-[calc(80px+env(safe-area-inset-bottom))]"
      )}>
        {/* Content wrapper for consistent max-width on larger screens */}
        <div className="w-full max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      {shouldShowBottomNav && <BottomTabBar />}
    </div>
  );
};

export const AppLayout = memo(AppLayoutComponent);
export default AppLayout;