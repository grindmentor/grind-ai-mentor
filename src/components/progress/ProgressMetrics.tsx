import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Award, 
  Gauge, 
  Flame, 
  Timer, 
  Scale,
  TrendingUp,
  Target,
  Plus
} from 'lucide-react';

interface ProgressMetricsProps {
  metrics: {
    overallProgress: number;
    totalWorkouts: number;
    averageSleep: number;
    activeGoals: number;
    weeklyVolume: number;
    consistency: number;
    strengthGain: number;
  };
  onAddGoal?: () => void;
  onViewWorkouts?: () => void;
}

export const ProgressMetrics: React.FC<ProgressMetricsProps> = ({ 
  metrics, 
  onAddGoal, 
  onViewWorkouts 
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-600/5 border-green-500/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <span>Weekly Performance</span>
              </div>
              <Button size="sm" variant="outline" onClick={onViewWorkouts}>
                View All
              </Button>
            </CardTitle>
            <CardDescription>Your training consistency this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Strength Sessions</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-700">
                {Math.min(4, metrics.totalWorkouts)}/5
              </Badge>
            </div>
            <Progress value={Math.min(80, (metrics.totalWorkouts / 5) * 100)} className="h-3" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Consistency Rate</span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                {metrics.consistency}%
              </Badge>
            </div>
            <Progress value={metrics.consistency} className="h-3" />
          </CardContent>
        </Card>

        {/* Goal Achievements */}
        <Card className="bg-gradient-to-br from-orange-500/5 to-red-600/5 border-orange-500/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span>Active Goals</span>
              </div>
              <Button size="sm" variant="outline" onClick={onAddGoal}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </CardTitle>
            <CardDescription>Current objectives and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.activeGoals > 0 ? (
              <>
                <div className="text-center p-3 bg-orange-500/5 rounded-lg">
                  <div className="text-lg font-bold text-orange-500">{metrics.activeGoals}</div>
                  <div className="text-xs text-muted-foreground">
                    {metrics.activeGoals === 1 ? 'Goal in progress' : 'Goals in progress'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Goals Set</span>
                    <span className="text-xs text-muted-foreground">Keep tracking progress</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center p-2 bg-muted/20 rounded">
                    Track your goals to see progress metrics
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active goals yet</p>
                <p className="text-xs">Set your first goal to start tracking progress</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-600/5 border-blue-500/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-blue-500" />
              <span>Key Metrics</span>
            </CardTitle>
            <CardDescription>Performance indicators and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-blue-500">{metrics.weeklyVolume}k</div>
                <div className="text-xs text-muted-foreground">Weekly Volume</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-green-500">{metrics.consistency}%</div>
                <div className="text-xs text-muted-foreground">Consistency</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-purple-500">{metrics.averageSleep.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">Avg Sleep</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-orange-500">+{metrics.strengthGain}%</div>
                <div className="text-xs text-muted-foreground">Strength Gain</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-yellow-500/5 to-amber-600/5 border-yellow-500/20 hover-scale">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-yellow-500" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Latest accomplishments and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.totalWorkouts > 0 ? (
            <>
              <div className="flex items-center space-x-3 p-2 bg-yellow-500/5 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Completed {metrics.totalWorkouts} training sessions</span>
              </div>
              {metrics.averageSleep > 7 && (
                <div className="flex items-center space-x-3 p-2 bg-green-500/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Maintaining excellent sleep quality</span>
                </div>
              )}
              {metrics.consistency > 80 && (
                <div className="flex items-center space-x-3 p-2 bg-blue-500/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">High consistency streak active</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Start your first workout to see progress</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};