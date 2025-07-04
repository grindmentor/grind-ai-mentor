import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PWAHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle PWA navigation after payment
    const payment = searchParams.get('payment');
    const pwa = searchParams.get('pwa');
    
    if (payment && pwa) {
      // Clear the URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Show appropriate message
      if (payment === 'success') {
        toast.success('Payment successful! Welcome to Premium!');
        // Refresh subscription status
        window.location.reload();
      } else if (payment === 'cancelled') {
        toast.error('Payment cancelled. You can try again anytime.');
      }
    }
  }, [searchParams]);

  return null;
};

export default PWAHandler;