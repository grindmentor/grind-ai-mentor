
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import AppPage from "./pages/App";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import ModuleLibrary from "./pages/ModuleLibrary";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import ModulesProvider from "@/contexts/ModulesContext";
import { ExerciseShareProvider } from "@/contexts/ExerciseShareContext";
import AppPreloader from "@/components/AppPreloader";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Instant app initialization - eliminate artificial delays
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50); // Reduced to minimal delay for smooth transition

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AppPreloader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PreferencesProvider>
          <UserDataProvider>
            <ModulesProvider>
              <ExerciseShareProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
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
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/about" element={<About />} />
                      </Routes>
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </ExerciseShareProvider>
            </ModulesProvider>
          </UserDataProvider>
        </PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
