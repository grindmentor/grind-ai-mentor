
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import ModulesProvider from "@/contexts/ModulesContext";
import { UsageProvider } from "@/contexts/UsageContext";
import { PerformanceProvider } from '@/components/ui/performance-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { bundleOptimizer, SmartPreloader } from '@/services/bundleOptimizationService';

// Optimized lazy loading with preloading hints
const Index = React.lazy(() => 
  import('@/pages/Index').then(module => {
    // Preload likely next routes
    SmartPreloader.getInstance().preloadForRoute('/');
    return module;
  })
);

const Dashboard = React.lazy(() => 
  import('@/components/Dashboard').then(module => {
    // Preload related components
    import('@/components/goals/RealGoalsAchievements').catch(() => {});
    import('@/components/NotificationCenter').catch(() => {});
    return module;
  })
);

// Other lazy loaded routes with minimal bundle impact
const SignIn = React.lazy(() => import('@/pages/SignIn'));
const SignUp = React.lazy(() => import('@/pages/SignUp'));
const AuthCallback = React.lazy(() => import('@/pages/AuthCallback'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Pricing = React.lazy(() => import('@/pages/Pricing'));
const About = React.lazy(() => import('@/pages/About'));

// Optimized QueryClient with reduced cache time for better memory usage
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (reduced from default)
      retry: 1, // Reduced retries for faster failures
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Apply bundle optimizations after initial render
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback for non-critical optimizations
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          bundleOptimizer.removeUnusedCSS();
          bundleOptimizer.optimizeFonts();
        }, { timeout: 5000 });
      } else {
        setTimeout(() => {
          bundleOptimizer.removeUnusedCSS();
          bundleOptimizer.optimizeFonts();
        }, 1000);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PerformanceProvider>
          <TooltipProvider>
            <AuthProvider>
              <PreferencesProvider>
                <UserDataProvider>
                  <ModulesProvider>
                    <UsageProvider>
                      <Router>
                        <div className="min-h-screen bg-black">
                          <Suspense fallback={<LoadingScreen message="Loading Myotopia..." />}>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/signin" element={<SignIn />} />
                              <Route path="/signup" element={<SignUp />} />
                              <Route path="/auth/callback" element={<AuthCallback />} />
                              <Route path="/app" element={<Dashboard />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/pricing" element={<Pricing />} />
                              <Route path="/about" element={<About />} />
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </Suspense>
                        </div>
                      </Router>
                      <Toaster />
                    </UsageProvider>
                  </ModulesProvider>
                </UserDataProvider>
              </PreferencesProvider>
            </AuthProvider>
          </TooltipProvider>
        </PerformanceProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
