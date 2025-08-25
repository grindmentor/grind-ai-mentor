
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight } from "lucide-react";

interface WelcomeBackProps {
  userEmail: string;
  onContinue: () => void;
}

const WelcomeBack = ({ userEmail, onContinue }: WelcomeBackProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-continue after 3 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-60 p-6">
      <Card className="bg-gray-900 border-gray-800 max-w-md w-full mx-4 animate-fade-in">
        <CardContent className="text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-400 mb-6">
            Great to see you again, {userEmail.split('@')[0]}
          </p>
          
          <Button 
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            Continuing automatically in 3 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeBack;
