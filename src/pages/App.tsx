
import React, { Suspense } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Lazy load Dashboard for better performance
const Dashboard = React.lazy(() => import('@/components/Dashboard'));

export default function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
      <Suspense fallback={<LoadingScreen message="Loading Myotopia..." />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
