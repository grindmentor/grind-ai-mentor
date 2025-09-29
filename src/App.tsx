
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import { default as AppPage } from "./pages/App";
import PhysiqueAIDashboard from "./pages/PhysiqueAIDashboard";
import PhysiqueAI from "./pages/PhysiqueAI";
import WorkoutLogger from "./pages/WorkoutLogger";
import SmartFoodLog from "./pages/SmartFoodLog";
import BlueprintAI from "./components/ai-modules/BlueprintAI";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import ModuleLibrary from "./pages/ModuleLibrary";
import Research from "./pages/Research";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
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

const queryClient = new QueryClient();

const BlueprintAIWrapper = () => {
  const navigate = useNavigate();
  return <BlueprintAI onBack={() => navigate('/app')} />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Instant app initialization - zero artificial delay
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
                  <AppOptimizations />
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ProtocolHandler />
                    <div className="min-h-screen bg-background">
                      {/* PWA Titlebar area for window controls overlay */}
                      <div className="titlebar-area" />
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
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/about" element={<About />} />
                        <Route 
                          path="/research" 
                          element={
                            <ProtectedRoute>
                              <Research />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
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
