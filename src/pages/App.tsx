
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
  const { userData, loading } = useUserData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      // Check if user needs onboarding
      if (!userData.onboardingCompleted) {
        setShowOnboarding(true);
      }
      
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, userData, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show preloader while initializing
  if (loading || isInitializing) {
    return <AppPreloader />;
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
