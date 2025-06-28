
import React, { Suspense } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { AppBackground } from '@/components/ui/app-background';

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
