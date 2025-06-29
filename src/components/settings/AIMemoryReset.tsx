
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RotateCcw, AlertTriangle } from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AIMemoryReset = () => {
  const { resetAIMemory } = useUserData();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAIMemory();
      toast.success('AI memory has been successfully reset');
    } catch (error) {
      console.error('Error resetting AI memory:', error);
      toast.error('Failed to reset AI memory. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="w-5 h-5 mr-2 text-orange-500" />
          AI Memory Reset
        </CardTitle>
        <CardDescription className="text-gray-400">
          Clear all AI conversation history and personalized data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-yellow-300 font-medium mb-2">What gets reset:</h4>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• All coach conversations and chat history</li>
                <li>• AI-learned preferences and habits</li>
                <li>• Personalized recommendations</li>
                <li>• Training and nutrition insights</li>
              </ul>
              <h4 className="text-yellow-300 font-medium mt-3 mb-2">What stays:</h4>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• Your basic profile (weight, height, age)</li>
                <li>• Workout logs and progress data</li>
                <li>• Goals and achievements</li>
                <li>• App preferences and settings</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isResetting}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isResetting ? 'Resetting...' : 'Reset AI Memory'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirm AI Memory Reset</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. All AI conversation history and personalized data will be permanently deleted.
                Your workout logs, goals, and basic profile information will remain intact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700"
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset Memory'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default AIMemoryReset;
