
import React, { Suspense, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { AppBackground } from '@/components/ui/app-background';
import { AppShell } from '@/components/ui/app-shell';
import { pushNotificationService } from '@/services/pushNotificationService';
import { backgroundSync } from '@/services/backgroundSyncService';
import { initializePreloading } from '@/utils/componentPreloader';
import { BrandedLoading } from '@/components/ui/branded-loading';
import { usePreloadComponents } from '@/hooks/usePreloadComponents';
import PWAHandler from '@/components/PWAHandler';

// Optimized lazy loading with aggressive preloading
const Dashboard = React.lazy(() => 
  import('@/components/Dashboard').then(module => {
    // Aggressively preload critical components in parallel
    Promise.all([
      import('@/components/goals/RealGoalsAchievements').catch(() => {}),
      import('@/components/homepage/LatestResearch').catch(() => {}),
      import('@/components/dashboard/ModuleGrid').catch(() => {}),
      import('@/components/ai-modules/CoachGPT').catch(() => {}),
      import('@/components/ai-modules/WorkoutLoggerAI').catch(() => {}),
    ]);
    return module;
  })
);

export default function App() {
  const { lowDataMode, measurePerformance } = usePerformanceContext();
  
  // Initialize component preloading
  usePreloadComponents();

  useEffect(() => {
    // Initialize component preloading
    initializePreloading();

    // Initialize push notifications and background sync
    const initializeServices = async () => {
      try {
        // Initialize push notifications
        const pushInitialized = await pushNotificationService.initialize();
        if (pushInitialized) {
          // Setup iOS-specific notifications if on iOS
          await pushNotificationService.setupIOSNotifications();
          
          // Request permission if not already granted
          const permission = await pushNotificationService.requestPermission();
          if (permission === 'granted') {
            console.log('Push notifications enabled');
          }
        }

        // Initialize background sync (already singleton)
        console.log('Background sync service initialized');
        
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        initializeServices();
      });
    } else {
      setTimeout(initializeServices, 100);
    }
  }, []);

  return (
    <AppBackground>
      <AppShell
        title="Myotopia"
        showBackButton={false}
        showNotificationButton={true}
        className="h-full"
      >
        <Suspense 
          fallback={
            <BrandedLoading
              message={lowDataMode ? "Loading (Power Saver Mode)" : "Loading Myotopia..."} 
              showLogo={true}
            />
          }
        >
          <PWAHandler />
          {measurePerformance('Dashboard Render', () => (
            <Dashboard />
          ))}
        </Suspense>
      </AppShell>
    </AppBackground>
  );
}
