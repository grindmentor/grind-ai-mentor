
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
import { OptimizedSuspense } from '@/components/ui/optimized-suspense';
import { ComprehensiveErrorBoundary } from '@/components/ui/comprehensive-error-boundary';
import { NativeAppWrapper } from '@/components/ui/native-app-wrapper';
import { DashboardWrapper } from '@/components/DashboardWrapper';

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
  
  // Initialize component preloading
  usePreloadComponents();

  useEffect(() => {
    console.log('[APP PAGE] Initializing...');
    
    try {
      // Initialize component preloading
      initializePreloading();
      console.log('[APP PAGE] Preloading initialized');

      // Initialize push notifications and background sync
      const initializeServices = async () => {
        try {
          console.log('[APP PAGE] Initializing services...');
          
          // Initialize push notifications
          const pushInitialized = await pushNotificationService.initialize();
          if (pushInitialized) {
            console.log('[APP PAGE] Push notifications initialized');
            
            // Setup iOS-specific notifications if on iOS
            await pushNotificationService.setupIOSNotifications();
            
            // Request permission if not already granted
            const permission = await pushNotificationService.requestPermission();
            if (permission === 'granted') {
              console.log('[APP PAGE] Push notifications enabled');
            }
          }

          // Initialize background sync (already singleton)
          console.log('[APP PAGE] Background sync service initialized');
          
        } catch (error) {
          console.error('[APP PAGE] Failed to initialize services:', error);
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
    } catch (error) {
      console.error('[APP PAGE] Initialization error:', error);
    }
  }, []);

  console.log('[APP PAGE] Rendering...');

  return (
    <NativeAppWrapper enableHaptics={true} enableGestures={true}>
      <AppBackground>
        <div className="h-full">
          <PWAHandler />
          <DashboardWrapper>
            <OptimizedSuspense fallback={<BrandedLoading message="Loading Dashboard..." />}>
              <Dashboard />
            </OptimizedSuspense>
          </DashboardWrapper>
        </div>
      </AppBackground>
    </NativeAppWrapper>
  );
}
