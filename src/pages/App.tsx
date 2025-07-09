
import React, { Suspense, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { AppBackground } from '@/components/ui/app-background';
import { pushNotificationService } from '@/services/pushNotificationService';
import { backgroundSync } from '@/services/backgroundSyncService';
import { initializePreloading } from '@/utils/componentPreloader';
import { BrandedLoading } from '@/components/ui/branded-loading';
import { useModulePreloader } from '@/hooks/useModulePreloader';
import PWAHandler from '@/components/PWAHandler';
import PWAStatus from '@/components/PWAStatus';

// Optimized lazy loading with preloading hints and error boundaries
const Dashboard = React.lazy(() => 
  import('@/components/Dashboard').then(module => {
    // Preload related components while Dashboard is loading
    import('@/components/goals/RealGoalsAchievements').catch(() => {});
    import('@/components/homepage/LatestResearch').catch(() => {});
    return module;
  })
);

export default function App() {
  const { lowDataMode, measurePerformance } = usePerformanceContext();
  const { preloadModule } = useModulePreloader();

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
      <Suspense 
        fallback={
          <BrandedLoading
            message={lowDataMode ? "Loading (Power Saver Mode)" : "Loading Myotopia..."} 
            showLogo={true}
          />
        }
      >
        <PWAHandler />
        <PWAStatus />
        {measurePerformance('Dashboard Render', () => (
          <Dashboard />
        ))}
      </Suspense>
    </AppBackground>
  );
}
