import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscription, currentTier } = useSubscription();

  useEffect(() => {
    // Refresh subscription status when component mounts
    const refreshStatus = async () => {
      try {
        await refreshSubscription();
        if (currentTier === 'premium') {
          toast.success('Welcome to Myotopia Premium!');
        }
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    };

    refreshStatus();
  }, [refreshSubscription, currentTier]);

  const handleContinue = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/80 border-green-500/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Payment Successful!
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-green-300 font-medium">
              Welcome to Myotopia Premium
            </p>
            <p className="text-gray-300 text-sm">
              Your premium features are now active and ready to use!
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h3 className="text-orange-300 font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Premium Features Unlocked
            </h3>
            <ul className="text-sm text-orange-200/80 space-y-1">
              <li>• Unlimited AI coaching conversations</li>
              <li>• Advanced progress tracking</li>
              <li>• Custom meal plans & nutrition</li>
              <li>• Physique AI analysis</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              Start Your Premium Journey
            </Button>
            
            <p className="text-center text-xs text-gray-400">
              You can manage your subscription anytime in Settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};