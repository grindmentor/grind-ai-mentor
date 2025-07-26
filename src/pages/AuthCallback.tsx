
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // iOS PWA detection
  const isIOSPWA = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isIOS && isStandalone;
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback, iOS PWA:', isIOSPWA());
        
        // Check URL params for auth tokens (email confirmation)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Auth callback error:', error);
            setError(error.message);
            setTimeout(() => navigate('/signin'), 2000);
            return;
          }

          if (data.session) {
            console.log('Auth callback successful, user:', data.session.user.email);
            
            // For iOS PWA, add extra delay to ensure proper state management
            const redirectDelay = isIOSPWA() ? 1500 : 500;
            
            setTimeout(() => {
              navigate('/app', { replace: true });
            }, redirectDelay);
          } else {
            console.log('No session created from tokens');
            navigate('/signin', { replace: true });
          }
        } else {
          // Check for existing session if no URL tokens
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth session error:', error);
            setError(error.message);
            setTimeout(() => navigate('/signin'), 2000);
            return;
          }

          if (session) {
            console.log('Existing session found, redirecting to app');
            navigate('/app', { replace: true });
          } else {
            console.log('No session found in auth callback');
            navigate('/signin', { replace: true });
          }
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        setError('An unexpected error occurred during authentication');
        setTimeout(() => navigate('/signin'), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    // Add delay for iOS PWA to ensure URL parameters are properly parsed
    const processingDelay = isIOSPWA() ? 1000 : 100;
    setTimeout(handleAuthCallback, processingDelay);
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg">Authentication Error</div>
          <div className="text-gray-400 text-sm">{error}</div>
          <div className="text-gray-500 text-xs">Redirecting to sign in...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-white animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-white">Myotopia</span>
        </div>

        {/* Processing indicator */}
        <div className="space-y-4">
          <div className="w-48 bg-gray-800 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full animate-pulse w-full" />
          </div>
          <p className="text-gray-400 text-sm">
            {isProcessing 
              ? (isIOSPWA() ? 'Completing iOS authentication...' : 'Completing authentication...')
              : 'Redirecting to dashboard...'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
