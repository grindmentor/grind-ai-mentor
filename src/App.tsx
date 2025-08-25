
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import Index from "./pages/Index";
// Lazy load non-homepage routes to reduce initial bundle size
const AppPage = lazy(() => import("./pages/App"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const ModuleLibrary = lazy(() => import("./pages/ModuleLibrary"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));
// Lazy load heavy providers and components to reduce initial bundle
const AuthProvider = lazy(() => import("@/contexts/AuthContext").then(m => ({ default: m.AuthProvider })));
const PreferencesProvider = lazy(() => import("@/contexts/PreferencesContext").then(m => ({ default: m.PreferencesProvider })));
const UserDataProvider = lazy(() => import("@/contexts/UserDataContext").then(m => ({ default: m.UserDataProvider })));
const ModulesProvider = lazy(() => import("@/contexts/ModulesContext"));
const ExerciseShareProvider = lazy(() => import("@/contexts/ExerciseShareContext").then(m => ({ default: m.ExerciseShareProvider })));
const AppPreloader = lazy(() => import("@/components/AppPreloader"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));

// Defer non-critical optimizations
const AppOptimizations = lazy(() => import("@/components/AppOptimizations").then(m => ({ default: m.AppOptimizations })));
const BackgroundSync = lazy(() => import("@/components/ui/background-sync"));
const DataPersistence = lazy(() => import("@/components/ui/data-persistence"));
const AppPerformance = lazy(() => import("@/components/ui/app-performance"));
const FinalLaunchChecks = lazy(() => import("@/components/ui/final-launch-checks"));

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove the immediate setIsLoading(false) to prevent conflicts
    // Let AppPreloader handle the completion timing
  }, []);

  if (isLoading) {
    return <AppPreloader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>}>
        <AuthProvider>
          <PreferencesProvider>
            <UserDataProvider>
              <ModulesProvider>
                <ExerciseShareProvider>
                  <TooltipProvider>
                    {/* Defer non-critical optimizations */}
                    <Suspense fallback={null}>
                      <AppOptimizations />
                      <BackgroundSync />
                      <DataPersistence />
                      <AppPerformance />
                      <FinalLaunchChecks />
                    </Suspense>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <div className="min-h-screen bg-background">
                        {/* PWA Titlebar area for window controls overlay */}
                        <div className="titlebar-area" />
                        
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="loading-spinner"></div>
                        </div>}>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route
                              path="/app"
                              element={
                                <ProtectedRoute>
                                  <AppPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/modules"
                              element={
                                <ProtectedRoute>
                                  <ModuleLibrary />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute>
                                  <Settings />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <Profile />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/about" element={<About />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </div>
                    </BrowserRouter>
                  </TooltipProvider>
                </ExerciseShareProvider>
              </ModulesProvider>
            </UserDataProvider>
          </PreferencesProvider>
        </AuthProvider>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
