
import React, { Suspense } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePerformanceContext } from '@/components/ui/performance-provider';

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
    <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
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
    </div>
  );
}
