
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoalLog {
  id: string;
  goalTitle: string;
  logEntry: string;
  value?: string;
  date: string;
  notes?: string;
}

interface Goal {
  id: string;
  title: string;
  target: string;
  category: string;
  deadline?: string;
}

const GoalProgressLogger = () => {
  const { toast } = useToast();
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Run 3km faster',
      target: 'Under 15 minutes',
      category: 'Cardio',
      deadline: '2024-12-31'
    },
    {
      id: '2',
      title: 'Bench Press 100kg',
      target: '100kg for 1 rep',
      category: 'Strength',
      deadline: '2024-11-30'
    },
    {
      id: '3',
      title: 'Lose 10kg',
      target: '10kg weight loss',
      category: 'Weight Loss',
      deadline: '2024-10-15'
    }
  ]);
  
  const [goalLogs, setGoalLogs] = useState<GoalLog[]>([
    {
      id: '1',
      goalTitle: 'Run 3km faster',
      logEntry: '3km run completed',
      value: '14:20',
      date: new Date().toISOString().split('T')[0],
      notes: 'Felt good, slight improvement from last week'
    }
  ]);
  
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [logValue, setLogValue] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const handleAddLog = () => {
    if (!selectedGoal || !logValue.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a goal and enter a value.',
        variant: 'destructive'
      });
      return;
    }

    const newLog: GoalLog = {
      id: Date.now().toString(),
      goalTitle: selectedGoal.title,
      logEntry: `Progress update for ${selectedGoal.title}`,
      value: logValue,
      date: new Date().toISOString().split('T')[0],
      notes: logNotes
    };

    setGoalLogs(prev => [newLog, ...prev]);
    
    // Reset form
    setLogValue('');
    setLogNotes('');
    setSelectedGoal(null);
    setShowLogForm(false);

    toast({
      title: 'Progress Logged! 📈',
      description: `Added new progress entry for "${selectedGoal.title}"`
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardio': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'strength': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'weight loss': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'nutrition': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getGoalProgress = (goalTitle: string) => {
    return goalLogs.filter(log => log.goalTitle === goalTitle);
  };

  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-400" />
            My Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const progress = getGoalProgress(goal.title);
              return (
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
                    <p className="text-gray-400 text-xs">{goal.target}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {progress.length} log{progress.length !== 1 ? 's' : ''}
                      </span>
                      {goal.deadline && (
                        <span className="text-orange-400">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {progress.length > 0 && (
                      <div className="text-xs text-green-400">
                        Latest: {progress[0].value} ({new Date(progress[0].date).toLocaleDateString()})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => setShowLogForm(true)}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Progress
          </Button>
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
                    <p className="text-gray-400 text-sm mt-1">{goal.target}</p>
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
                    placeholder="e.g., 14:20, 95kg, 2.5km, etc."
                    className="bg-orange-800/30 border-orange-500/50 text-white placeholder:text-orange-300/50"
                  />
                  <p className="text-xs text-orange-300/70">
                    Enter your measurement, time, weight, or other progress indicator
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
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Progress
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
              Recent Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goalLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{log.goalTitle}</h4>
                    <p className="text-orange-400 font-mono text-lg">{log.value}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString()}</div>
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
