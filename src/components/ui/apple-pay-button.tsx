import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplePayButtonProps {
  amount: number;
  onSuccess: (paymentResult: any) => void;
  onError: (error: any) => void;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    ApplePaySession: any;
  }
}

export const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  amount,
  onSuccess,
  onError,
  className,
  disabled = false
}) => {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    const checkApplePayAvailability = () => {
      if (window.ApplePaySession) {
        const isAvailable = window.ApplePaySession.canMakePayments();
        setIsApplePayAvailable(isAvailable);
      }
    };

    checkApplePayAvailability();
  }, []);

  const handleApplePayClick = async () => {
    if (!window.ApplePaySession || disabled) return;
    
    setIsLoading(true);
    
    try {
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Myotopia Premium',
          amount: amount.toString(),
          type: 'final'
        }
      };

      const session = new window.ApplePaySession(3, paymentRequest);
      
      session.onvalidatemerchant = async (event: any) => {
        // This would typically validate with your backend
        // For now, we'll show that Apple Pay is being processed
        console.log('Apple Pay merchant validation:', event);
      };
      
      session.onpaymentauthorized = (event: any) => {
        // Handle payment authorization
        const payment = event.payment;
        
        // Process payment with your backend
        onSuccess(payment);
        
        session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        setIsLoading(false);
      };
      
      session.oncancel = () => {
        setIsLoading(false);
      };
      
      session.begin();
      
    } catch (error) {
      console.error('Apple Pay error:', error);
      onError(error);
      setIsLoading(false);
    }
  };

  // Don't render if Apple Pay is not available
  if (!isApplePayAvailable) {
    return null;
  }

  return (
    <Button
      onClick={handleApplePayClick}
      disabled={disabled || isLoading}
      className={cn(
        "bg-black text-white hover:bg-gray-800 border border-gray-300 rounded-lg px-6 py-3",
        "flex items-center justify-center space-x-2 font-medium",
        "transition-all duration-200 transform hover:scale-105",
        className
      )}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-black" />
          </div>
          <span>Pay with Apple Pay</span>
        </>
      )}
    </Button>
  );
};

export default ApplePayButton;