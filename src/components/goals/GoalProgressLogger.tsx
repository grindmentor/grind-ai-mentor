
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface GoalProgressLoggerProps {
  goal: Goal;
  onProgressUpdated: () => void;
}

export const GoalProgressLogger: React.FC<GoalProgressLoggerProps> = ({
  goal,
  onProgressUpdated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [progressValue, setProgressValue] = useState('');
  const [notes, setNotes] = useState('');
  const [recentEntries, setRecentEntries] = useState<GoalProgressEntry[]>([]);

  const handleLogProgress = async () => {
    if (!user || !progressValue.trim()) return;

    setIsLogging(true);
    try {
      const numericValue = parseFloat(progressValue);
      if (isNaN(numericValue)) {
        toast({
          title: 'Invalid Value',
          description: 'Please enter a valid number',
          variant: 'destructive'
        });
        return;
      }

      // Add to progress entries (mock for now)
      const newEntry: GoalProgressEntry = {
        id: Date.now().toString(),
        goal_id: goal.id,
        value: numericValue,
        notes: notes.trim() || undefined,
        logged_at: new Date().toISOString()
      };

      setRecentEntries(prev => [newEntry, ...prev.slice(0, 4)]);

      // Update goal's current value
      const updatedValue = Math.max(goal.current_value, numericValue);
      
      const { error } = await supabase
        .from('user_goals')
        .update({ current_value: updatedValue })
        .eq('id', goal.id);

      if (error) throw error;

      setProgressValue('');
      setNotes('');
      onProgressUpdated();
      
      toast({
        title: 'Progress Logged! 📈',
        description: `Added progress entry: ${numericValue} ${goal.unit || ''}`
      });
    } catch (error) {
      console.error('Error logging progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to log progress',
        variant: 'destructive'
      });
    } finally {
      setIsLogging(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/30 backdrop-blur-sm border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-blue-200 text-lg flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Log Progress: {goal.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Progress */}
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">Current Progress</span>
            <Badge className="bg-blue-500/20 text-blue-300">
              {((goal.current_value / goal.target_value) * 100).toFixed(1)}%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Log New Progress */}
        <div className="space-y-3">
          <div>
            <Label className="text-blue-200">Progress Value</Label>
            <Input
              type="number"
              step="0.1"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
              placeholder={`Enter ${goal.unit || 'value'}`}
              className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50"
            />
          </div>
          
          <div>
            <Label className="text-blue-200">Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this progress..."
              className="bg-blue-900/30 border-blue-500/50 text-white placeholder:text-blue-300/50 resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleLogProgress}
            disabled={isLogging || !progressValue.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLogging ? 'Logging...' : 'Log Progress'}
          </Button>
        </div>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <div>
            <h4 className="text-blue-200 font-medium mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Recent Entries
            </h4>
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="p-2 bg-blue-900/20 rounded border border-blue-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-blue-300 font-medium">{entry.value} {goal.unit}</span>
                      {entry.notes && (
                        <p className="text-blue-200/70 text-sm mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <span className="text-blue-400/60 text-xs">{formatDate(entry.logged_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalProgressLogger;
