
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Apple, Camera, CalendarCheck, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon_name: string;
  unlock_criteria: any;
}

const AvailableAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableAchievements();
  }, []);

  const loadAvailableAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('available_achievements')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'dumbbell': return Dumbbell;
      case 'calendar-check': return CalendarCheck;
      case 'apple': return Apple;
      case 'target': return Target;
      case 'camera': return Camera;
      default: return Trophy;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Goals': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Progress': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Available Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.slice(0, 5).map((achievement) => {
          const IconComponent = getAchievementIcon(achievement.icon_name);
          return (
            <div key={achievement.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-medium text-sm">{achievement.title}</h4>
                    <Badge className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">{achievement.description}</p>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    +{achievement.points} pts
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
        {achievements.length > 5 && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">+{achievements.length - 5} more achievements to unlock</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableAchievements;
