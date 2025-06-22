
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback processing...');
        
        // Get the hash fragment (after #) which contains the auth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('Auth callback type:', type);
        console.log('Has access token:', !!accessToken);

        if (type === 'recovery') {
          // This is a password reset
          setIsPasswordReset(true);
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage('Failed to authenticate. The reset link may have expired.');
            } else {
              setStatus('success');
              setMessage('Password reset authenticated successfully. You can now change your password.');
            }
          } else {
            setStatus('error');
            setMessage('Invalid password reset link.');
          }
        } else if (type === 'signup') {
          // This is email confirmation
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage('Failed to confirm email. The confirmation link may have expired.');
            } else {
              setStatus('success');
              setMessage('Email confirmed successfully! Redirecting to your dashboard...');
              
              // Redirect returning users to app, new users to onboarding
              setTimeout(() => {
                navigate('/app');
              }, 2000);
            }
          } else {
            setStatus('error');
            setMessage('Invalid confirmation link.');
          }
        } else {
          // Fallback: try to exchange the code for a session
          const code = searchParams.get('code');
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Auth callback error:', error);
              setStatus('error');
              setMessage('Authentication failed. The link may have expired or is invalid.');
            } else if (data.session) {
              setStatus('success');
              setMessage('Welcome back! Redirecting to your dashboard...');
              
              // Redirect to app for returning users
              setTimeout(() => {
                navigate('/app');
              }, 2000);
            } else {
              setStatus('error');
              setMessage('No valid authentication found.');
            }
          } else {
            setStatus('error');
            setMessage('No authentication code found.');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const handleContinue = () => {
    if (isPasswordReset && status === 'success') {
      // For password reset, go to a password change page or settings
      navigate('/settings');
    } else if (status === 'success') {
      // For email confirmation, go to app dashboard
      navigate('/app');
    } else {
      // For errors, go back to sign in
      navigate('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-2xl font-bold">GrindMentor</span>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">
              {status === 'loading' && 'Processing...'}
              {status === 'success' && (isPasswordReset ? 'Password Reset Ready' : 'Email Confirmed')}
              {status === 'error' && 'Authentication Error'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {status === 'loading' && 'Please wait while we verify your request'}
              {status === 'success' && 'Authentication completed successfully'}
              {status === 'error' && 'There was a problem with your authentication'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              {status === 'loading' && (
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              )}
              
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}

              <p className="text-gray-300 mb-6">{message}</p>
              
              {status !== 'loading' && (
                <Button 
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {status === 'success' 
                    ? (isPasswordReset ? 'Change Password' : 'Continue to App')
                    : 'Back to Sign In'
                  }
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
