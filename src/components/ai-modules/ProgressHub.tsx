import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, Calendar, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface GoalProgressEntry {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  logged_at: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit?: string;
  category: string;
  deadline?: string;
}

interface ProgressHubProps {
  onBack: () => void;
}

export const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressEntries, setProgressEntries] = useState<GoalProgressEntry[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('fitness');

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGoal) {
      loadProgressEntries(selectedGoal);
    }
  }, [selectedGoal]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals.',
        variant: 'destructive'
      });
    }
  };

  const loadProgressEntries = async (goalId: string) => {
    try {
      // Mock progress entries for now
      const mockEntries: GoalProgressEntry[] = [
        {
          id: '1',
          goal_id: goalId,
          value: 120,
          notes: 'Good workout today',
          logged_at: new Date().toISOString()
        },
        {
          id: '2',
          goal_id: goalId,
          value: 110,
          notes: 'Felt strong',
          logged_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setProgressEntries(mockEntries);
    } catch (error) {
      console.error('Error loading progress entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load progress entries.',
        variant: 'destructive'
      });
    }
  };

  const handleAddGoal = async () => {
    if (!user || !newGoalTitle.trim() || !newGoalTarget.trim()) return;

    setIsAddingGoal(true);
    try {
      const targetValue = parseFloat(newGoalTarget);
      if (isNaN(targetValue)) {
        toast({
          title: 'Invalid Target',
          description: 'Please enter a valid number for the target value.',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: newGoalTitle.trim(),
          target_value: targetValue,
          unit: newGoalUnit.trim() || undefined,
          category: newGoalCategory,
          current_value: 0
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [...prev, data]);
      setNewGoalTitle('');
      setNewGoalTarget('');
      setNewGoalUnit('');
      setIsAddingGoal(false);
      toast({
        title: 'Goal Added! 🎉',
        description: `New goal "${newGoalTitle}" has been added.`
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add goal.',
        variant: 'destructive'
      });
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleGoalUpdated = () => {
    loadGoals();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/50 to-purple-900/30">
      {isMobile ? (
        <MobileHeader 
          title="Progress Hub" 
          onBack={onBack}
        />
      ) : (
        <div className="p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-gray-800 hover:text-pink-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500/30 to-purple-500/40 rounded-xl flex items-center justify-center border border-pink-500/30">
                  <BarChart3 className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Progress Hub</h1>
                  <p className="text-pink-200/80">Track your fitness journey and goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List */}
          <Card className="bg-gradient-to-br from-pink-900/20 to-purple-900/30 backdrop-blur-sm border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-pink-200">Your Goals</CardTitle>
              <CardDescription className="text-pink-200/80">
                Track your progress and stay motivated
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-8 text-pink-300/70">
                  <Target className="w-12 h-12 mx-auto mb-3 text-pink-400/50" />
                  <p>No goals added yet.</p>
                  <p className="text-sm mt-1">Add a goal to start tracking your progress!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {goals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant="ghost"
                      className={`w-full justify-start text-white hover:bg-pink-800/30 ${selectedGoal === goal.id ? 'bg-pink-800/30' : ''}`}
                      onClick={() => setSelectedGoal(goal.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-pink-300/80">
                            {goal.current_value}/{goal.target_value} {goal.unit}
                          </p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-pink-400" />
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {/* Add Goal Form */}
              {isAddingGoal ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-pink-200">Goal Title</Label>
                    <Input
                      type="text"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="e.g., Run 5k"
                      className="bg-pink-900/30 border-pink-500/50 text-white placeholder:text-pink-300/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-pink-200">Target Value</Label>
                      <Input
                        type="number"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        placeholder="e.g., 5"
                        className="bg-pink-900/30 border-pink-500/50 text-white placeholder:text-pink-300/50"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-pink-200">Unit (Optional)</Label>
                      <Input
                        type="text"
                        value={newGoalUnit}
                        onChange={(e) => setNewGoalUnit(e.target.value)}
                        placeholder="e.g., km"
                        className="bg-pink-900/30 border-pink-500/50 text-white placeholder:text-pink-300/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-pink-200">Category</Label>
                    <Select value={newGoalCategory} onValueChange={(value: any) => setNewGoalCategory(value)}>
                      <SelectTrigger className="bg-pink-900/30 border-pink-500/50 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-pink-800 border-pink-500/30">
                        <SelectItem value="fitness">💪 Fitness</SelectItem>
                        <SelectItem value="nutrition">🍎 Nutrition</SelectItem>
                        <SelectItem value="wellness">🧘 Wellness</SelectItem>
                        <SelectItem value="other">✨ Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingGoal(false)}
                      className="border-pink-500/50 text-pink-300 hover:bg-pink-500/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddGoal}
                      disabled={!newGoalTitle.trim() || !newGoalTarget.trim()}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      Add Goal
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAddingGoal(true)}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Goal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Progress Log */}
          <Card className="bg-gradient-to-br from-pink-900/20 to-purple-900/30 backdrop-blur-sm border-pink-500/30 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-pink-200">Progress Log</CardTitle>
              <CardDescription className="text-pink-200/80">
                Track your progress towards your goals
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedGoal ? (
                <div>
                  {/* GoalProgressLogger Component */}
                  {/* <GoalProgressLogger goalId={selectedGoal} /> */}
                  <div>
                    <h3 className="text-lg font-semibold text-pink-200 mb-3">
                      Progress Entries for Goal ID: {selectedGoal}
                    </h3>
                    {progressEntries.length === 0 ? (
                      <p className="text-pink-300/70">No progress entries yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {progressEntries.map((entry) => (
                          <div key={entry.id} className="p-3 bg-pink-900/20 rounded-lg border border-pink-500/20">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-pink-300 font-medium">Value: {entry.value}</span>
                                {entry.notes && (
                                  <p className="text-pink-200/70 text-sm mt-1">Notes: {entry.notes}</p>
                                )}
                              </div>
                              <span className="text-pink-400/60 text-xs">
                                Logged at: {new Date(entry.logged_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-pink-300/70">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-pink-400/50" />
                  <p>Select a goal to view progress.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
