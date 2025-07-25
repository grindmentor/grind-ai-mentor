import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface DietCuesDisplayProps {
  dietType: string;
  goal: string;
  className?: string;
}

export const DietCuesDisplay: React.FC<DietCuesDisplayProps> = ({
  dietType,
  goal,
  className = ""
}) => {
  const getCues = (diet: string, goalType: string) => {
    const baseCues = ['High Protein'];
    
    // Add goal-specific cues
    if (goalType.includes('weight-loss') || goalType.includes('cut')) {
      baseCues.push('Muscle Retention', 'Fat Loss');
    } else if (goalType.includes('weight-gain') || goalType.includes('bulk') || goalType.includes('muscle-gain')) {
      baseCues.push('Muscle Growth', 'Caloric Surplus');
    } else if (goalType.includes('maintenance')) {
      baseCues.push('Muscle Maintenance', 'Body Composition');
    } else if (goalType.includes('performance')) {
      baseCues.push('Energy Optimization', 'Recovery');
    }
    
    // Add diet-specific cues
    if (diet.includes('keto')) {
      baseCues.push('Low Carb', 'Ketosis');
    } else if (diet.includes('vegetarian')) {
      baseCues.push('Plant-Based Protein', 'Complete Amino Acids');
    } else if (diet.includes('vegan')) {
      baseCues.push('Plant Protein', 'B12 Focus');
    } else if (diet.includes('paleo')) {
      baseCues.push('Whole Foods', 'Anti-Inflammatory');
    } else if (diet.includes('balanced')) {
      baseCues.push('Macronutrient Balance', 'Micronutrient Dense');
    }
    
    return [...new Set(baseCues)]; // Remove duplicates
  };

  const cues = getCues(dietType, goal);

  if (!dietType && !goal) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <Info className="w-4 h-4" />
        <span>Plan Focus:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {cues.map((cue, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30 transition-colors"
          >
            {cue}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default DietCuesDisplay;