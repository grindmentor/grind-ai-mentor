import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, birthDate?: string) => Promise<{ error: any; data?: any }>;
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
      // Check localStorage first for immediate response - this is the primary check
      const localOnboarding = localStorage.getItem(`myotopia_onboarding_${userId}`);
      if (localOnboarding === 'completed') {
        setHasCompletedOnboarding(true);
        return;
      }
      
      // Check database for profile data to determine onboarding completion
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('weight, height, experience, activity, goal')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && profile) {
        // Consider onboarding complete if user has filled any 3 of the 5 fields
        // This allows users to skip some optional fields
        const filledFields = [
          profile.weight,
          profile.height,
          profile.experience,
          profile.activity,
          profile.goal
        ].filter(Boolean).length;
        
        const isComplete = filledFields >= 3;
        setHasCompletedOnboarding(isComplete);
        
        // Update localStorage to match database state
        if (isComplete) {
          localStorage.setItem(`myotopia_onboarding_${userId}`, 'completed');
        }
      } else {
        // If no profile exists, check if this is a returning user by checking localStorage
        // This prevents showing onboarding repeatedly for existing users
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      logger.warn('Could not check onboarding status:', error);
      // On error, assume onboarding is complete to prevent blocking users
      setHasCompletedOnboarding(true);
    }
  };

  // Mark onboarding as complete
  const markOnboardingComplete = () => {
    if (user) {
      try {
        localStorage.setItem(`myotopia_onboarding_${user.id}`, 'completed');
        setHasCompletedOnboarding(true);
      } catch (error) {
        logger.warn('Could not save onboarding completion to localStorage:', error);
      }
    }
  };

  useEffect(() => {
    logger.debug('Initializing auth context');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        logger.debug('[AUTH DEBUG] SIGNED_IN event triggered for:', session.user.email);
        
        try {
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          const minutesDiff = timeDiff / (1000 * 60);
          
          logger.debug('[AUTH DEBUG] User age in minutes:', minutesDiff);
          setIsNewUser(minutesDiff < 5);
          setIsEmailUnconfirmed(!session.user.email_confirmed_at);
          logger.debug('[AUTH DEBUG] Email confirmed:', !!session.user.email_confirmed_at);
          
          // Defer Supabase call to prevent deadlock
          setTimeout(() => {
            logger.debug('[AUTH DEBUG] Checking onboarding status...');
            checkOnboardingStatus(session.user.id).catch(err => {
              logger.error('[AUTH DEBUG] Onboarding check failed:', err);
            });
          }, 0);
          
          // Defer redirect to allow state to settle
          setTimeout(() => {
            const currentPath = window.location.pathname;
            logger.debug('[AUTH DEBUG] Current path:', currentPath);
            
            if (currentPath === '/' || currentPath === '/signin' || currentPath === '/signup') {
              logger.debug('[AUTH DEBUG] Redirecting to /app...');
              try {
                window.location.href = '/app';
              } catch (redirectError) {
                logger.error('[AUTH DEBUG] Redirect failed:', redirectError);
              }
            } else {
              logger.debug('[AUTH DEBUG] No redirect needed, already on:', currentPath);
            }
          }, 200);
        } catch (error) {
          logger.error('[AUTH DEBUG] Error in SIGNED_IN handler:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        logger.debug('[AUTH DEBUG] SIGNED_OUT event triggered');
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
        logger.error('Error getting session:', error);
      }
      
      if (session?.user) {
        logger.debug('[AUTH DEBUG] Initial session found:', session.user.email);
        
        try {
          setSession(session);
          setUser(session.user);
          setIsEmailUnconfirmed(!session.user.email_confirmed_at);
          logger.debug('[AUTH DEBUG] Initial session email confirmed:', !!session.user.email_confirmed_at);
          
          // Defer Supabase call to prevent deadlock
          setTimeout(() => {
            logger.debug('[AUTH DEBUG] Initial session - checking onboarding status...');
            checkOnboardingStatus(session.user.id).catch(err => {
              logger.error('[AUTH DEBUG] Initial onboarding check failed:', err);
            });
          }, 0);
          
          // Defer redirect for existing sessions
          setTimeout(() => {
            const currentPath = window.location.pathname;
            logger.debug('[AUTH DEBUG] Initial session - Current path:', currentPath);
            
            if (currentPath === '/' || currentPath === '/signin' || currentPath === '/signup') {
              logger.debug('[AUTH DEBUG] Initial session - Redirecting to /app...');
              try {
                window.location.href = '/app';
              } catch (redirectError) {
                logger.error('[AUTH DEBUG] Initial session redirect failed:', redirectError);
              }
            } else {
              logger.debug('[AUTH DEBUG] Initial session - No redirect needed');
            }
          }, 200);
        } catch (error) {
          logger.error('[AUTH DEBUG] Error in initial session handler:', error);
        }
      }
      
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, birthDate?: string) => {
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another verification email.' } };
    }

    setAuthPending(true);
    
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    logger.debug('Sign up attempt with redirect URL:', redirectUrl);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email_confirm: true,
            birth_date: birthDate
          }
        }
      });

      if (!error && data.user) {
        try {
          await supabase.from('subscribers').insert({ email });
        } catch (subscriberError) {
          logger.warn('Could not add to subscribers:', subscriberError);
        }
        
        // Save birthday to profile if provided
        if (birthDate) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              birthday: birthDate,
              age_verified: true
            });
            logger.debug('Saved birthday to profile');
          } catch (profileError) {
            logger.warn('Could not save birthday to profile:', profileError);
          }
        }
        
        setCanResendEmail(false);
        setTimeout(() => setCanResendEmail(true), 60000);
      }

      setAuthPending(false);
      return { error, data };
    } catch (err) {
      logger.error('Sign up error:', err);
      setAuthPending(false);
      return { error: { message: 'An unexpected error occurred during sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    logger.debug('[AUTH DEBUG] signIn called for:', email);
    
    if (authPending) {
      logger.debug('[AUTH DEBUG] Auth already pending, rejecting');
      return { error: { message: 'Authentication request already in progress.' } };
    }

    try {
      setAuthPending(true);
      logger.debug('[AUTH DEBUG] Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      logger.debug('[AUTH DEBUG] signInWithPassword response - error:', error, 'data:', data?.user?.email);
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          logger.debug('[AUTH DEBUG] Email not confirmed');
          setIsEmailUnconfirmed(true);
        }
        logger.debug('[AUTH DEBUG] Sign in error:', error.message);
      } else {
        logger.debug('[AUTH DEBUG] Sign in successful - waiting for auth state change event...');
      }
      
      setAuthPending(false);
      return { error };
    } catch (err) {
      logger.error('[AUTH DEBUG] Sign in unexpected error:', err);
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
      logger.error('Sign out error:', error);
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
      logger.error('Password reset error:', err);
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
      logger.error('Resend confirmation error:', err);
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
