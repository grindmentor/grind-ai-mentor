
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Brain, Trash2 } from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';

const AIMemoryReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { resetAIMemory } = useUserData();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAIMemory();
      toast.success('AI memory has been reset. Only basic measurements and preferences are retained.');
    } catch (error) {
      toast.error('Failed to reset AI memory. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Brain className="w-5 h-5 mr-2 text-orange-500" />
          AI Memory Management
        </CardTitle>
        <CardDescription>
          Reset AI's memory while preserving essential data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>This will reset:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Training experience and preferences</li>
            <li>Dietary preferences and restrictions</li>
            <li>Fitness goals and activity levels</li>
            <li>All conversation history with CoachGPT</li>
            <li>Injury and limitation notes</li>
          </ul>
          
          <p className="pt-2"><strong>This will keep:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Weight and height measurements</li>
            <li>Age and birthday</li>
            <li>Unit preferences (kg/lbs, cm/ft-in)</li>
            <li>Account and subscription data</li>
          </ul>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={isResetting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset AI Memory
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Reset AI Memory?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action will permanently delete all AI conversation history and personal preferences. 
                You'll need to re-enter your fitness goals and preferences, but your basic measurements will be preserved.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReset}
                disabled={isResetting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
