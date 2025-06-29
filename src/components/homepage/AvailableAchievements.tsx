
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, Star } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('available_achievements')
          .select('*')
          .eq('is_active', true)
          .limit(6)
          .order('points', { ascending: false });

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableAchievements();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target;
      case 'zap': return Zap;
      case 'star': return Star;
      default: return Trophy;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return 'bg-blue-500/20 text-blue-400';
      case 'nutrition': return 'bg-green-500/20 text-green-400';
      case 'consistency': return 'bg-purple-500/20 text-purple-400';
      case 'milestone': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Available Achievements
          </span>
        </h2>
        <p className="text-gray-400">
          Unlock these achievements by completing fitness milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = getIconComponent(achievement.icon_name);
          
          return (
            <Card key={achievement.id} className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-sm font-medium">
                        {achievement.title}
                      </CardTitle>
                      <Badge className={getCategoryColor(achievement.category)}>
                        {achievement.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-bold text-sm">
                      {achievement.points} pts
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-400 text-xs leading-relaxed">
                  {achievement.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AvailableAchievements;
