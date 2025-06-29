
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Target, Dumbbell, CalendarCheck, Apple, Camera } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon_name: string;
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  dumbbell: Dumbbell,
  'calendar-check': CalendarCheck,
  apple: Apple,
  camera: Camera
};

const AvailableAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('available_achievements')
          .select('*')
          .eq('is_active', true)
          .limit(6);

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400';
      case 'Nutrition': return 'bg-green-500/20 text-green-400';
      case 'Progress': return 'bg-purple-500/20 text-purple-400';
      case 'Goals': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8 bg-gray-900/20 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Unlock Achievements
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Track your progress and earn rewards for reaching fitness milestones
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon_name as keyof typeof iconMap] || Trophy;
          
          return (
            <Card 
              key={achievement.id}
              className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 p-3 sm:p-4"
            >
              <CardContent className="p-0 text-center">
                <div className="text-orange-500 mb-2 sm:mb-3 flex justify-center">
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1 sm:mb-2">{achievement.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-2">{achievement.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(achievement.category)}>
                    {achievement.category}
                  </Badge>
                  <span className="text-orange-400 text-xs font-medium">{achievement.points} pts</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AvailableAchievements;
