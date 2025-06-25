
import { Button } from "@/components/ui/button";
import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { Dumbbell, Home, Settings, LogOut, Menu, X, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useAppHealth } from "@/hooks/useAppHealth";
import { useMobileEnhancements } from "@/hooks/useMobileEnhancements";
import { useAdvancedCaching } from "@/hooks/useAdvancedCaching";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import OnboardingFlow from "@/components/OnboardingFlow";
import AppPreloader from "@/components/AppPreloader";
import PremiumLoader from "@/components/PremiumLoader";
import Logo from "@/components/ui/logo";

// Lazy load components for better performance
const Dashboard = lazy(() => import("@/components/Dashboard"));
const WelcomeBack = lazy(() => import("@/components/WelcomeBack"));

const App = () => {
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [appReady, setAppReady] = useState(false);
  
  const navigate = useNavigate();
  const { user, loading, signOut, hasCompletedOnboarding, markOnboardingComplete } = useAuth();
  const isMobile = useIsMobile();
  
  // Premium monitoring hooks
  const performanceMetrics = usePerformanceMonitor();
  const { metrics: healthMetrics, isHealthy } = useAppHealth();
  const { safeArea, hapticFeedback } = useMobileEnhancements();
  const { prefetchBasedOnBehavior, stats: cacheStats } = useAdvancedCaching();
  
  // Initialize payment status monitoring
  usePaymentStatus();

  // Enhanced mobile header scroll behavior with performance optimization
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

  // App initialization with performance tracking
  useEffect(() => {
    const initializeApp = async () => {
      const startTime = performance.now();
      
      try {
        if (!loading && !user) {
          navigate('/signin');
          return;
        }
        
        if (!loading && user) {
          // Prefetch likely next routes
          prefetchBasedOnBehavior('/app');
          
          // Show welcome back for returning users who have completed onboarding
          if (hasCompletedOnboarding) {
            const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
            if (!hasSeenWelcome) {
              setShowWelcomeBack(true);
              sessionStorage.setItem('hasSeenWelcome', 'true');
            }
          }
        }
        
        const endTime = performance.now();
        console.log(`App initialization took ${endTime - startTime}ms`);
        
        setAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, [user, loading, navigate, hasCompletedOnboarding, prefetchBasedOnBehavior]);

  const handleSignOut = async () => {
    try {
      hapticFeedback('medium');
      sessionStorage.removeItem('hasSeenWelcome');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleWelcomeBackContinue = () => {
    hapticFeedback('light');
    setShowWelcomeBack(false);
  };

  const handleOnboardingComplete = () => {
    hapticFeedback('medium');
    markOnboardingComplete();
  };

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  const handleSidebarToggle = () => {
    hapticFeedback('light');
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path: string) => {
    hapticFeedback('light');
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  // Show performance warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (performanceMetrics.memoryUsage > 50) {
        console.warn(`High memory usage: ${performanceMetrics.memoryUsage.toFixed(1)}MB`);
      }
      if (performanceMetrics.frameDrops > 5) {
        console.warn(`Frame drops detected: ${performanceMetrics.frameDrops}`);
      }
    }
  }, [performanceMetrics]);

  if (loading || showPreloader || !appReady) {
    return showPreloader ? (
      <AppPreloader onComplete={handlePreloaderComplete} />
    ) : (
      <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
        <PremiumLoader 
          variant="detailed"
          showMetrics={true}
          progress={appReady ? 100 : 75}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show mandatory onboarding for users who haven't completed it
  if (!hasCompletedOnboarding) {
    return (
      <EmailVerificationGuard userEmail={user.email || ''}>
        <div className="min-h-screen bg-black text-white ios-safe-area">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      </EmailVerificationGuard>
    );
  }

  return (
    <EmailVerificationGuard userEmail={user.email || ''}>
      <UserDataProvider>
        <div 
          className="min-h-screen bg-black text-white ios-safe-area"
          style={{ 
            paddingTop: safeArea.top,
            paddingBottom: safeArea.bottom,
            paddingLeft: safeArea.left,
            paddingRight: safeArea.right
          }}
        >
          {/* Health Status Indicator (Development Only) */}
          {process.env.NODE_ENV === 'development' && !isHealthy && (
            <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
              Health Issue Detected
            </div>
          )}

          {/* Welcome Back Modal */}
          {showWelcomeBack && (
            <Suspense fallback={<PremiumLoader variant="minimal" />}>
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

              {/* Enhanced User Info with Performance Stats */}
              <div className="mt-auto">
                <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
                  <div className="text-white text-sm font-medium mb-1">Signed in as:</div>
                  <div className="text-gray-400 text-xs truncate">{user.email}</div>
                  {user.email_confirmed_at && (
                    <div className="text-green-400 text-xs mt-1">✓ Verified</div>
                  )}
                  
                  {/* Development Performance Stats */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
                      <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB</div>
                      <div>Cache: {(cacheStats.memoryUsage / 1024).toFixed(1)}KB</div>
                      <div>Status: {isHealthy ? '✓' : '⚠'}</div>
                    </div>
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
                  variant="detailed"
                  message="Loading your personalized dashboard..."
                  showMetrics={true}
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
