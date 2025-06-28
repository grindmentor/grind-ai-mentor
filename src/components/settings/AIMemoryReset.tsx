
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AIMemoryReset = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetMemory = async () => {
    if (!user) return;

    setIsResetting(true);
    try {
      // Clear AI-related data while preserving crucial user information
      const resetOperations = [
        // Clear workout sessions (AI workout data)
        supabase.from('workout_sessions').delete().eq('user_id', user.id),
        
        // Clear progressive overload entries (AI training data)
        supabase.from('progressive_overload_entries').delete().eq('user_id', user.id),
        
        // Clear custom exercises (AI-created exercises)
        supabase.from('user_custom_exercises').delete().eq('user_id', user.id),
        
        // Clear saved exercises (AI-imported exercises)
        supabase.from('user_saved_exercises').delete().eq('user_id', user.id)
      ];

      // Clear AI conversation history if it exists (ignore errors if table doesn't exist)
      try {
        await supabase.from('ai_conversations').delete().eq('user_id', user.id);
      } catch (error) {
        console.log('AI conversations table may not exist:', error);
      }
      
      // Clear AI recommendations if they exist (ignore errors if table doesn't exist)
      try {
        await supabase.from('ai_recommendations').delete().eq('user_id', user.id);
      } catch (error) {
        console.log('AI recommendations table may not exist:', error);
      }
      
      // Clear AI memory/context data if it exists (ignore errors if table doesn't exist)
      try {
        await supabase.from('ai_memory').delete().eq('user_id', user.id);
      } catch (error) {
        console.log('AI memory table may not exist:', error);
      }

      // Execute all deletion operations
      await Promise.allSettled(resetOperations);
      
      // Note: We intentionally DO NOT clear:
      // - profiles table (height, weight, age, basic info)
      // - user preferences (units, settings)
      // - subscription data
      // - account authentication data
      
      toast({
        title: "AI Memory Reset Complete! 🧠",
        description: "Your AI coach memory has been cleared. Your profile data and preferences remain intact.",
      });
    } catch (error) {
      console.error('Error resetting AI memory:', error);
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
          Reset your AI coach's memory of past conversations and training data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="text-orange-300 font-medium mb-2">What gets cleared:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Workout sessions and training history</li>
              <li>• AI exercise recommendations</li>
              <li>• Custom and saved exercises</li>
              <li>• Conversation history with AI coach</li>
              <li>• Progressive overload tracking data</li>
            </ul>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-300 font-medium mb-2">What stays safe:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Your profile (height, weight, age)</li>
              <li>• App preferences and settings</li>
              <li>• Subscription status</li>
              <li>• Account authentication</li>
            </ul>
          </div>
          
          <Button
            variant="destructive"
            onClick={handleResetMemory}
            disabled={isResetting}
            className="w-full min-h-[48px]"
          >
            {isResetting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Resetting AI Memory...
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
