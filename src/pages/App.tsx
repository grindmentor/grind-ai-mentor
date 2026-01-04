
import React, { useEffect } from 'react';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { AppBackground } from '@/components/ui/app-background';
import { pushNotificationService } from '@/services/pushNotificationService';
import { initializePreloading } from '@/utils/componentPreloader';
import { usePreloadComponents } from '@/hooks/usePreloadComponents';
import PWAHandler from '@/components/PWAHandler';
import { NativeAppWrapper } from '@/components/ui/native-app-wrapper';
import { DashboardWrapper } from '@/components/DashboardWrapper';
import Dashboard from '@/components/Dashboard';

export default function App() {
  // Ensure performance context is initialized (low-data mode, perf hooks, etc.)
  usePerformanceContext();
  
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
            <Dashboard />
          </DashboardWrapper>
        </div>
      </AppBackground>
    </NativeAppWrapper>
  );
}
