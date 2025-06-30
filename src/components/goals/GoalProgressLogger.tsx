
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  goal_type: 'target' | 'habit';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  deadline?: string;
}

interface GoalLog {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  logged_date: string;
  goal_title?: string;
}

const GoalProgressLogger = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalLogs, setGoalLogs] = useState<GoalLog[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadGoalsAndLogs();
    }
  }, [user]);

  const loadGoalsAndLogs = async () => {
    if (!user) return;

    try {
      // Load active goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      // Load recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('goal_progress_logs')
        .select(`
          *,
          user_goals!inner(title)
        `)
        .eq('user_id', user.id)
        .order('logged_date', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      
      // Transform logs to include goal title
      const transformedLogs = (logsData || []).map(log => ({
        ...log,
        goal_title: log.user_goals?.title || 'Unknown Goal'
      }));
      
      setGoalLogs(transformedLogs);
    } catch (error) {
      console.error('Error loading goals and logs:', error);
      toast.error('Failed to load goals');
    }
  };

  const handleAddLog = async () => {
    if (!selectedGoal || !logValue.trim() || !user) {
      toast.error('Please select a goal and enter a value');
      return;
    }

    setLoading(true);
    try {
      const logData = {
        goal_id: selectedGoal.id,
        user_id: user.id,
        value: parseFloat(logValue),
        notes: logNotes || null,
        logged_date: new Date().toISOString().split('T')[0]
      };

      const { error: logError } = await supabase
        .from('goal_progress_logs')
        .insert([logData]);

      if (logError) throw logError;

      // Update goal's current value based on goal type
      let newCurrentValue = selectedGoal.current_value;
      
      if (selectedGoal.goal_type === 'habit') {
        // For habit goals, we might want to track completion rate or streaks
        // For now, we'll just increment the current value
        newCurrentValue = selectedGoal.current_value + parseFloat(logValue);
      } else {
        // For target goals, update to the latest logged value
        newCurrentValue = parseFloat(logValue);
      }

      const { error: updateError } = await supabase
        .from('user_goals')
        .update({ current_value: newCurrentValue })
        .eq('id', selectedGoal.id);

      if (updateError) throw updateError;

      // Reset form
      setLogValue('');
      setLogNotes('');
      setSelectedGoal(null);
      setShowLogForm(false);

      toast.success('Progress logged successfully! 📈');
      loadGoalsAndLogs(); // Reload data
    } catch (error) {
      console.error('Error logging progress:', error);
      toast.error('Failed to log progress');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardio': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'strength': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'weight': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'nutrition': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'training': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'once': return 'One-time';
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-400" />
            Log Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No active goals to track</p>
              <p className="text-gray-500 text-sm">Create some goals first to start logging progress!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 cursor-pointer hover:border-orange-500/30 transition-colors"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowLogForm(true);
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white text-sm">{goal.title}</h3>
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {getFrequencyText(goal.frequency)} • {goal.goal_type}
                      </div>
                      <p className="text-orange-400 text-sm">
                        Current: {goal.current_value} / {goal.target_value} {goal.unit}
                      </p>
                      {goal.deadline && (
                        <div className="text-xs text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setShowLogForm(true)}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Progress
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Entry Form */}
      {showLogForm && (
        <Card className="bg-orange-900/20 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
              Log Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-orange-200">Select Goal</Label>
              <div className="grid grid-cols-1 gap-2">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGoal?.id === goal.id 
                        ? 'border-orange-500 bg-orange-500/20' 
                        : 'border-gray-600 bg-gray-800/50 hover:border-orange-500/50'
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{goal.title}</span>
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Target: {goal.target_value} {goal.unit} • {getFrequencyText(goal.frequency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selectedGoal && (
              <>
                <div className="space-y-2">
                  <Label className="text-orange-200">Progress Value</Label>
                  <Input
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    placeholder={`Enter value in ${selectedGoal.unit}`}
                    className="bg-orange-800/30 border-orange-500/50 text-white placeholder:text-orange-300/50"
                    type="number"
                    step="0.1"
                  />
                  <p className="text-xs text-orange-300/70">
                    {selectedGoal.goal_type === 'habit' 
                      ? `Enter today's progress (e.g., steps taken, minutes exercised)`
                      : `Enter your current measurement in ${selectedGoal.unit}`
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-orange-200">Notes (Optional)</Label>
                  <Textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="How did it feel? Any improvements or challenges?"
                    className="bg-orange-800/30 border-orange-500/50 text-white placeholder:text-orange-300/50 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddLog}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? 'Logging...' : 'Log Progress'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowLogForm(false);
                      setSelectedGoal(null);
                      setLogValue('');
                      setLogNotes('');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress History */}
      {goalLogs.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-400" />
              Recent Progress Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goalLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{log.goal_title}</h4>
                    <p className="text-orange-400 font-mono text-lg">{log.value}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{new Date(log.logged_date).toLocaleDateString()}</div>
                  </div>
                </div>
                {log.notes && (
                  <p className="text-gray-300 text-sm mt-2 italic">"{log.notes}"</p>
                )}
              </div>
            ))}
            
            {goalLogs.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" className="text-orange-400 hover:text-orange-300">
                  View All Progress ({goalLogs.length} total)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalProgressLogger;
