import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { crashReporter } from "@/utils/crashReporter";
import { logger } from "@/utils/logger";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { OfflineIndicator } from "@/components/OfflineIndicator";

// Eager load critical routes for instant access
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";

// Lazy load all other routes for better performance
const AppPage = lazy(() => import("./pages/App"));
const PhysiqueAIDashboard = lazy(() => import("./pages/PhysiqueAIDashboard"));
const PhysiqueAI = lazy(() => import("./pages/PhysiqueAI"));
const WorkoutLogger = lazy(() => import("./pages/WorkoutLogger"));
const SmartFoodLog = lazy(() => import("./pages/SmartFoodLog"));
const BlueprintAI = lazy(() => import("./components/ai-modules/BlueprintAI"));
const WorkoutDetail = lazy(() => import("./pages/WorkoutDetail"));
const ExerciseDetail = lazy(() => import("./pages/ExerciseDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ModuleLibrary = lazy(() => import("./pages/ModuleLibrary"));
const Research = lazy(() => import("./pages/Research"));
const CreateGoal = lazy(() => import("./pages/CreateGoal"));
const AddFood = lazy(() => import("./pages/AddFood"));
const CreateExercise = lazy(() => import("./pages/CreateExercise"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Usage = lazy(() => import("./pages/Usage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import ModulesProvider from "@/contexts/ModulesContext";
import { ExerciseShareProvider } from "@/contexts/ExerciseShareContext";
import { GlobalStateProvider } from "@/contexts/GlobalStateContext";
import AppPreloader from "@/components/AppPreloader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppOptimizations } from "@/components/AppOptimizations";
import ProtocolHandler from "@/components/ui/protocol-handler";
import { AppShell } from "@/components/AppShell";
import { RouteTransition } from "@/components/ui/route-transition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppLayout } from "@/components/layout/AppLayout";
import '@/utils/prefetch'; // Initialize prefetching

const queryClient = new QueryClient();

const BlueprintAIWrapper = () => {
  const navigate = useNavigate();
  return <BlueprintAI onBack={() => navigate('/app')} />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Instant initialization
    setIsLoading(false);
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
                        <Suspense fallback={<LoadingScreen />}>
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
                            path="/physique-ai-dashboard"
                            element={
                              <ProtectedRoute>
                                <PhysiqueAIDashboard />
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
