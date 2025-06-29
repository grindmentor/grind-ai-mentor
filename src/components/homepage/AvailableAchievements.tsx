
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon_name: string;
}

const AvailableAchievements: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableAchievements();
    if (user) {
      loadUserAchievements();
    }
  }, [user]);

  const loadAvailableAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('available_achievements')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false })
        .limit(6);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('title')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserAchievements(data?.map(a => a.title) || []);
    } catch (error) {
      console.error('Error loading user achievements:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'star': return Star;
      case 'target': return Target;
      case 'zap': return Zap;
      default: return Trophy;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400';
      case 'Nutrition': return 'bg-green-500/20 text-green-400';
      case 'Progress': return 'bg-purple-500/20 text-purple-400';
      case 'Consistency': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (achievements.length === 0) return null;

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Available Achievements
        </CardTitle>
        <CardDescription className="text-gray-400">
          Unlock these achievements as you progress on your fitness journey
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon_name);
            const isUnlocked = userAchievements.includes(achievement.title);
            
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  isUnlocked 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-gray-800/30 border-gray-700/50 hover:border-orange-500/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isUnlocked ? 'bg-green-500/20' : 'bg-gray-700/50'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      isUnlocked ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium text-sm ${
                        isUnlocked ? 'text-green-400' : 'text-white'
                      }`}>
                        {achievement.title}
                      </h3>
                      {isUnlocked && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(achievement.category)}>
                        {achievement.category}
                      </Badge>
                      <span className="text-xs text-yellow-400 font-medium">
                        {achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableAchievements;
