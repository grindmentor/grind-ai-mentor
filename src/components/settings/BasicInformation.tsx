
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar } from "lucide-react";

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
      </CardContent>
    </Card>
  );
};

export default BasicInformation;
