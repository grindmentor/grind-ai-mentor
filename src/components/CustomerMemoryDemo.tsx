
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerMemory } from "@/hooks/useCustomerMemory";
import { showSuccessToast, showInfoToast } from "@/components/EnhancedToast";
import { Brain, Heart, Target, User, Activity } from "lucide-react";
import { useState } from "react";

const CustomerMemoryDemo = () => {
  const { 
    customerProfile, 
    loading, 
    updateCustomerProfile, 
    logInteraction, 
    addToFavorites,
    getCustomerInsights 
  } = useCustomerMemory();

  const [fitnessGoals, setFitnessGoals] = useState('');
  const [notes, setNotes] = useState('');

  const insights = getCustomerInsights();

  const handleUpdateGoals = async () => {
    if (!fitnessGoals.trim()) return;
    
    await updateCustomerProfile({ fitness_goals: fitnessGoals });
    await logInteraction('profile', 'update_goals', { goals: fitnessGoals });
    showSuccessToast('Fitness goals updated!', 'Your goals have been saved to your profile.');
    setFitnessGoals('');
  };

  const handleAddNotes = async () => {
    if (!notes.trim()) return;
    
    await updateCustomerProfile({ notes });
    await logInteraction('profile', 'add_notes', { notes_length: notes.length });
    showSuccessToast('Notes saved!', 'Your notes have been added to your profile.');
    setNotes('');
  };

  const testFeatures = async () => {
    await logInteraction('demo', 'test_interaction', { feature: 'customer_memory' });
    await addToFavorites('Customer Memory System');
    showInfoToast('Interaction logged!', 'This interaction has been saved to your profile.');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Customer Memory System</CardTitle>
              <CardDescription>Advanced AI remembers your preferences and history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {customerProfile && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Profile Information</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Display Name:</strong> {customerProfile.display_name || 'Not set'}</p>
                  <p><strong>Member Since:</strong> {new Date(customerProfile.created_at).toLocaleDateString()}</p>
                  <p><strong>Last Active:</strong> {new Date(customerProfile.last_active).toLocaleDateString()}</p>
                  <p><strong>Subscription:</strong> <Badge variant="secondary">{customerProfile.subscription_tier}</Badge></p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Activity Stats</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Total Interactions:</strong> {customerProfile.interaction_count}</p>
                  <p><strong>Fitness Goals:</strong> {customerProfile.fitness_goals || 'Not set'}</p>
                  <p><strong>Experience Level:</strong> {customerProfile.experience_level || 'Not set'}</p>
                  <p><strong>Preferred Style:</strong> {customerProfile.preferred_workout_style || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          {insights && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">AI Insights</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Most Used Feature</p>
                  <p className="text-muted-foreground">{insights.mostUsedFeature || 'None yet'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Daily Usage</p>
                  <p className="text-muted-foreground">{insights.averageInteractionsPerDay} interactions/day</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Days Active</p>
                  <p className="text-muted-foreground">{insights.daysSinceFirstUse} days</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Update Your Profile</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Fitness Goals</Label>
                <Input
                  id="goals"
                  placeholder="e.g., Lose 10kg, Build muscle, Run a marathon"
                  value={fitnessGoals}
                  onChange={(e) => setFitnessGoals(e.target.value)}
                />
                <Button onClick={handleUpdateGoals} disabled={!fitnessGoals.trim()}>
                  Update Goals
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Personal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any personal notes or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={handleAddNotes} disabled={!notes.trim()}>
                  Save Notes
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={testFeatures} variant="outline" className="w-full">
              Test Customer Memory System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerMemoryDemo;
