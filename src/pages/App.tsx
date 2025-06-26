
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import OnboardingFlow from "@/components/OnboardingFlow";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

const App = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
      return;
    }

    if (user) {
      checkOnboardingStatus();
    }
  }, [user, isLoading, navigate]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('goal, experience, activity')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      } else {
        // Check if user has completed basic onboarding
        const hasBasicInfo = data && data.goal && data.experience && data.activity;
        setHasCompletedOnboarding(!!hasBasicInfo);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  if (isLoading || isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 flex items-center justify-center animate-fade-in">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <EmailVerificationGuard>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 animate-fade-in">
        {hasCompletedOnboarding === false ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <Dashboard />
        )}
      </div>
    </EmailVerificationGuard>
  );
};

export default App;
