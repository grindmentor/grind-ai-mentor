
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import Dashboard from "@/components/Dashboard";
import OnboardingFlow from "@/components/OnboardingFlow";
import YouButton from "@/components/dashboard/YouButton";
import AppPreloader from "@/components/AppPreloader";
import { PageTransition } from "@/components/ui/page-transition";
import { useNavigate } from "react-router-dom";

const AppPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { userData, isLoading: userDataLoading } = useUserData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AppPage - Auth loading:", authLoading);
    console.log("AppPage - User:", user?.email);
    console.log("AppPage - UserData loading:", userDataLoading);
    console.log("AppPage - UserData:", userData);

    // If auth is still loading, wait
    if (authLoading) {
      console.log("AppPage - Auth still loading, waiting...");
      return;
    }

    // If no user found after auth loading is complete, redirect to signin
    if (!authLoading && !user) {
      console.log("AppPage - No user found after auth loading, redirecting to signin");
      navigate('/signin', { replace: true });
      return;
    }

    // If user exists but user data is still loading, wait
    if (user && userDataLoading) {
      console.log("AppPage - User exists but user data still loading, waiting...");
      return;
    }

    // Once we have user and user data loading is complete
    if (user && !userDataLoading) {
      try {
        console.log("AppPage - User and data loaded, checking onboarding status");
        
        // Check if user needs onboarding - if they don't have basic info
        const needsOnboarding = !userData.age || !userData.weight || !userData.height;
        console.log("AppPage - Needs onboarding:", needsOnboarding);
        
        if (needsOnboarding) {
          setShowOnboarding(true);
        }
        
        // Complete initialization
        setIsInitializing(false);
      } catch (err) {
        console.error("AppPage - Error during initialization:", err);
        // Don't block the app, just continue
        setIsInitializing(false);
      }
    }
  }, [user, userData, authLoading, userDataLoading, navigate]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handlePreloaderComplete = () => {
    setIsInitializing(false);
  };

  // Show preloader while auth is loading or while initializing
  if (authLoading || isInitializing) {
    return <AppPreloader onComplete={handlePreloaderComplete} />;
  }

  // If no user at this point, something went wrong with redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to access your dashboard</p>
          <button 
            onClick={() => navigate('/signin')}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-3 rounded-lg"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return (
      <PageTransition>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </PageTransition>
    );
  }

  // Show main dashboard
  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative">
        <Dashboard />
        <YouButton />
        
        {/* Enhanced mobile experience */}
        <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-red-600" />
        </div>
      </div>
    </PageTransition>
  );
};

export default AppPage;
