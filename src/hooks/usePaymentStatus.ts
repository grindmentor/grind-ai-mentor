
import { useEffect, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';

export const usePaymentStatus = () => {
  const { refreshSubscription, currentTier } = useSubscription();
  const { toast } = useToast();

  const checkPaymentStatus = useCallback(async () => {
    try {
      await refreshSubscription();
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [refreshSubscription]);

  // Listen for messages from Stripe checkout window
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'STRIPE_PAYMENT_SUCCESS') {
        toast({
          title: "Payment Successful!",
          description: "Your premium features are now activating...",
        });
        
        // Check payment status with retries
        let attempts = 0;
        const maxAttempts = 10;
        const checkWithRetry = async () => {
          await checkPaymentStatus();
          attempts++;
          
          if (attempts < maxAttempts) {
            setTimeout(checkWithRetry, 2000);
          }
        };
        
        checkWithRetry();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkPaymentStatus, toast]);

  // Auto-refresh on focus (when user returns from payment)
  useEffect(() => {
    const handleFocus = () => {
      checkPaymentStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkPaymentStatus]);

  return { checkPaymentStatus };
};
