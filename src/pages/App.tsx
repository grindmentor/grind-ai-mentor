
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import PaymentSetup from "@/components/PaymentSetup";
import Dashboard from "@/components/Dashboard";
import WelcomeBack from "@/components/WelcomeBack";
import EmailVerificationPrompt from "@/components/EmailVerificationPrompt";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { Dumbbell, Home, Settings, LogOut, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const App = () => {
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut, isNewUser, isEmailUnconfirmed } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    } else if (!loading && user && !isNewUser && !isEmailUnconfirmed) {
      // Show welcome back for returning users with confirmed emails
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeBack(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [user, loading, navigate, isNewUser, isEmailUnconfirmed]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('hasSeenWelcome');
    await signOut();
    navigate('/');
  };

  const handleWelcomeBackContinue = () => {
    setShowWelcomeBack(false);
  };

  const handleEmailVerificationContinue = () => {
    // Force a page refresh to check auth status
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Show email verification prompt for unconfirmed emails
  if (isEmailUnconfirmed) {
    return (
      <EmailVerificationPrompt 
        userEmail={user.email || ''} 
        onContinue={handleEmailVerificationContinue}
      />
    );
  }

  return (
    <UserDataProvider>
      <div className="min-h-screen bg-black text-white ios-safe-area">
        {/* Welcome Back Modal */}
        {showWelcomeBack && (
          <WelcomeBack 
            userEmail={user.email || ''} 
            onContinue={handleWelcomeBackContinue}
          />
        )}

        {/* Mobile Header with proper safe area */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">GrindMentor</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-gray-800"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        )}

        {/* Sidebar with proper safe area */}
        <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur border-r border-gray-800 p-6 transition-transform duration-300 z-40 ${
          isMobile 
            ? `w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-64 translate-x-0'
        }`} style={{ paddingTop: isMobile ? 'calc(env(safe-area-inset-top) + 5rem)' : '1.5rem' }}>
          {/* Logo - only show on desktop */}
          {!isMobile && (
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">GrindMentor</span>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 transition-colors"
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 transition-colors"
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
              className="w-full justify-start text-white hover:bg-gray-800 hover:text-red-400 transition-colors"
              onClick={() => {
                handleSignOut();
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </nav>

          {/* User Info */}
          <div className="absolute bottom-6 left-6 right-6" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
              <div className="text-white text-sm font-medium mb-1">Signed in as:</div>
              <div className="text-gray-400 text-xs truncate">{user.email}</div>
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
        <div className={`min-h-screen transition-all duration-300 ${
          isMobile 
            ? 'pt-20' 
            : 'ml-64'
        }`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <Dashboard />
        </div>
      </div>
    </UserDataProvider>
  );
};

export default App;
