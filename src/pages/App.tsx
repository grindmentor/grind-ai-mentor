
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import Dashboard from "@/components/Dashboard";
import OnboardingFlow from "@/components/OnboardingFlow";
import YouButton from "@/components/dashboard/YouButton";
import AppPreloader from "@/components/AppPreloader";
import { PageTransition } from "@/components/ui/page-transition";

const AppPage = () => {
  const { user } = useAuth();
  const { userData, isLoading } = useUserData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AppPage - User:", user?.email);
    console.log("AppPage - UserData loading:", isLoading);
    console.log("AppPage - UserData:", userData);

    if (!user) {
      console.log("AppPage - No user found, should redirect to signin");
      setError("No user found");
      return;
    }

    if (user && !isLoading) {
      try {
        // Check if user needs onboarding - if they don't have basic info
        if (!userData.age || !userData.weight || !userData.height) {
          console.log("AppPage - User needs onboarding");
          setShowOnboarding(true);
        }
        
        // Add a small delay to ensure smooth transition
        const timer = setTimeout(() => {
          setIsInitializing(false);
        }, 300);
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.error("AppPage - Error during initialization:", err);
        setError("Failed to initialize app");
      }
    }
  }, [user, userData, isLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handlePreloaderComplete = () => {
    setIsInitializing(false);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/signin'}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-3 rounded-lg"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show preloader while initializing
  if (isLoading || isInitializing) {
    return <AppPreloader onComplete={handlePreloaderComplete} />;
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
