
import React, { Suspense, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { AppBackground } from '@/components/ui/app-background';
import { pushNotificationService } from '@/services/pushNotificationService';

// Optimized lazy loading with preloading hints
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

  useEffect(() => {
    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        const initialized = await pushNotificationService.initialize();
        if (initialized) {
          // Setup iOS-specific notifications if on iOS
          await pushNotificationService.setupIOSNotifications();
          
          // Request permission if not already granted
          const permission = await pushNotificationService.requestPermission();
          if (permission === 'granted') {
            console.log('Push notifications enabled');
          }
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializePushNotifications();
  }, []);

  return (
    <AppBackground>
      <Suspense 
        fallback={
          <LoadingScreen 
            message={lowDataMode ? "Loading (Power Saver Mode)" : "Loading Myotopia..."} 
          />
        }
      >
        {measurePerformance('Dashboard Render', () => (
          <Dashboard />
        ))}
      </Suspense>
    </AppBackground>
  );
}
