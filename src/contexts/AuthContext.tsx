
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
  isNewUser: boolean;
  isEmailUnconfirmed: boolean;
  canResendEmail: boolean;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
  authPending: boolean;
  hasCompletedOnboarding: boolean;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [canResendEmail, setCanResendEmail] = useState(true);
  const [authPending, setAuthPending] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // iOS PWA detection
  const isIOSPWA = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isIOS && isStandalone;
  };

  // Check onboarding completion status
  const checkOnboardingStatus = (userId: string) => {
    try {
      const onboardingCompleted = localStorage.getItem(`grindmentor_onboarding_${userId}`);
      setHasCompletedOnboarding(!!onboardingCompleted);
    } catch (error) {
      console.warn('Could not access localStorage for onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  // Mark onboarding as complete
  const markOnboardingComplete = () => {
    if (user) {
      try {
        localStorage.setItem(`grindmentor_onboarding_${user.id}`, 'completed');
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.warn('Could not save onboarding completion to localStorage:', error);
      }
    }
  };

  // Enhanced session handler for iOS PWA
  const handleAuthStateChange = (event: string, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.email, 'iOS PWA:', isIOSPWA());
    
    // Use setTimeout to prevent blocking the auth callback
    setTimeout(() => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle email confirmation status
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if user was just created (within last few minutes)
        const userCreatedAt = new Date(session.user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - userCreatedAt.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        // If user was created less than 5 minutes ago, they're a new user
        const isUserNew = minutesDiff < 5;
        setIsNewUser(isUserNew);
        
        // Check onboarding status for this specific user
        checkOnboardingStatus(session.user.id);
        
        // Check if email is confirmed
        setIsEmailUnconfirmed(!session.user.email_confirmed_at);
      } else if (event === 'SIGNED_OUT') {
        setIsNewUser(false);
        setIsEmailUnconfirmed(false);
        setHasCompletedOnboarding(false);
      }
      
      setAuthPending(false);
      
      // Only set loading to false after we've processed the auth state
      if (!isInitialized) {
        setLoading(false);
        setIsInitialized(true);
      }
    }, 0);
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth for iOS PWA:', isIOSPWA());
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        // Then check for existing session with proper error handling
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          console.log('Initial session check:', session?.user?.email);
          
          // Handle initial session
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            setIsEmailUnconfirmed(!session.user.email_confirmed_at);
            checkOnboardingStatus(session.user.id);
          }
          
          // Ensure loading is set to false even if no session
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
              setIsInitialized(true);
            }
          }, isIOSPWA() ? 1000 : 100); // Longer delay for iOS PWA
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    // Prevent multiple requests
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another verification email.' } };
    }

    setAuthPending(true);
    
    // Enhanced redirect URL for iOS PWA
    const baseUrl = window.location.origin;
    const redirectUrl = isIOSPWA() ? `${baseUrl}/app` : `${baseUrl}/auth/callback`;
    
    console.log('Sign up attempt with redirect URL:', redirectUrl, 'iOS PWA:', isIOSPWA());
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email_confirm: true
          }
        }
      });

      console.log('Sign up result:', { error });

      // Also add to subscribers table for email campaigns
      if (!error) {
        try {
          await supabase.from('subscribers').insert({ email });
        } catch (subscriberError) {
          console.warn('Could not add to subscribers:', subscriberError);
        }
        
        // Rate limit email sending
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000); // 1 minute cooldown
      }

      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('Sign up error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred during sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (authPending) {
      return { error: { message: 'Authentication request already in progress.' } };
    }

    setAuthPending(true);
    console.log('Sign in attempt for:', email, 'iOS PWA:', isIOSPWA());
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          setIsEmailUnconfirmed(true);
        }
        console.log('Sign in error:', error);
      } else {
        console.log('Sign in successful');
        // For iOS PWA, add a small delay to ensure state is properly set
        if (isIOSPWA()) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('Sign in unexpected error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsEmailUnconfirmed(false);
      setAuthPending(false);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    // Prevent multiple requests
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another reset email.' } };
    }

    setAuthPending(true);

    // Enhanced redirect URL for iOS PWA
    const baseUrl = window.location.origin;
    const redirectUrl = isIOSPWA() ? `${baseUrl}/app` : `${baseUrl}/auth/callback`;
    console.log('Password reset for:', email, 'with redirect:', redirectUrl);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (!error) {
        // Rate limit email sending
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000); // 1 minute cooldown
      }
      
      console.log('Password reset result:', { error });
      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('Password reset error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    // Prevent multiple requests
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another confirmation email.' } };
    }

    setAuthPending(true);

    try {
      const baseUrl = window.location.origin;
      const redirectUrl = isIOSPWA() ? `${baseUrl}/app` : `${baseUrl}/auth/callback`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (!error) {
        // Rate limit email sending
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000); // 1 minute cooldown
      }

      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('Resend confirmation error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred while resending confirmation' } };
    }
  };

  // Add debug logging for iOS PWA
  useEffect(() => {
    if (isIOSPWA()) {
      console.log('iOS PWA Auth State:', {
        loading,
        user: !!user,
        session: !!session,
        authPending,
        isInitialized
      });
    }
  }, [loading, user, session, authPending, isInitialized]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      resetPassword,
      loading,
      isNewUser,
      isEmailUnconfirmed,
      canResendEmail,
      resendConfirmationEmail,
      authPending,
      hasCompletedOnboarding,
      markOnboardingComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};
