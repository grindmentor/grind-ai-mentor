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

  // Check onboarding completion status
  const checkOnboardingStatus = async (userId: string) => {
    try {
      // Check localStorage first for immediate response
      const localOnboarding = localStorage.getItem(`myotopia_onboarding_${userId}`);
      if (localOnboarding) {
        setHasCompletedOnboarding(true);
        return;
      }
      
      // Check database for profile data to determine onboarding completion
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('weight, height, experience, activity, goal')
        .eq('id', userId)
        .single();
      
      if (!error && profile) {
        // If user has basic profile data, consider onboarding complete
        const isComplete = profile.weight && profile.height && profile.experience && profile.activity && profile.goal;
        setHasCompletedOnboarding(isComplete);
        
        // Update localStorage to match database state
        if (isComplete) {
          localStorage.setItem(`myotopia_onboarding_${userId}`, 'completed');
        }
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.warn('Could not check onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  // Mark onboarding as complete
  const markOnboardingComplete = () => {
    if (user) {
      try {
        localStorage.setItem(`myotopia_onboarding_${user.id}`, 'completed');
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.warn('Could not save onboarding completion to localStorage:', error);
      }
    }
  };

  useEffect(() => {
    console.log('Initializing auth context');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userCreatedAt = new Date(session.user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - userCreatedAt.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        setIsNewUser(minutesDiff < 5);
        checkOnboardingStatus(session.user.id);
        setIsEmailUnconfirmed(!session.user.email_confirmed_at);
        
        // For logged-in users, redirect immediately without delay
        if (window.location.pathname === '/' || window.location.pathname === '/signin' || window.location.pathname === '/signup') {
          // Use navigate instead of location.replace for better UX
          setTimeout(() => {
            if (window.location.pathname !== '/app') {
              window.location.replace('/app');
            }
          }, 100);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsNewUser(false);
        setIsEmailUnconfirmed(false);
        setHasCompletedOnboarding(false);
        
        // Redirect to home on sign out
        if (window.location.pathname === '/app' || window.location.pathname.startsWith('/app')) {
          window.location.replace('/');
        }
      }
      
      setAuthPending(false);
      setLoading(false);
    });

    // Check for existing session immediately
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (session?.user) {
        console.log('Initial session found:', session.user.email);
        setSession(session);
        setUser(session.user);
        setIsEmailUnconfirmed(!session.user.email_confirmed_at);
        checkOnboardingStatus(session.user.id);
        
        // Instant redirect for existing sessions
        if (window.location.pathname === '/' || window.location.pathname === '/signin' || window.location.pathname === '/signup') {
          setTimeout(() => {
            if (window.location.pathname !== '/app') {
              window.location.replace('/app');
            }
          }, 50);
        }
      }
      
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another verification email.' } };
    }

    setAuthPending(true);
    
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    console.log('Sign up attempt with redirect URL:', redirectUrl);
    
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

      if (!error) {
        try {
          await supabase.from('subscribers').insert({ email });
        } catch (subscriberError) {
          console.warn('Could not add to subscribers:', subscriberError);
        }
        
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000);
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
    console.log('Sign in attempt for:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setIsEmailUnconfirmed(true);
        }
        console.log('Sign in error:', error);
      } else {
        console.log('Sign in successful');
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
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another reset email.' } };
    }

    setAuthPending(true);
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (!error) {
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000);
      }
      
      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('Password reset error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another confirmation email.' } };
    }

    setAuthPending(true);
    const redirectUrl = `${window.location.origin}/auth/callback`;
      
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (!error) {
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000);
      }

      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('Resend confirmation error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred while resending confirmation' } };
    }
  };

  const value = {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
