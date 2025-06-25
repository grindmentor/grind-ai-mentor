
import { Button } from "@/components/ui/button";
import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { Dumbbell, Home, Settings, LogOut, Menu, X, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";

// Lazy load components for better performance
const Dashboard = lazy(() => import("@/components/Dashboard"));
const WelcomeBack = lazy(() => import("@/components/WelcomeBack"));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
        <Dumbbell className="w-7 h-7 text-white" />
      </div>
      <div className="text-xl">Loading...</div>
    </div>
  </div>
);

const App = () => {
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const { user, loading, signOut, isNewUser } = useAuth();
  const isMobile = useIsMobile();

  // Enhanced mobile header scroll behavior
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
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
    } else if (!loading && user && !isNewUser) {
      // Show welcome back for returning users
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeBack(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [user, loading, navigate, isNewUser]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('hasSeenWelcome');
    await signOut();
    navigate('/');
  };

  const handleWelcomeBackContinue = () => {
    setShowWelcomeBack(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <EmailVerificationGuard userEmail={user.email || ''}>
      <UserDataProvider>
        <div className="min-h-screen bg-black text-white ios-safe-area">
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
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold logo-text">GrindMentor</span>
                </div>
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
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold logo-text">GrindMentor</span>
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
              ? 'pt-20' // Account for mobile header
              : 'ml-64'
          }`} style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </div>
        </div>
      </UserDataProvider>
    </EmailVerificationGuard>
  );
};

export default App;
