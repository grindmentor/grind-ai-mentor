
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setTimeout(() => navigate('/signin'), 2000);
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, user:', data.session.user.email);
          setTimeout(() => {
            navigate('/app', { replace: true });
          }, 500);
        } else {
          console.log('No session found in auth callback');
          navigate('/signin', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        setError('An unexpected error occurred during authentication');
        setTimeout(() => navigate('/signin'), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    setTimeout(handleAuthCallback, 100);
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
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-white animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-white">Myotopia</span>
        </div>

        <div className="space-y-4">
          <div className="w-48 bg-gray-800 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full animate-pulse w-full" />
          </div>
          <p className="text-gray-400 text-sm">
            {isProcessing ? 'Completing authentication...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
