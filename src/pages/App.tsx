
import { Button } from "@/components/ui/button";
import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { Dumbbell, Home, Settings, LogOut, Menu, X, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import OnboardingFlow from "@/components/OnboardingFlow";
import PremiumLoader from "@/components/PremiumLoader";
import Logo from "@/components/ui/logo";

// Lazy load components for better performance
const Dashboard = lazy(() => import("@/components/Dashboard"));
const WelcomeBack = lazy(() => import("@/components/WelcomeBack"));

const App = () => {
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const navigate = useNavigate();
  const { user, loading, signOut, hasCompletedOnboarding, markOnboardingComplete } = useAuth();
  const isMobile = useIsMobile();

  // Enhanced mobile header scroll behavior
  useEffect(() => {
    if (!isMobile) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setHeaderVisible(false);
          } else if (currentScrollY < lastScrollY) {
            setHeaderVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  // App initialization
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
      return;
    }
    
    if (!loading && user && hasCompletedOnboarding) {
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeBack(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [user, loading, navigate, hasCompletedOnboarding]);

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('hasSeenWelcome');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleWelcomeBackContinue = () => {
    setShowWelcomeBack(false);
  };

  const handleOnboardingComplete = () => {
    markOnboardingComplete();
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  // Show loading only while auth is actually loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PremiumLoader variant="minimal" message="Loading..." />
      </div>
    );
  }

  if (!user && !loading) {
    return null;
  }

  // Show mandatory onboarding for users who haven't completed it
  if (!hasCompletedOnboarding && user) {
    return (
      <EmailVerificationGuard userEmail={user.email || ''}>
        <div className="min-h-screen bg-black text-white">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      </EmailVerificationGuard>
    );
  }

  return (
    <EmailVerificationGuard userEmail={user?.email || ''}>
      <UserDataProvider>
        <div className="min-h-screen bg-black text-white">
          {/* Welcome Back Modal */}
          {showWelcomeBack && (
            <Suspense fallback={<PremiumLoader variant="minimal" />}>
              <WelcomeBack 
                userEmail={user?.email || ''} 
                onContinue={handleWelcomeBackContinue}
              />
            </Suspense>
          )}

          {/* Enhanced Mobile Header */}
          {isMobile && (
            <div className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 transition-transform duration-300 ${
              headerVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
              <div className="flex items-center justify-between p-4">
                <Logo size="sm" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSidebarToggle}
                  className="text-white hover:bg-gray-800 min-h-[48px] min-w-[48px] transition-all duration-200 active:scale-95"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Sidebar */}
          <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-40 transition-transform duration-300 ${
            isMobile 
              ? `w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'w-64 translate-x-0'
          }`}>
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
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 min-h-[48px] transition-all duration-200 active:scale-95"
                  onClick={() => handleNavigation('/app')}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 min-h-[48px] transition-all duration-200 active:scale-95"
                  onClick={() => handleNavigation('/settings')}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 min-h-[48px] transition-all duration-200 active:scale-95"
                  onClick={() => handleNavigation('/support')}
                >
                  <HelpCircle className="w-5 h-5 mr-3" />
                  Support
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-red-400 min-h-[48px] transition-all duration-200 active:scale-95"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </nav>

              {/* User Info */}
              <div className="mt-auto">
                <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
                  <div className="text-white text-sm font-medium mb-1">Signed in as:</div>
                  <div className="text-gray-400 text-xs truncate">{user?.email}</div>
                  {user?.email_confirmed_at && (
                    <div className="text-green-400 text-xs mt-1">✓ Verified</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Overlay */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className={`min-h-screen transition-all duration-300 ${
            isMobile 
              ? 'pt-20'
              : 'ml-64'
          }`}>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <PremiumLoader 
                  variant="minimal"
                  message="Loading dashboard..."
                  showMetrics={false}
                />
              </div>
            }>
              <Dashboard />
            </Suspense>
          </div>
        </div>
      </UserDataProvider>
    </EmailVerificationGuard>
  );
};

export default App;
