import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Save, X, TrendingUp, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused';
  goal_type: 'target' | 'habit';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
}

interface GoalProgressLoggerProps {
  goal: Goal;
  onBack: () => void;
  onGoalUpdated: () => void;
}

const GoalProgressLogger: React.FC<GoalProgressLoggerProps> = ({ goal, onBack, onGoalUpdated }) => {
  const { user } = useAuth();
  const [progressValue, setProgressValue] = useState('');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogProgress = async () => {
    if (!user || !progressValue) return;

    setIsLogging(true);
    try {
      const newValue = parseFloat(progressValue);
      
      // Insert progress log
      const { error: logError } = await supabase
        .from('goal_progress_logs')
        .insert({
          goal_id: goal.id,
          user_id: user.id,
          value: newValue,
          logged_date: logDate,
          notes: notes || null
        });

      if (logError) throw logError;

      // Update goal's current value
      const { error: updateError } = await supabase
        .from('user_goals')
        .update({ 
          current_value: newValue,
          status: newValue >= goal.target_value && goal.goal_type === 'target' ? 'completed' : 'active'
        })
        .eq('id', goal.id);

      if (updateError) throw updateError;

      toast.success('Progress logged successfully!');
      setProgressValue('');
      setNotes('');
      onGoalUpdated();
    } catch (error) {
      console.error('Error logging progress:', error);
      toast.error('Failed to log progress');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <X className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
        </div>

        {/* Goal Details */}
        <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-orange-400" />
              {goal.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">{goal.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                Progress: {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
              <span className="text-orange-400 font-semibold">
                {Math.min((goal.current_value / goal.target_value) * 100, 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Log Progress */}
        <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-3 text-orange-400" />
              Log Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Value ({goal.unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  placeholder={`Enter ${goal.unit}`}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Date</Label>
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this progress entry..."
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <Button 
              onClick={handleLogProgress} 
              disabled={!progressValue || isLogging}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLogging ? 'Logging...' : 'Log Progress'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoalProgressLogger;