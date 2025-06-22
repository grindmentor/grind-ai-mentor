
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Fitness Profile</CardTitle>
        <CardDescription>
          Your experience and goals for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Experience Level</Label>
          <Select value={profile.experience} onValueChange={(value) => onInputChange('experience', value)}>
            <SelectTrigger className="bg-background border-border text-foreground h-12 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 z-50">
              <SelectItem value="beginner" className="text-white hover:bg-gray-700 focus:bg-gray-700">Beginner (0-1 years)</SelectItem>
              <SelectItem value="intermediate" className="text-white hover:bg-gray-700 focus:bg-gray-700">Intermediate (2-4 years)</SelectItem>
              <SelectItem value="advanced" className="text-white hover:bg-gray-700 focus:bg-gray-700">Advanced (5+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-foreground">Activity Level</Label>
          <Select value={profile.activity} onValueChange={(value) => onInputChange('activity', value)}>
            <SelectTrigger className="bg-background border-border text-foreground h-12 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 z-50">
              <SelectItem value="sedentary" className="text-white hover:bg-gray-700 focus:bg-gray-700">Sedentary (little/no exercise)</SelectItem>
              <SelectItem value="lightly_active" className="text-white hover:bg-gray-700 focus:bg-gray-700">Lightly active (1-3 days/week)</SelectItem>
              <SelectItem value="moderately_active" className="text-white hover:bg-gray-700 focus:bg-gray-700">Moderately active (3-5 days/week)</SelectItem>
              <SelectItem value="very_active" className="text-white hover:bg-gray-700 focus:bg-gray-700">Very active (6-7 days/week)</SelectItem>
              <SelectItem value="extra_active" className="text-white hover:bg-gray-700 focus:bg-gray-700">Extra active (2x/day, intense)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-foreground">Primary Goal</Label>
          <Select value={profile.goal} onValueChange={(value) => onInputChange('goal', value)}>
            <SelectTrigger className="bg-background border-border text-foreground h-12 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <SelectValue placeholder="Select your goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 z-50">
              <SelectItem value="maintain" className="text-white hover:bg-gray-700 focus:bg-gray-700">Maintain Weight</SelectItem>
              <SelectItem value="bulk" className="text-white hover:bg-gray-700 focus:bg-gray-700">Bulk (Gain Muscle)</SelectItem>
              <SelectItem value="cut" className="text-white hover:bg-gray-700 focus:bg-gray-700">Cut (Lose Fat)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessProfile;
