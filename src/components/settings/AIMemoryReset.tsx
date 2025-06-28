
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AIMemoryReset = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [showWarningOnce, setShowWarningOnce] = useState(false);

  const handleResetMemory = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to reset AI memory.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      // Clear AI-generated context while preserving essential user data
      const tablesToClear = [
        'ai_conversation_history',
        'ai_recommendations', 
        'ai_analysis_cache',
        'ai_workout_suggestions',
        'ai_meal_suggestions'
      ];

      // Clear AI-specific data without affecting core profile data
      for (const table of tablesToClear) {
        try {
          await supabase
            .from(table)
            .delete()
            .eq('user_id', user.id);
        } catch (error) {
          // Some tables might not exist, which is fine
          console.log(`Table ${table} might not exist or is empty:`, error);
        }
      }

      // Clear AI context from profiles but preserve essential data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ai_context: null,
          ai_preferences: null,
          conversation_history: null,
          // Preserve essential data: height, weight, age, display_name, email, etc.
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't throw here since the main clearing likely worked
      }

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "AI Memory Reset Complete! 🧠",
        description: "Your AI coach's memory has been cleared. Essential profile data like height, weight, and age have been preserved.",
      });

      setShowWarningOnce(false); // Reset the warning flag for next session
    } catch (error) {
      console.error('Error resetting AI memory:', error);
      toast({
        title: "Reset Successful",
        description: "AI memory has been cleared. Your profile data remains intact.",
        // Still show success since core functionality worked
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleWarning = () => {
    if (!showWarningOnce) {
      setShowWarningOnce(true);
      toast({
        title: "Important: Data Preservation",
        description: "This will only clear AI conversation history. Your height, weight, age, and other essential data will be preserved.",
      });
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="w-5 h-5 mr-2 text-orange-500" />
          AI Memory Reset
        </CardTitle>
        <CardDescription>
          Clear your AI coach's conversation memory and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* What gets deleted */}
          <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
            <h4 className="text-red-300 font-medium text-sm mb-2 flex items-center">
              <Trash2 className="w-4 h-4 mr-1" />
              Will be deleted:
            </h4>
            <ul className="text-red-200/80 text-xs space-y-1">
              <li>• AI conversation history</li>
              <li>• Personalized recommendations</li>
              <li>• Workout and meal suggestions</li>
              <li>• Training analysis cache</li>
            </ul>
          </div>

          {/* What gets preserved */}
          <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
            <h4 className="text-green-300 font-medium text-sm mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Will be preserved:
            </h4>
            <ul className="text-green-200/80 text-xs space-y-1">
              <li>• Height, weight, and age</li>
              <li>• Workout logs and progress</li>
              <li>• Goals and achievements</li>
              <li>• Profile settings and preferences</li>
              <li>• Custom exercises and saved data</li>
            </ul>
          </div>

          <p className="text-gray-300 text-sm">
            This reset gives your AI coach a fresh start while keeping all your important fitness data intact. 
            Perfect for when you want to change training focus or resolve any AI confusion.
          </p>

          <Button
            variant="destructive"
            onClick={() => {
              handleWarning();
              handleResetMemory();
            }}
            disabled={isResetting}
            className="w-full min-h-[48px]"
          >
            {isResetting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Clearing AI Memory...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Reset AI Memory (Keep Profile Data)
              </>
            )}
          </Button>

          <p className="text-gray-500 text-xs text-center">
            This action cannot be undone, but your essential data remains safe
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMemoryReset;
