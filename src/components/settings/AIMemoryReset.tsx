
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const AIMemoryReset = () => {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetMemory = async () => {
    setIsResetting(true);
    try {
      // Simulate API call to reset AI memory
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "AI Memory Reset",
        description: "Your AI coach memory has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset AI memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="w-5 h-5 mr-2 text-orange-500" />
          AI Memory
        </CardTitle>
        <CardDescription>
          Reset your AI coach's memory of past conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            This will clear all conversation history and personalized recommendations from your AI coach. 
            Your profile data and preferences will remain intact.
          </p>
          <Button
            variant="destructive"
            onClick={handleResetMemory}
            disabled={isResetting}
            className="w-full min-h-[48px]"
          >
            {isResetting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Resetting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Reset AI Memory
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMemoryReset;
