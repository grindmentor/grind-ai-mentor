
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ModulesProvider from "./contexts/ModulesContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { SoundEffects } from "./utils/soundEffects";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Support from "./pages/Support";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import AppPage from "./pages/App";
import Profile from "./pages/Profile";
import { useAuth } from "./contexts/AuthContext";
import { PageTransition } from "@/components/ui/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import ModuleLibrary from "./pages/ModuleLibrary";

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          <Skeleton className="w-[300px] h-[50px] mb-4 bg-gray-800" />
          <Skeleton className="w-[200px] h-[30px] bg-gray-700" />
        </div>
      </PageTransition>
    );
  }

  return user ? (
    <PreferencesProvider>
      <UserDataProvider>
        <AppPage />
      </UserDataProvider>
    </PreferencesProvider>
  ) : null;
};

const App = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    // Load audio preference from localStorage
    const storedAudioPreference = localStorage.getItem('audioEnabled');
    if (storedAudioPreference !== null) {
      setIsAudioEnabled(storedAudioPreference === 'true');
      SoundEffects.setEnabled(storedAudioPreference === 'true');
    } else {
      // Set default audio preference to true if not found in localStorage
      localStorage.setItem('audioEnabled', 'true');
      SoundEffects.setEnabled(true);
    }
  }, []);

  // Update localStorage when audio preference changes
  useEffect(() => {
    localStorage.setItem('audioEnabled', isAudioEnabled.toString());
    SoundEffects.setEnabled(isAudioEnabled);
  }, [isAudioEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
      <Router>
        <AuthProvider>
          <ModulesProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/app" element={<AuthenticatedApp />} />
              <Route 
                path="/profile" 
                element={
                  <PreferencesProvider>
                    <UserDataProvider>
                      <Profile />
                    </UserDataProvider>
                  </PreferencesProvider>
                } 
              />
              <Route 
                path="/modules" 
                element={
                  <PreferencesProvider>
                    <UserDataProvider>
                      <ModuleLibrary />
                    </UserDataProvider>
                  </PreferencesProvider>
                } 
              />
              <Route 
                path="/pricing" 
                element={
                  <PreferencesProvider>
                    <UserDataProvider>
                      <Pricing />
                    </UserDataProvider>
                  </PreferencesProvider>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <PreferencesProvider>
                    <UserDataProvider>
                      <Account />
                    </UserDataProvider>
                  </PreferencesProvider>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PreferencesProvider>
                    <UserDataProvider>
                      <Settings />
                    </UserDataProvider>
                  </PreferencesProvider>
                } 
              />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ModulesProvider>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
