
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Target, Activity, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BasicInformationProps {
  profile: {
    weight: string;
    birthday: string;
    height: string;
    heightFeet: string;
    heightInches: string;
    experience: string;
    activity: string;
    goal: string;
  };
  preferences: {
    weight_unit: string;
    height_unit: string;
  };
  calculatedAge: number | null;
  onInputChange: (field: string, value: string) => void;
  onWeightChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  getWeightDisplay: () => string;
  getHeightDisplay: () => string;
}

// Function to format goal display
const formatGoal = (goal: string) => {
  const goalMap: { [key: string]: string } = {
    'lose_weight': 'Lose Weight',
    'gain_weight': 'Gain Weight',
    'maintain_weight': 'Maintain Weight',
    'build_muscle': 'Build Muscle',
    'cut': 'Cut',
    'bulk': 'Bulk',
    'maintain': 'Maintain',
    'recomp': 'Body Recomposition'
  };
  
  return goalMap[goal] || goal.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Function to format activity level
const formatActivityLevel = (activity: string) => {
  const activityMap: { [key: string]: string } = {
    'sedentary': 'Sedentary',
    'lightly_active': 'Lightly Active',
    'moderately_active': 'Moderately Active',
    'very_active': 'Very Active',
    'extremely_active': 'Extremely Active'
  };
  
  return activityMap[activity] || activity.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Goal tooltips
const getGoalTooltip = (goal: string) => {
  const tooltips: { [key: string]: string } = {
    'cut': 'Fat loss while maintaining strength and muscle mass',
    'bulk': 'Muscle gain with controlled fat gain',
    'maintain': 'Maintain current weight and body composition',
    'lose_weight': 'Primary focus on reducing overall body weight',
    'gain_weight': 'Primary focus on increasing overall body weight',
    'build_muscle': 'Focus on increasing muscle mass',
    'recomp': 'Simultaneously lose fat and gain muscle'
  };
  
  return tooltips[goal] || 'Your primary fitness goal';
};

const BasicInformation = ({
  profile,
  preferences,
  calculatedAge,
  onInputChange,
  onWeightChange,
  onHeightChange,
  getWeightDisplay,
  getHeightDisplay
}: BasicInformationProps) => {
  return (
    <TooltipProvider>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-orange-500" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your personal details for accurate fitness recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-white mb-2">
                Weight ({preferences.weight_unit})
              </label>
              <Input
                id="weight"
                value={getWeightDisplay()}
                onChange={(e) => onWeightChange(e.target.value)}
                placeholder={`Enter weight in ${preferences.weight_unit}`}
                className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-white mb-2">
                Height ({preferences.height_unit})
              </label>
              <Input
                id="height"
                value={getHeightDisplay()}
                onChange={(e) => onHeightChange(e.target.value)}
                placeholder={`Enter height in ${preferences.height_unit}`}
                className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-white mb-2">
              Birthday
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="birthday"
                type="date"
                value={profile.birthday}
                onChange={(e) => onInputChange('birthday', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
              />
              {calculatedAge && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Age: {calculatedAge}
                </Badge>
              )}
            </div>
          </div>

          {/* Current Goal Display */}
          {profile.goal && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Primary Goal
              </label>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center text-sm px-3 py-2">
                  <Target className="w-4 h-4 mr-2" />
                  {formatGoal(profile.goal)}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{getGoalTooltip(profile.goal)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Activity Level Display */}
          {profile.activity && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Activity Level
              </label>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center text-sm px-3 py-2">
                  <Activity className="w-4 h-4 mr-2" />
                  {formatActivityLevel(profile.activity)}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Your daily activity level affects calorie calculations</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default BasicInformation;
