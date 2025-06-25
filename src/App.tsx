
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { UsageProvider } from "./contexts/UsageContext";
import { ModulesProvider } from "./contexts/ModulesContext";
import { SmartPrefillProvider } from "./components/SmartPrefillProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import AppPage from "./pages/App";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PreferencesProvider>
          <UsageProvider>
            <ModulesProvider>
              <SmartPrefillProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/app" element={<AppPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </SmartPrefillProvider>
            </ModulesProvider>
          </UsageProvider>
        </PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
