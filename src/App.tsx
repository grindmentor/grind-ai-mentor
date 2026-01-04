import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Eager load critical routes for instant navigation (no loading flash)
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import AppPage from "./pages/App";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ModuleLibrary from "./pages/ModuleLibrary";
import Notifications from "./pages/Notifications";

// Lazy load less frequently accessed routes
const ProgressHubDashboard = lazy(() => import("./pages/ProgressHubDashboard"));
const PhysiqueAI = lazy(() => import("./pages/PhysiqueAI"));
const WorkoutLogger = lazy(() => import("./pages/WorkoutLogger"));
const SmartFoodLog = lazy(() => import("./pages/SmartFoodLog"));
const BlueprintAI = lazy(() => import("./components/ai-modules/BlueprintAI"));
const ProgressHub = lazy(() => import("./components/ai-modules/ProgressHub"));
const WorkoutDetail = lazy(() => import("./pages/WorkoutDetail"));
const ExerciseDetail = lazy(() => import("./pages/ExerciseDetail"));
const ExerciseDatabase = lazy(() => import("./pages/ExerciseDatabase"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Research = lazy(() => import("./pages/Research"));
const CreateGoal = lazy(() => import("./pages/CreateGoal"));
const AddFood = lazy(() => import("./pages/AddFood"));
const CreateExercise = lazy(() => import("./pages/CreateExercise"));
const Usage = lazy(() => import("./pages/Usage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import ModulesProvider from "@/contexts/ModulesContext";
import { ExerciseShareProvider } from "@/contexts/ExerciseShareContext";
import { GlobalStateProvider } from "@/contexts/GlobalStateContext";
import AppPreloader from "@/components/AppPreloader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppLayout } from "@/components/layout/AppLayout";
import { preloadCriticalRoutes, setupLinkPreloading } from "@/utils/routePreloader";
import "@/utils/prefetch"; // Initialize prefetching

// Optimized QueryClient with aggressive caching defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min default stale time
      gcTime: 30 * 60 * 1000, // 30 min cache time
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnReconnect: 'always',
      retry: 1,
    },
  },
});

const BlueprintAIWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Respect returnTo state for proper back navigation
  const handleBack = () => {
    const state = location.state as { returnTo?: string } | null;
    if (state?.returnTo) {
      navigate(state.returnTo);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/modules');
    }
  };
  
  return <BlueprintAI onBack={handleBack} />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Instant initialization
    setIsLoading(false);

    // Route preloading to prevent Suspense fallback flashes on navigation
    try {
      setupLinkPreloading();
      preloadCriticalRoutes();
    } catch {
      // Silent: navigation still works without preloading
    }
  }, []);

  if (isLoading) {
    return <AppPreloader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalStateProvider>
          <PreferencesProvider>
            <UserDataProvider>
              <ModulesProvider>
                <ExerciseShareProvider>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <OfflineIndicator />
                  <BrowserRouter>
                    <ScrollToTop />
                    <AppShell>
                      {/* PWA Titlebar area */}
                      <div className="titlebar-area" />
                      <AppLayout>
                        <Suspense fallback={<div className="min-h-screen bg-background" />}>
                          <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/signin" element={<SignIn />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/auth/callback" element={<AuthCallback />} />
                          <Route
                            path="/onboarding"
                            element={
                              <ProtectedRoute skipOnboardingCheck>
                                <Onboarding />
                              </ProtectedRoute>
                            }
                          />
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
                          <Route
                            path="/workout-logger"
                            element={
                              <ProtectedRoute>
                                <WorkoutLogger />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/physique-ai"
                            element={
                              <ProtectedRoute>
                                <PhysiqueAI />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/progress-hub-dashboard"
                            element={
                              <ProtectedRoute>
                                <ProgressHubDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/smart-food-log"
                            element={
                              <ProtectedRoute>
                                <SmartFoodLog />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/blueprint-ai"
                            element={
                              <ProtectedRoute>
                                <BlueprintAIWrapper />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/workout-detail"
                            element={
                              <ProtectedRoute>
                                <WorkoutDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/exercise-detail"
                            element={
                              <ProtectedRoute>
                                <ExerciseDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/exercise-database"
                            element={
                              <ProtectedRoute>
                                <ExerciseDatabase />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/support" element={<Support />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route 
                            path="/research" 
                            element={
                              <ProtectedRoute>
                                <Research />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/create-goal" 
                            element={
                              <ProtectedRoute>
                                <CreateGoal />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/add-food" 
                            element={
                              <ProtectedRoute>
                                <AddFood />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/create-exercise" 
                            element={
                              <ProtectedRoute>
                                <CreateExercise />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/notifications" 
                            element={
                              <ProtectedRoute>
                                <Notifications />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/usage" 
                            element={
                              <ProtectedRoute>
                                <Usage />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/progress-hub" 
                            element={
                              <ProtectedRoute>
                                <ProgressHub />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        </Suspense>
                      </AppLayout>
                    </AppShell>
                  </BrowserRouter>
                </TooltipProvider>
              </ExerciseShareProvider>
            </ModulesProvider>
          </UserDataProvider>
        </PreferencesProvider>
      </GlobalStateProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
