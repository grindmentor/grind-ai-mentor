
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Dumbbell, Apple, CalendarCheck, Camera } from 'lucide-react';
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

const iconMap: Record<string, React.ComponentType<any>> = {
  'trophy': Trophy,
  'target': Target,
  'dumbbell': Dumbbell,
  'apple': Apple,
  'calendar-check': CalendarCheck,
  'camera': Camera,
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Goals': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const AvailableAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('available_achievements')
        .select('*')
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">🏆 Available Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="bg-gray-900/40 border-gray-700/50 animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent mb-2">
          🏆 Available Achievements
        </h2>
        <p className="text-gray-400">Complete these challenges to earn points and unlock rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon_name] || Target;
          
          return (
            <Card key={achievement.id} className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/60 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/30 to-yellow-500/30 rounded-xl flex items-center justify-center border border-orange-500/30">
                    <IconComponent className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{achievement.title}</h3>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {achievement.description}
                    </p>
                    <Badge className={`${getCategoryColor(achievement.category)} text-xs`}>
                      {achievement.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Sign up to start tracking your achievements and compete with others!
        </p>
      </div>
    </div>
  );
};

export default AvailableAchievements;
