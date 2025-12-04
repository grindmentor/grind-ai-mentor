import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, RefreshCw, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IOSSubscriptionManagerProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Check if running in Capacitor iOS environment
const isIOSNative = () => {
  return typeof window !== 'undefined' && 
    (window as any).Capacitor?.isNativePlatform?.() && 
    (window as any).Capacitor?.getPlatform?.() === 'ios';
};

export const IOSSubscriptionManager: React.FC<IOSSubscriptionManagerProps> = ({
  onSuccess,
  onError
}) => {
  const { currentTier, isSubscribed, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Product IDs for App Store Connect
  const PRODUCT_IDS = {
    monthly: 'com.myotopia.premium.monthly',
    annual: 'com.myotopia.premium.annual'
  };

  useEffect(() => {
    if (isIOSNative()) {
      loadProducts();
    }
  }, []);

  const loadProducts = async () => {
    try {
      // In production, this would use Capacitor Purchases plugin
      // For now, we show placeholder products
      setProducts([
        { id: PRODUCT_IDS.monthly, title: 'Premium Monthly', price: '$9.99/mo', priceValue: 9.99 },
        { id: PRODUCT_IDS.annual, title: 'Premium Annual', price: '$99.99/yr', priceValue: 99.99, savings: 'Save 17%' }
      ]);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handlePurchase = async (productId: string) => {
    setIsLoading(true);
    
    try {
      if (!isIOSNative()) {
        // Fallback for web - redirect to Stripe
        toast.info('Redirecting to payment...');
        window.location.href = '/pricing';
        return;
      }

      // In production, implement actual StoreKit purchase
      // using @capacitor-community/in-app-purchases or similar
      
      toast.success('Purchase initiated');
      
      // After successful purchase, refresh subscription status
      await refreshSubscription();
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Purchase failed');
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    
    try {
      if (!isIOSNative()) {
        await refreshSubscription();
        toast.success('Subscription status refreshed');
        return;
      }

      // In production, implement actual restore purchases
      toast.success('Purchases restored');
      await refreshSubscription();
      
    } catch (error: any) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Premium Active</h3>
              <p className="text-xs text-muted-foreground">You have full access to all features</p>
            </div>
            <Badge className="badge-tier-premium">PREMIUM</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Premium Plans */}
      {products.map((product) => (
        <Card 
          key={product.id}
          className={cn(
            "bg-card/60 border-border/50 transition-all",
            product.savings && "border-primary/40 bg-primary/5"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">{product.title}</h3>
                  {product.savings && (
                    <Badge className="bg-primary/20 text-primary text-[10px]">{product.savings}</Badge>
                  )}
                </div>
                <p className="text-lg font-bold text-foreground">{product.price}</p>
              </div>
              <Button
                onClick={() => handlePurchase(product.id)}
                disabled={isLoading}
                variant={product.savings ? 'premium' : 'default'}
                size="sm"
                className="min-w-[90px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Premium Features */}
      <Card className="bg-muted/30 border-border/30">
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Premium includes</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Unlimited AI prompts',
              'Photo analysis',
              'Physique AI',
              'Smart meal plans',
              'Advanced tracking',
              'Priority support'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-primary" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restore Purchases */}
      <Button
        onClick={handleRestorePurchases}
        disabled={isRestoring}
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground"
      >
        {isRestoring ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2" />
        )}
        Restore Purchases
      </Button>

      <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
        Payment will be charged to your Apple ID account. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
      </p>
    </div>
  );
};

export default IOSSubscriptionManager;
