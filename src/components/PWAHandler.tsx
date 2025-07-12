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

    // Handle protocol navigation (myotopia:// URLs)
    const protocol = searchParams.get('protocol');
    if (protocol) {
      try {
        const protocolUrl = new URL(protocol);
        const action = protocolUrl.pathname.substring(1); // Remove leading /
        
        // Clear the protocol parameter from URL
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('protocol');
        const newUrl = newParams.toString() 
          ? `${window.location.pathname}?${newParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Navigate based on protocol action
        switch (action) {
          case 'workout':
            // Set module parameter for Dashboard to pick up
            navigate('/app?module=workout-logger');
            toast.success('Opening Workout Logger');
            break;
          case 'nutrition':
            navigate('/app?module=food-log');
            toast.success('Opening Smart Food Log');
            break;
          case 'progress':
            navigate('/app?module=progress-hub');
            toast.success('Opening Progress Hub');
            break;
          case 'coach':
            navigate('/app?module=coachgpt');
            toast.success('Opening CoachGPT');
            break;
          default:
            toast.info('Welcome to Myotopia!');
            break;
        }
      } catch (error) {
        console.error('Error parsing protocol URL:', error);
        toast.error('Invalid protocol URL');
      }
    }
  }, [searchParams, navigate]);

  return null;
};

export default PWAHandler;