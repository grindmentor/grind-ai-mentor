
import { Button } from "@/components/ui/button";
import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { Dumbbell, Home, Settings, LogOut, Menu, X, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import OnboardingFlow from "@/components/OnboardingFlow";
import LoadingSpinner from "@/components/LoadingSpinner";
import Logo from "@/components/ui/logo";

// Lazy load components for better performance
const Dashboard = lazy(() => import("@/components/Dashboard"));
const WelcomeBack = lazy(() => import("@/components/WelcomeBack"));

const App = () => {
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const { user, loading, signOut, isNewUser } = useAuth();
  const isMobile = useIsMobile();
  
  // Initialize payment status monitoring
  usePaymentStatus();

  // Enhanced mobile header scroll behavior
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    } else if (!loading && user) {
      // Check if user needs onboarding
      const hasCompletedOnboarding = localStorage.getItem('grindmentor_onboarding_completed');
      
      if (isNewUser && !hasCompletedOnboarding) {
        setShowOnboarding(true);
      } else if (!isNewUser) {
        // Show welcome back for returning users
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          setShowWelcomeBack(true);
          sessionStorage.setItem('hasSeenWelcome', 'true');
        }
      }
    }
  }, [user, loading, navigate, isNewUser]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('hasSeenWelcome');
    localStorage.removeItem('grindmentor_onboarding_completed');
    await signOut();
    navigate('/');
  };

  const handleWelcomeBackContinue = () => {
    setShowWelcomeBack(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
        <LoadingSpinner size="lg" text="Loading GrindMentor..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <EmailVerificationGuard userEmail={user.email || ''}>
      <UserDataProvider>
        <div className="min-h-screen bg-black text-white ios-safe-area">
          {/* Onboarding Flow */}
          {showOnboarding && (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          )}

          {/* Welcome Back Modal */}
          {showWelcomeBack && (
            <Suspense fallback={null}>
              <WelcomeBack 
                userEmail={user.email || ''} 
                onContinue={handleWelcomeBackContinue}
              />
            </Suspense>
          )}

          {/* Enhanced Mobile Header */}
          {isMobile && (
            <div className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 transition-transform duration-300 ${
              headerVisible ? 'translate-y-0' : '-translate-y-full'
            }`} style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 0.5rem, 1rem)' }}>
              <div className="flex items-center justify-between p-4">
                <Logo size="sm" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white hover:bg-gray-800 min-h-[48px] min-w-[48px]"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Sidebar */}
          <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-40 ${
            isMobile 
              ? `w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'w-64 translate-x-0'
          }`} style={{ paddingTop: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 5rem)' : '2rem' }}>
            <div className="p-6 h-full flex flex-col">
              {/* Desktop Logo */}
              {!isMobile && (
                <div className="mb-8">
                  <Logo size="md" />
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-2 flex-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 min-h-[48px]"
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 min-h-[48px]"
                  onClick={() => {
                    navigate('/settings');
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 min-h-[48px]"
                  onClick={() => {
                    navigate('/support');
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <HelpCircle className="w-5 h-5 mr-3" />
                  Support
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-red-400 min-h-[48px]"
                  onClick={() => {
                    handleSignOut();
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </nav>

              {/* Enhanced User Info */}
              <div className="mt-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}>
                <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
                  <div className="text-white text-sm font-medium mb-1">Signed in as:</div>
                  <div className="text-gray-400 text-xs truncate">{user.email}</div>
                  {user.email_confirmed_at && (
                    <div className="text-green-400 text-xs mt-1">✓ Verified</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Overlay */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className={`min-h-screen ${
            isMobile 
              ? 'pt-20'
              : 'ml-64'
          }`} style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}>
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading Dashboard..." />}>
              <Dashboard />
            </Suspense>
          </div>
        </div>
      </UserDataProvider>
    </EmailVerificationGuard>
  );
};

export default App;
