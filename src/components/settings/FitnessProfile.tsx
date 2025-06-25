
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface FitnessProfileProps {
  profile: {
    experience: string;
    activity: string;
    goal: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const FitnessProfile = ({ profile, onInputChange }: FitnessProfileProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-500" />
          Fitness Profile
        </CardTitle>
        <CardDescription>
          Tell us about your fitness background and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Fitness Experience
          </label>
          <Select value={profile.experience} onValueChange={(value) => onInputChange('experience', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="beginner" className="text-white hover:bg-gray-700">Beginner (0-1 years)</SelectItem>
              <SelectItem value="intermediate" className="text-white hover:bg-gray-700">Intermediate (1-3 years)</SelectItem>
              <SelectItem value="advanced" className="text-white hover:bg-gray-700">Advanced (3+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Activity Level
          </label>
          <Select value={profile.activity} onValueChange={(value) => onInputChange('activity', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
              <SelectValue placeholder="Select your activity level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="sedentary" className="text-white hover:bg-gray-700">Sedentary (desk job, no exercise)</SelectItem>
              <SelectItem value="lightly_active" className="text-white hover:bg-gray-700">Lightly Active (light exercise 1-3 days/week)</SelectItem>
              <SelectItem value="moderately_active" className="text-white hover:bg-gray-700">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
              <SelectItem value="very_active" className="text-white hover:bg-gray-700">Very Active (hard exercise 6-7 days/week)</SelectItem>
              <SelectItem value="extremely_active" className="text-white hover:bg-gray-700">Extremely Active (very hard exercise, physical job)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Primary Goal
          </label>
          <Select value={profile.goal} onValueChange={(value) => onInputChange('goal', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="lose_weight" className="text-white hover:bg-gray-700">Lose Weight</SelectItem>
              <SelectItem value="gain_muscle" className="text-white hover:bg-gray-700">Gain Muscle</SelectItem>
              <SelectItem value="maintain_weight" className="text-white hover:bg-gray-700">Maintain Weight</SelectItem>
              <SelectItem value="improve_strength" className="text-white hover:bg-gray-700">Improve Strength</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessProfile;
