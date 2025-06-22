
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UnitPreferencesProps {
  preferences: {
    weight_unit: 'kg' | 'lbs';
    height_unit: 'cm' | 'ft-in' | 'in';
  };
  onPreferenceChange: (field: string, value: any) => void;
}

const UnitPreferences = ({ preferences, onPreferenceChange }: UnitPreferencesProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Unit Preferences</CardTitle>
        <CardDescription>
          Choose your preferred units for measurements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Weight Unit</Label>
          <Select value={preferences.weight_unit} onValueChange={(value: 'kg' | 'lbs') => onPreferenceChange('weight_unit', value)}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-foreground">Height Unit</Label>
          <Select value={preferences.height_unit} onValueChange={(value: 'cm' | 'ft-in' | 'in') => onPreferenceChange('height_unit', value)}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="ft-in">Feet & Inches (5'10")</SelectItem>
              <SelectItem value="in">Inches only</SelectItem>
              <SelectItem value="cm">Centimeters (cm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitPreferences;
