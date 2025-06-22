
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInformationProps {
  profile: {
    weight: string;
    birthday: string;
    height: string;
    heightFeet: string;
    heightInches: string;
  };
  preferences: {
    weight_unit: 'kg' | 'lbs';
    height_unit: 'cm' | 'ft-in' | 'in';
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
  const handleHeightFeetChange = (value: string) => {
    if (value === '' || /^\d*$/.test(value)) {
      const numValue = parseInt(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 9)) {
        onInputChange('heightFeet', value);
      }
    }
  };

  const handleHeightInchesChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 11.99)) {
        onInputChange('heightInches', value);
      }
    }
  };

  const handleHeightChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 300)) {
        onHeightChange(value);
      }
    }
  };

  const handleWeightChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 1000)) {
        onWeightChange(value);
      }
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Basic Information</CardTitle>
        <CardDescription>
          Your physical stats for accurate calculations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-foreground">
            Weight ({preferences.weight_unit})
          </Label>
          <Input
            id="weight"
            type="text"
            placeholder={preferences.weight_unit === 'kg' ? '80' : '180'}
            value={getWeightDisplay()}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="bg-background border-border text-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthday" className="text-foreground">Birthday</Label>
          <Input
            id="birthday"
            type="date"
            value={profile.birthday}
            onChange={(e) => onInputChange('birthday', e.target.value)}
            className="bg-background border-border text-foreground"
          />
          {calculatedAge !== null && (
            <p className="text-sm text-muted-foreground">Current age: {calculatedAge} years</p>
          )}
        </div>
        
        {preferences.height_unit === 'ft-in' ? (
          <div className="space-y-2">
            <Label className="text-foreground">Height</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="5"
                  value={profile.heightFeet}
                  onChange={(e) => handleHeightFeetChange(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <Label className="text-xs text-muted-foreground">feet</Label>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="10"
                  value={profile.heightInches}
                  onChange={(e) => handleHeightInchesChange(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <Label className="text-xs text-muted-foreground">inches</Label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="height" className="text-foreground">
              Height ({preferences.height_unit})
            </Label>
            <Input
              id="height"
              type="text"
              placeholder={preferences.height_unit === 'cm' ? '175' : '70'}
              value={getHeightDisplay()}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInformation;
