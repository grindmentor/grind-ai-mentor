
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
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
          setIsNewUser(minutesDiff < 5);
          
          // Check if email is confirmed
          setIsEmailUnconfirmed(!session.user.email_confirmed_at);
        } else if (event === 'SIGNED_OUT') {
          setIsNewUser(false);
          setIsEmailUnconfirmed(false);
        }
        
        setAuthPending(false);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setIsEmailUnconfirmed(!session.user.email_confirmed_at);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Prevent multiple requests
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another verification email.' } };
    }

    setAuthPending(true);
    
    // Use grindmentor.xyz domain for redirect
    const redirectUrl = `https://grindmentor.xyz/auth/callback`;
    
    console.log('Sign up attempt with redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        // This ensures the confirmation email gets sent
        data: {
          email_confirm: true
        }
      }
    });

    console.log('Sign up result:', { error });

    // Also add to subscribers table for email campaigns
    if (!error) {
      await supabase.from('subscribers').insert({ email });
      
      // Rate limit email sending
      setCanResendEmail(false);
      setTimeout(() => setCanResendEmail(true), 60000); // 1 minute cooldown
    }

    setAuthPending(false);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (authPending) {
      return { error: { message: 'Authentication request already in progress.' } };
    }

    setAuthPending(true);
    console.log('Sign in attempt for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Handle specific error cases
      if (error.message.includes('Email not confirmed')) {
        setIsEmailUnconfirmed(true);
      }
    }
    
    console.log('Sign in result:', { error });
    setAuthPending(false);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsEmailUnconfirmed(false);
    setAuthPending(false);
  };

  const resetPassword = async (email: string) => {
    // Prevent multiple requests
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another reset email.' } };
    }

    setAuthPending(true);

    // Use grindmentor.xyz domain for redirect
    const redirectUrl = `https://grindmentor.xyz/auth/callback`;
    console.log('Password reset for:', email, 'with redirect:', redirectUrl);
    
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
  };

  const resendConfirmationEmail = async (email: string) => {
    // Prevent multiple requests
    if (authPending || !canResendEmail) {
      return { error: { message: 'Please wait before sending another confirmation email.' } };
    }

    setAuthPending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `https://grindmentor.xyz/auth/callback`
      }
    });

    if (!error) {
      // Rate limit email sending
      setCanResendEmail(false);
      setTimeout(() => setCanResendEmail(true), 60000); // 1 minute cooldown
    }

    setAuthPending(false);
    return { error };
  };

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
      authPending
    }}>
      {children}
    </AuthContext.Provider>
  );
};
