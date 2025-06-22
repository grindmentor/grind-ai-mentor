
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UpgradeSectionProps {
  onUpgrade: (planName: string, price: number) => void;
}

const UpgradeSection = ({ onUpgrade }: UpgradeSectionProps) => {
  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Boost Your Limits</h3>
          <p className="text-gray-300 mb-6">
            Get more usage per month and support the development of new AI features
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => onUpgrade('Basic', 10)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Basic Plan - $10/mo
            </Button>
            <Button 
              onClick={() => onUpgrade('Premium', 15)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Premium Plan - $15/mo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeSection;
