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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AUTH DEBUG] SIGNED_IN event triggered for:', session.user.email);
        
        try {
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          const minutesDiff = timeDiff / (1000 * 60);
          
          console.log('[AUTH DEBUG] User age in minutes:', minutesDiff);
          setIsNewUser(minutesDiff < 5);
          setIsEmailUnconfirmed(!session.user.email_confirmed_at);
          console.log('[AUTH DEBUG] Email confirmed:', !!session.user.email_confirmed_at);
          
          // Defer Supabase call to prevent deadlock
          setTimeout(() => {
            console.log('[AUTH DEBUG] Checking onboarding status...');
            checkOnboardingStatus(session.user.id).catch(err => {
              console.error('[AUTH DEBUG] Onboarding check failed:', err);
            });
          }, 0);
          
          // Defer redirect to allow state to settle
          setTimeout(() => {
            const currentPath = window.location.pathname;
            console.log('[AUTH DEBUG] Current path:', currentPath);
            
            if (currentPath === '/' || currentPath === '/signin' || currentPath === '/signup') {
              console.log('[AUTH DEBUG] Redirecting to /app...');
              try {
                window.location.href = '/app';
              } catch (redirectError) {
                console.error('[AUTH DEBUG] Redirect failed:', redirectError);
              }
            } else {
              console.log('[AUTH DEBUG] No redirect needed, already on:', currentPath);
            }
          }, 200);
        } catch (error) {
          console.error('[AUTH DEBUG] Error in SIGNED_IN handler:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH DEBUG] SIGNED_OUT event triggered');
        setIsNewUser(false);
        setIsEmailUnconfirmed(false);
        setHasCompletedOnboarding(false);
        
        // Redirect to home on sign out
        if (window.location.pathname === '/app' || window.location.pathname.startsWith('/app')) {
          window.location.href = '/';
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
        console.log('[AUTH DEBUG] Initial session found:', session.user.email);
        
        try {
          setSession(session);
          setUser(session.user);
          setIsEmailUnconfirmed(!session.user.email_confirmed_at);
          console.log('[AUTH DEBUG] Initial session email confirmed:', !!session.user.email_confirmed_at);
          
          // Defer Supabase call to prevent deadlock
          setTimeout(() => {
            console.log('[AUTH DEBUG] Initial session - checking onboarding status...');
            checkOnboardingStatus(session.user.id).catch(err => {
              console.error('[AUTH DEBUG] Initial onboarding check failed:', err);
            });
          }, 0);
          
          // Defer redirect for existing sessions
          setTimeout(() => {
            const currentPath = window.location.pathname;
            console.log('[AUTH DEBUG] Initial session - Current path:', currentPath);
            
            if (currentPath === '/' || currentPath === '/signin' || currentPath === '/signup') {
              console.log('[AUTH DEBUG] Initial session - Redirecting to /app...');
              try {
                window.location.href = '/app';
              } catch (redirectError) {
                console.error('[AUTH DEBUG] Initial session redirect failed:', redirectError);
              }
            } else {
              console.log('[AUTH DEBUG] Initial session - No redirect needed');
            }
          }, 200);
        } catch (error) {
          console.error('[AUTH DEBUG] Error in initial session handler:', error);
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
    console.log('[AUTH DEBUG] signIn called for:', email);
    
    if (authPending) {
      console.log('[AUTH DEBUG] Auth already pending, rejecting');
      return { error: { message: 'Authentication request already in progress.' } };
    }

    try {
      setAuthPending(true);
      console.log('[AUTH DEBUG] Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('[AUTH DEBUG] signInWithPassword response - error:', error, 'data:', data?.user?.email);
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          console.log('[AUTH DEBUG] Email not confirmed');
          setIsEmailUnconfirmed(true);
        }
        console.log('[AUTH DEBUG] Sign in error:', error.message);
      } else {
        console.log('[AUTH DEBUG] Sign in successful - waiting for auth state change event...');
      }
      
      setAuthPending(false);
      return { error };
    } catch (err) {
      console.error('[AUTH DEBUG] Sign in unexpected error:', err);
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
