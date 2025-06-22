
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

const UpgradeSection = () => {
  const navigate = useNavigate();
  const { currentTier, isSubscribed } = useSubscription();

  if (isSubscribed) return null;

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Unlock Premium Features</h3>
            <div className="text-sm text-white/90 space-y-1">
              <div>• Unlimited queries</div>
              <div>• 20 photos/month</div>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
          >
            Upgrade - $15/mo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeSection;
