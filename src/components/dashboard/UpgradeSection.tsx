
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
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Unlock Premium Features</h3>
          <p className="text-gray-300 mb-6">
            Get unlimited usage and support the development of new AI features
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Upgrade to Premium - $15/mo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeSection;
