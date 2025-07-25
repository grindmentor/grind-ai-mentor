
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingDown, Minus, TrendingUp } from 'lucide-react';

interface FitnessGoalSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const FitnessGoalSelector: React.FC<FitnessGoalSelectorProps> = ({
  value,
  onValueChange,
  className
}) => {
  const goals = [
    {
      value: 'cut',
      label: 'Cut',
      description: 'Lose weight while preserving muscle mass',
      icon: <TrendingDown className="w-4 h-4" />
    },
    {
      value: 'maintenance',
      label: 'Maintenance', 
      description: 'Maintain current weight and body composition',
      icon: <Minus className="w-4 h-4" />
    },
    {
      value: 'bulk',
      label: 'Weight Gain/Bulk',
      description: 'Gain weight and build muscle mass',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-orange-400" />
            <SelectValue placeholder="Select your fitness goal" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {goals.map((goal) => (
            <SelectItem key={goal.value} value={goal.value} className="text-white hover:bg-gray-700">
              <div className="flex items-center space-x-3">
                <div className="text-orange-400">
                  {goal.icon}
                </div>
                <div>
                  <div className="font-medium">{goal.label}</div>
                  <div className="text-sm text-gray-400">{goal.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Show selected goal description below selector */}
      {value && (
        <div className="text-sm text-gray-400 mt-2 pl-6">
          {goals.find(g => g.value === value)?.description}
        </div>
      )}
    </div>
  );
};

export default FitnessGoalSelector;
