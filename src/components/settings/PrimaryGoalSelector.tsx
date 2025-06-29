
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Target, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PrimaryGoalSelector = () => {
  const { user } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const goals = [
    {
      id: 'cut',
      label: 'Cut',
      description: 'Lose weight and reduce body fat',
      icon: TrendingDown,
      color: 'text-red-400'
    },
    {
      id: 'bulk',
      label: 'Bulk',
      description: 'Gain weight and build muscle mass',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      description: 'Maintain current weight and body composition',
      icon: Minus,
      color: 'text-blue-400'
    }
  ];

  useEffect(() => {
    if (user) {
      loadCurrentGoal();
    }
  }, [user]);

  const loadCurrentGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('goal')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading goal:', error);
      } else if (data?.goal) {
        setSelectedGoal(data.goal.toLowerCase());
      }
    } catch (error) {
      console.error('Error in loadCurrentGoal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = async (value: string) => {
    if (!user) return;
    
    setSelectedGoal(value);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          goal: value.charAt(0).toUpperCase() + value.slice(1),
          email: user.email || ''
        });

      if (error) throw error;
      toast.success('Primary goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update primary goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/40 border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/40 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-400" />
          Primary Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedGoal}
          onValueChange={handleGoalChange}
          disabled={saving}
        >
          <div className="space-y-4">
            {goals.map((goal) => {
              const IconComponent = goal.icon;
              return (
                <div key={goal.id} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={goal.id}
                    id={goal.id}
                    className="border-gray-600 text-orange-500"
                  />
                  <Label
                    htmlFor={goal.id}
                    className="flex items-center space-x-3 cursor-pointer flex-1 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 ${goal.color}`} />
                    </div>
                    <div>
                      <div className="text-white font-medium">{goal.label}</div>
                      <div className="text-gray-400 text-sm">{goal.description}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PrimaryGoalSelector;
