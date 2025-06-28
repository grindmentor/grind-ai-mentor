
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  return <LoadingScreen message="Loading Myotopia..." />;
}
